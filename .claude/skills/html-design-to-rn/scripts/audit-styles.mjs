/**
 * Phase 4, Gate A — structural audit.
 * Diffs a screen/component's map file (apps/mobile/design/.extracted/maps/<Name>.json)
 * against the *real, theme-resolved* RN values produced by its generated
 * style file(s), following the property table in references/css-to-rn.md.
 *
 * Usage:
 *   node audit-styles.mjs --map <mapFile> --extract <extractDir> --theme <light|dark> --colors <colorsFile>
 *
 * Exits 0 when every row is PASS/ANNOTATED/SKIP, 1 on any FAIL/UNRESOLVED,
 * 2 on a usage or environment error (bad args, jest crashed, map unreadable).
 */

import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import csstree from 'css-tree';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  const missing = ['map', 'extract', 'theme', 'colors'].filter((k) => !out[k]);
  if (missing.length > 0) {
    console.error(`Usage: audit-styles.mjs --map <file> --extract <dir> --theme <light|dark> --colors <file>`);
    console.error(`Missing: ${missing.join(', ')}`);
    process.exit(2);
  }
  if (out.theme !== 'light' && out.theme !== 'dark') {
    console.error(`--theme must be "light" or "dark", got "${out.theme}"`);
    process.exit(2);
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSS declaration index — parse app.css once, look up by exact selector text.
// ---------------------------------------------------------------------------

function buildDeclarationIndex(cssText) {
  const index = new Map();
  let ast;
  try {
    ast = csstree.parse(cssText);
  } catch (err) {
    console.error(`Could not parse app.css: ${err.message}`);
    process.exit(2);
  }
  csstree.walk(ast, (node) => {
    if (node.type !== 'Rule') return;
    const selectors = csstree.generate(node.prelude).split(',').map((s) => s.trim());
    const decls = new Map();
    csstree.walk(node.block, (d) => {
      if (d.type === 'Declaration') decls.set(d.property, csstree.generate(d.value));
    });
    for (const sel of selectors) {
      const existing = index.get(sel);
      if (existing) {
        for (const [k, v] of decls) existing.set(k, v);
      } else {
        index.set(sel, new Map(decls));
      }
    }
  });
  return index;
}

// ---------------------------------------------------------------------------
// Selector grammar — see references/css-to-rn.md "Selector grammar"
// ---------------------------------------------------------------------------

const INLINE_DECL_RE = /([a-z-]+)\s*:\s*((?:[^;,()]|\([^)]*\))+)/g;

function parseInlineDecls(text) {
  const decls = new Map();
  let m;
  const re = new RegExp(INLINE_DECL_RE);
  while ((m = re.exec(text))) decls.set(m[1].trim(), m[2].trim());
  return decls;
}

/** Extract a balanced `(<label>: ...)` span, if present, and the text before/after it. */
function extractMarker(text, label) {
  const marker = `(${label}:`;
  const markerIdx = text.indexOf(marker);
  if (markerIdx === -1) return { rest: text.trim(), content: null };
  let depth = 0;
  let end = -1;
  for (let i = markerIdx; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return { rest: text.trim(), content: null };
  const content = text.slice(markerIdx + marker.length, end);
  const rest = (text.slice(0, markerIdx) + text.slice(end + 1)).trim();
  return { rest, content };
}

function resolveSelectorSpec(selector, cssIndex) {
  const trimmed = selector.trim();
  if (/^no design source\b/i.test(trimmed)) {
    return { skip: true, reason: trimmed };
  }
  const { rest: afterOnly, content: onlyContent } = extractMarker(trimmed, 'only');
  const { rest: base, content: inline } = extractMarker(afterOnly, 'inline');
  const decls = new Map();
  if (base) {
    const baseDecls = cssIndex.get(base);
    if (baseDecls) for (const [k, v] of baseDecls) decls.set(k, v);
  }
  if (inline !== null) {
    for (const [k, v] of parseInlineDecls(inline)) decls.set(k, v);
  } else if (!base) {
    return { skip: true, reason: `unparseable selector: "${selector}"` };
  }
  if (decls.size === 0) {
    return { skip: true, reason: `no CSS rule found for "${base}" and no inline override` };
  }
  if (onlyContent !== null) {
    const allowed = new Set(onlyContent.split(',').map((p) => p.trim()));
    for (const k of decls.keys()) if (!allowed.has(k)) decls.delete(k);
    if (decls.size === 0) {
      return { skip: true, reason: `"(only: ${onlyContent})" matched none of "${base}"'s declared properties` };
    }
  }
  return { skip: false, decls };
}

// ---------------------------------------------------------------------------
// var(--x) resolution against the extract's classified tokens
// ---------------------------------------------------------------------------

/**
 * The token table moved out of `inventory.json` into `styles/tokens.json` so
 * every phase stopped paying 60 KB for an index it mostly didn't use. The
 * inline fallback keeps this working against an extract produced before that
 * split, rather than silently resolving nothing and reporting every value as
 * `unresolved`.
 */
function buildVarMap(inventory, extractDir) {
  const map = new Map();
  let classified = inventory.tokens?.classified;
  if (!classified && inventory.tokens?.file) {
    try {
      classified = JSON.parse(fs.readFileSync(path.join(extractDir, inventory.tokens.file), 'utf8')).classified;
    } catch {
      classified = null;
    }
  }
  for (const t of classified ?? []) map.set(t.name, { light: t.light, dark: t.dark });
  return map;
}

const VAR_RE = /var\((--[a-z0-9-]+)\)/gi;

function resolveValue(raw, varMap, theme) {
  let unresolved = null;
  const resolved = raw.replace(VAR_RE, (_, name) => {
    const entry = varMap.get(name);
    if (!entry) {
      unresolved = name;
      return _;
    }
    return entry[theme];
  });
  return { resolved, unresolved };
}

// ---------------------------------------------------------------------------
// Property table — references/css-to-rn.md is the source of truth this mirrors
// ---------------------------------------------------------------------------

const IGNORED_SET = new Set([
  'display', 'font-family', 'white-space', 'text-overflow', 'cursor', 'transition',
  'outline', 'box-sizing', 'content', 'appearance', 'scroll-behavior', 'user-select',
  'will-change', 'animation', 'animation-name', 'animation-duration',
  'animation-timing-function', 'animation-delay', 'animation-iteration-count',
  'animation-fill-mode', 'visibility'
]);

const ANNOTATABLE_BASE = new Set(['box-shadow', 'filter', 'backdrop-filter', 'transform']);

const FOUR_SIDE_ORDER = ['Top', 'Right', 'Bottom', 'Left'];
const FOUR_CORNER_ORDER = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'];

/** Split on whitespace, but never inside balanced parens (`calc(1px + 2px)` is one token). */
function splitTopLevelWhitespace(value) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of value.trim()) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (/\s/.test(ch) && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** CSS's 1/2/3/4-value shorthand expansion rule, shared by margin/padding/border-*. */
function expandFourValue(rawValue, order) {
  const parts = splitTopLevelWhitespace(rawValue);
  let vals;
  if (parts.length === 1) vals = [parts[0], parts[0], parts[0], parts[0]];
  else if (parts.length === 2) vals = [parts[0], parts[1], parts[0], parts[1]];
  else if (parts.length === 3) vals = [parts[0], parts[1], parts[2], parts[1]];
  else vals = [parts[0], parts[1], parts[2], parts[3]];
  const out = {};
  order.forEach((side, i) => {
    out[side] = vals[i];
  });
  return out;
}

function toLengthCeil(value) {
  if (/calc\(|env\(/i.test(value)) {
    return { kind: 'skip', reason: 'calc()/env() expression has no static RN equivalent — resolve via SafeAreaView/useSafeAreaInsets, not a static value' };
  }
  if (/%$/.test(value)) return { kind: 'percent', value };
  if (value === 'auto') return { kind: 'literal', value };
  const n = parseFloat(value);
  if (Number.isNaN(n)) return { kind: 'literal', value };
  return { kind: 'scale', px: n, disableCeil: false };
}

function toLengthNoCeil(value) {
  if (/calc\(|env\(/i.test(value)) {
    return { kind: 'skip', reason: 'calc()/env() expression has no static RN equivalent — resolve via SafeAreaView/useSafeAreaInsets, not a static value' };
  }
  if (!/px$/.test(value)) return { kind: 'skip', reason: 'unitless value has no direct RN equivalent — resolve manually' };
  const n = parseFloat(value);
  if (Number.isNaN(n)) return { kind: 'literal', value };
  return { kind: 'scale', px: n, disableCeil: true };
}

function normalizeColor(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '').replace(/(?<![0-9])\.(\d)/g, '0.$1');
}

/**
 * Returns the RN prop name(s) + comparator kind for a CSS property, or null
 * if it's outside the CHECKED table entirely (silently skipped, per
 * css-to-rn.md — "anything not in the table is never read").
 */
function classifyProperty(cssProp, rawValue) {
  if (IGNORED_SET.has(cssProp) || cssProp.startsWith('-webkit-') || cssProp.startsWith('-moz-') || cssProp.startsWith('-ms-') || cssProp.startsWith('-o-')) {
    return { kind: 'ignored' };
  }
  if (ANNOTATABLE_BASE.has(cssProp)) return { kind: 'annotatable' };
  if (cssProp === 'position') {
    if (/^(sticky|fixed)$/.test(rawValue.trim())) return { kind: 'annotatable', cluster: 'position' };
    return { kind: 'string', rnProps: ['position'] };
  }
  if (['top', 'right', 'bottom', 'left'].includes(cssProp)) {
    return { kind: 'length', rnProps: [cssProp], lengthFn: toLengthCeil, zeroDefault: true, clusterWith: 'position' };
  }
  if (cssProp === 'z-index') return { kind: 'number', rnProps: ['zIndex'], clusterWith: 'position' };
  if (cssProp === 'background' || cssProp === 'background-image') {
    if (/gradient\(/i.test(rawValue)) {
      return { kind: 'skip', reason: 'gradient literal — either rendered via a wrapper component (LinearGradient/SVG, invisible to this style-object check) or needs a design-drift[background] annotation if approximated with a flat color; verify visually' };
    }
    if (/^(#|rgb|rgba|hsl)/i.test(rawValue.trim())) return { kind: 'color', rnProps: ['backgroundColor'] };
    return { kind: 'skip', reason: 'background shorthand is not a plain color or gradient — review manually' };
  }
  if (['color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'].includes(cssProp)) {
    if (cssProp === 'border-color') return { kind: 'color-4side', order: FOUR_SIDE_ORDER.map((s) => `border${s}Color`), fallback: 'borderColor' };
    const map = { color: 'color', 'background-color': 'backgroundColor', 'border-top-color': 'borderTopColor', 'border-right-color': 'borderRightColor', 'border-bottom-color': 'borderBottomColor', 'border-left-color': 'borderLeftColor' };
    return { kind: 'color', rnProps: [map[cssProp]] };
  }
  if (cssProp === 'margin' || cssProp === 'padding') {
    return { kind: 'box-4side', order: FOUR_SIDE_ORDER.map((s) => `${cssProp}${s}`), axisPair: [`${cssProp}Vertical`, `${cssProp}Horizontal`], fallback: cssProp, lengthFn: toLengthCeil, zeroDefault: true };
  }
  const sideLonghand = /^(margin|padding)-(top|right|bottom|left)$/.exec(cssProp);
  if (sideLonghand) {
    const side = sideLonghand[2][0].toUpperCase() + sideLonghand[2].slice(1);
    return { kind: 'length', rnProps: [`${sideLonghand[1]}${side}`], lengthFn: toLengthCeil, zeroDefault: true };
  }
  if (['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height'].includes(cssProp)) {
    const rn = cssProp.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return { kind: 'length', rnProps: [rn], lengthFn: toLengthCeil };
  }
  if (cssProp === 'border-width') {
    return { kind: 'box-4side', order: FOUR_SIDE_ORDER.map((s) => `border${s}Width`), fallback: 'borderWidth', lengthFn: toLengthCeil, zeroDefault: true };
  }
  const borderSideWidth = /^border-(top|right|bottom|left)-width$/.exec(cssProp);
  if (borderSideWidth) {
    const side = borderSideWidth[1][0].toUpperCase() + borderSideWidth[1].slice(1);
    return { kind: 'length', rnProps: [`border${side}Width`], lengthFn: toLengthCeil, zeroDefault: true };
  }
  if (cssProp === 'border-radius') {
    return { kind: 'box-4corner', order: FOUR_CORNER_ORDER.map((c) => `border${c}Radius`), fallback: 'borderRadius', lengthFn: toLengthCeil, zeroDefault: true };
  }
  const borderCornerRadius = /^border-(top-left|top-right|bottom-right|bottom-left)-radius$/.exec(cssProp);
  if (borderCornerRadius) {
    const corner = borderCornerRadius[1].split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    return { kind: 'length', rnProps: [`border${corner}Radius`], lengthFn: toLengthCeil, zeroDefault: true };
  }
  if (['gap', 'row-gap', 'column-gap'].includes(cssProp)) {
    const map = { gap: 'gap', 'row-gap': 'rowGap', 'column-gap': 'columnGap' };
    return { kind: 'length', rnProps: [map[cssProp]], lengthFn: toLengthCeil, zeroDefault: true };
  }
  if (cssProp === 'font-size') return { kind: 'length', rnProps: ['fontSize'], lengthFn: toLengthNoCeil };
  if (cssProp === 'line-height') return { kind: 'length', rnProps: ['lineHeight'], lengthFn: toLengthNoCeil };
  if (cssProp === 'letter-spacing') return { kind: 'length', rnProps: ['letterSpacing'], lengthFn: toLengthNoCeil };
  if (cssProp === 'font-weight') return { kind: 'string-num', rnProps: ['fontWeight'] };
  if (cssProp === 'opacity') return { kind: 'number', rnProps: ['opacity'] };
  if (['flex-grow', 'flex-shrink'].includes(cssProp)) {
    const map = { 'flex-grow': 'flexGrow', 'flex-shrink': 'flexShrink' };
    return { kind: 'number', rnProps: [map[cssProp]] };
  }
  if (['flex-direction', 'align-items', 'justify-content', 'flex-wrap', 'align-self', 'text-align'].includes(cssProp)) {
    const rn = cssProp.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return { kind: 'string', rnProps: [rn] };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Design-drift annotation scanning — reads the RAW source text, not the
// compiled module (comments don't survive a require()).
// ---------------------------------------------------------------------------

function scanDriftAnnotations(sourceText, styleKey) {
  const lines = sourceText.split('\n');
  const keyLineRe = new RegExp(`^\\s*${styleKey}\\s*:\\s*\\{`);
  const annotated = new Set();
  for (let i = 0; i < lines.length; i += 1) {
    if (!keyLineRe.test(lines[i])) continue;
    let j = i - 1;
    while (j >= 0 && /^\s*\/\//.test(lines[j])) {
      const m = /design-drift\[([a-z-]+)\]/i.exec(lines[j]);
      if (m) annotated.add(m[1].toLowerCase());
      j -= 1;
    }
    break;
  }
  return annotated;
}

// ---------------------------------------------------------------------------
// Real, theme-resolved RN values — required under Jest, never parsed as text.
// ---------------------------------------------------------------------------

function evaluateStyleFiles(absFiles, theme, projectRoot, metricsFile) {
  const uuid = randomUUID();
  const tmpDir = path.join(projectRoot, 'apps/mobile/design/.extracted/.audit-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const testFile = path.join(tmpDir, `audit-${uuid}.test.js`);
  const outFile = path.join(tmpDir, `audit-${uuid}.out.json`);
  fs.writeFileSync(
    testFile,
    [
      "const fs = require('fs');",
      "const { StyleSheet } = require('react-native');",
      "test('audit', () => {",
      '  const files = JSON.parse(process.env.AUDIT_FILES);',
      '  const theme = process.env.AUDIT_THEME;',
      '  const results = {};',
      '  for (const f of files) {',
      '    // eslint-disable-next-line global-require, import/no-dynamic-require',
      '    const mod = require(f);',
      '    const factory = mod.default || mod;',
      "    const raw = typeof factory === 'function' ? factory(theme) : factory;",
      '    const flat = {};',
      '    for (const k of Object.keys(raw)) flat[k] = StyleSheet.flatten(raw[k]);',
      '    results[f] = flat;',
      '  }',
      '  // eslint-disable-next-line global-require, import/no-dynamic-require',
      `  const { scale } = require(${JSON.stringify(metricsFile)});`,
      '  results.__baseSize = scale(1, true);',
      '  fs.writeFileSync(process.env.AUDIT_OUT_FILE, JSON.stringify(results));',
      '});'
    ].join('\n')
  );
  try {
    execFileSync(
      'npx',
      ['jest', '--config', 'jest.config.js', '--coverage=false', '--silent', path.relative(projectRoot, testFile)],
      {
        cwd: projectRoot,
        env: { ...process.env, AUDIT_FILES: JSON.stringify(absFiles), AUDIT_THEME: theme, AUDIT_OUT_FILE: outFile },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
  } catch (err) {
    console.error('Jest could not evaluate the style file(s) — this usually means one of them throws at import time:');
    console.error(err.stdout?.toString() ?? err.message);
    console.error(err.stderr?.toString() ?? '');
    process.exit(2);
  } finally {
    fs.rmSync(testFile, { force: true });
  }
  const results = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  fs.rmSync(outFile, { force: true });
  return results;
}

// ---------------------------------------------------------------------------
// Comparators
// ---------------------------------------------------------------------------

function readSide(styleObj, rnProp, axisPair, fallback) {
  if (styleObj[rnProp] !== undefined) return styleObj[rnProp];
  if (axisPair && styleObj[axisPair] !== undefined) return styleObj[axisPair];
  if (fallback && styleObj[fallback] !== undefined) return styleObj[fallback];
  return undefined;
}

function compareLength(expectedRaw, actual, lengthFn, baseSize, zeroDefault) {
  if (actual === undefined && zeroDefault) actual = 0;
  const parsed = lengthFn(expectedRaw);
  if (parsed.kind === 'skip') return { skip: true, reason: parsed.reason };
  if (parsed.kind === 'percent') {
    if (actual === undefined) {
      return { skip: true, reason: `CSS ${parsed.value} in a flex layout is commonly satisfied implicitly by Yoga's default stretch/flex:1 — no explicit RN value to compare; verify visually` };
    }
    return { ok: String(actual).trim() === parsed.value, expected: parsed.value, actual };
  }
  if (parsed.kind === 'literal') {
    if (actual === undefined) return { ok: false, expected: parsed.value, actual };
    return { ok: String(actual).trim() === parsed.value, expected: parsed.value, actual };
  }
  if (actual === undefined) return { ok: false, expected: `scale(${parsed.px}${parsed.disableCeil ? ', true' : ''})`, actual };
  const expectedNum = parsed.disableCeil ? parsed.px * baseSize : Math.ceil(parsed.px * baseSize);
  const tolerance = Math.max(1, Math.abs(expectedNum) * 0.02);
  const ok = typeof actual === 'number' && Math.abs(actual - expectedNum) <= tolerance;
  return { ok, expected: `scale(${parsed.px}${parsed.disableCeil ? ', true' : ''}) ≈ ${expectedNum.toFixed(2)}`, actual };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const mapPath = path.resolve(projectRoot, args.map);
  const extractDir = path.resolve(projectRoot, args.extract);

  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const inventory = JSON.parse(fs.readFileSync(path.join(extractDir, 'inventory.json'), 'utf8'));
  const cssText = fs.readFileSync(path.join(extractDir, 'styles/app.css'), 'utf8');
  const cssIndex = buildDeclarationIndex(cssText);
  const varMap = buildVarMap(inventory, extractDir);

  const entries = map.map;
  const uniqueFiles = [...new Set(entries.map((e) => path.resolve(projectRoot, e.file ?? map.styleFile)))];
  const metricsFile = path.resolve(projectRoot, args.metrics ?? 'apps/mobile/src/theme/Metrics.tsx');
  const results = evaluateStyleFiles(uniqueFiles, args.theme, projectRoot, metricsFile);
  // Derived from the running theme's own scale() so the audit stays correct
  // regardless of what Jest's Dimensions mock reports on this machine.
  const globalBaseSize = results.__baseSize;

  const rows = [];
  let pass = 0, fail = 0, annotated = 0, skip = 0, unresolved = 0;

  for (const entry of entries) {
    const spec = resolveSelectorSpec(entry.selector, cssIndex);
    if (spec.skip) {
      rows.push(`[SKIP] ${entry.styleKey}: ${spec.reason}`);
      skip += 1;
      continue;
    }
    const filePath = path.resolve(projectRoot, entry.file ?? map.styleFile);
    const fileResults = results[filePath];
    const actualStyle = fileResults?.[entry.styleKey];
    if (!actualStyle) {
      rows.push(`[FAIL] ${entry.styleKey}: no such key in ${path.relative(projectRoot, filePath)} (theme=${args.theme})`);
      fail += 1;
      continue;
    }
    const sourceText = fs.readFileSync(filePath, 'utf8');
    const driftAnnotations = scanDriftAnnotations(sourceText, entry.styleKey);
    const positionValue = spec.decls.get('position');
    const positionIsStickyOrFixed = !!positionValue && /^(sticky|fixed)$/.test(positionValue.trim());
    const positionClusterAnnotated = positionIsStickyOrFixed && driftAnnotations.has('position');

    for (const [cssProp, rawValue] of spec.decls) {
      const { resolved, unresolved: unresolvedVar } = resolveValue(rawValue, varMap, args.theme);
      if (unresolvedVar) {
        rows.push(`[UNRESOLVED] ${entry.styleKey}.${cssProp}: ${unresolvedVar} not found in inventory tokens (theme=${args.theme}) — check ${args.colors}`);
        unresolved += 1;
        continue;
      }
      const cls = classifyProperty(cssProp, resolved);
      if (!cls || cls.kind === 'ignored') continue;

      if (cls.clusterWith === 'position' && positionIsStickyOrFixed) {
        if (positionClusterAnnotated) {
          rows.push(`[ANNOTATED] ${entry.styleKey}.${cssProp}: drift acknowledged (part of the position:${positionValue.trim()} cluster)`);
          annotated += 1;
        } else {
          rows.push(`[FAIL] ${entry.styleKey}.${cssProp}: needs a design-drift[position] annotation (depends on position:${positionValue.trim()})`);
          fail += 1;
        }
        continue;
      }

      if (cls.kind === 'annotatable') {
        if (driftAnnotations.has(cssProp)) {
          rows.push(`[ANNOTATED] ${entry.styleKey} (${cssProp}): drift acknowledged`);
          annotated += 1;
        } else {
          rows.push(`[FAIL] ${entry.styleKey} (${cssProp}): needs a design-drift[${cssProp}] annotation`);
          fail += 1;
        }
        continue;
      }
      if (cls.kind === 'skip') {
        rows.push(`[SKIP] ${entry.styleKey}.${cssProp}: ${cls.reason}`);
        skip += 1;
        continue;
      }

      if (cls.kind === 'color' || cls.kind === 'color-4side') {
        const targets = cls.rnProps ?? cls.order;
        const fallback = cls.fallback;
        let anyChecked = false;
        for (const rnProp of targets.length ? targets : [fallback]) {
          const actual = readSide(actualStyle, rnProp, null, fallback);
          if (actual === undefined) continue;
          anyChecked = true;
          const ok = normalizeColor(String(actual)) === normalizeColor(resolved);
          reportRow(ok, `${entry.styleKey}.${rnProp}`, resolved, actual, driftAnnotations.has(cssProp));
        }
        if (!anyChecked) {
          rows.push(`[FAIL] ${entry.styleKey}.${cssProp}: expected ${resolved}, got undefined`);
          fail += 1;
        }
        continue;
      }

      if (cssProp === 'text-align' && actualStyle.textAlign === undefined) {
        // A container's text-align is commonly satisfied by aligning the
        // child via flexbox instead — RN Views have no textAlign at all.
        const flexEquivalent = { right: 'flex-end', left: 'flex-start', center: 'center' }[resolved.trim()];
        const actualAlign = actualStyle.alignItems ?? actualStyle.alignSelf;
        if (flexEquivalent && actualAlign === flexEquivalent) {
          rows.push(`[PASS] ${entry.styleKey}.alignItems: text-align:${resolved} == alignItems:${actualAlign} (flex equivalent)`);
          pass += 1;
        } else {
          rows.push(`[FAIL] ${entry.styleKey}: text-align:${resolved} has no textAlign and no equivalent alignItems/alignSelf`);
          fail += 1;
        }
        continue;
      }

      if (cls.kind === 'string' || cls.kind === 'number' || cls.kind === 'string-num') {
        const rnProp = cls.rnProps[0];
        const actual = actualStyle[rnProp];
        const norm = (v) => (cls.kind === 'number' ? Number(v) : String(v).trim().toLowerCase());
        const ok = actual !== undefined && norm(actual) === norm(resolved);
        reportRow(ok, `${entry.styleKey}.${rnProp}`, resolved, actual, false);
        continue;
      }

      if (cls.kind === 'length') {
        const rnProp = cls.rnProps[0];
        const actual = actualStyle[rnProp];
        const cmp = compareLength(resolved, actual, cls.lengthFn, globalBaseSize, cls.zeroDefault);
        if (cmp.skip) {
          rows.push(`[SKIP] ${entry.styleKey}.${rnProp}: ${cmp.reason}`);
          skip += 1;
        } else {
          reportRow(cmp.ok, `${entry.styleKey}.${rnProp}`, cmp.expected, cmp.actual, false);
        }
        continue;
      }

      if (cls.kind === 'box-4side' || cls.kind === 'box-4corner') {
        const expanded = expandFourValue(resolved, cls.order.map((_, i) => (cls.kind === 'box-4side' ? FOUR_SIDE_ORDER[i] : FOUR_CORNER_ORDER[i])));
        cls.order.forEach((rnProp, i) => {
          const sideKey = cls.kind === 'box-4side' ? FOUR_SIDE_ORDER[i] : FOUR_CORNER_ORDER[i];
          const expectedRaw = expanded[sideKey];
          const axis = cls.axisPair ? (i % 2 === 0 ? cls.axisPair[0] : cls.axisPair[1]) : null;
          const actual = readSide(actualStyle, rnProp, axis, cls.fallback);
          const cmp = compareLength(expectedRaw, actual, cls.lengthFn, globalBaseSize, cls.zeroDefault);
          if (cmp.skip) {
            rows.push(`[SKIP] ${entry.styleKey}.${rnProp}: ${cmp.reason}`);
            skip += 1;
          } else {
            reportRow(cmp.ok, `${entry.styleKey}.${rnProp}`, cmp.expected, cmp.actual, false);
          }
        });
      }
    }
  }

  function reportRow(ok, label, expected, actual, isAnnotated) {
    if (ok) {
      rows.push(`[PASS] ${label}: ${expected} == ${actual}`);
      pass += 1;
    } else if (isAnnotated) {
      rows.push(`[ANNOTATED] ${label}: drift acknowledged (expected ${expected}, got ${actual})`);
      annotated += 1;
    } else {
      rows.push(`[FAIL] ${label}: expected ${expected}, got ${actual}`);
      fail += 1;
    }
  }

  for (const r of rows) console.log(r);
  const verdict = fail > 0 || unresolved > 0 ? 'FAIL' : 'PASS';
  console.log(`\n${pass} pass, ${fail} fail, ${annotated} annotated, ${skip} skip, ${unresolved} unresolved — GATE A: ${verdict}`);
  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
