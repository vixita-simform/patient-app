/**
 * Phase 0 — unpack an HTML design source into a plain directory tree.
 * See docs/superpowers/specs/2026-08-10-html-design-to-rn-design.md
 *
 * Three formats are recognised by content (never by filename):
 *  - bundler-v1    a self-contained export carrying `__bundler/*` payload
 *                  script blocks (JSX screen sources + a manifest of assets).
 *  - inline-style  a plain HTML export: one or more `<style>` blocks holding
 *                  the tokens and rules, repeated sibling elements (a shared
 *                  class, each with its own `id`) as the screens, and usually
 *                  a shared inline `<script>` driving navigation/state.
 *  - linked-css    an external `<link rel="stylesheet">` — recognised, not
 *                  yet unpackable (no real sample to build against; inline
 *                  the CSS by hand, or open an issue naming the export tool).
 */

const PAYLOAD = (type) =>
  new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`);

/**
 * Identify which of the three supported HTML shapes this is.
 * Detection is by content, never by filename.
 */
export function detectFormat(html) {
  if (PAYLOAD('manifest').test(html)) return 'bundler-v1';
  if (/<link[^>]+rel=["']?stylesheet/i.test(html)) return 'linked-css';
  if (/<style[\s>]/i.test(html)) return 'inline-style';
  throw new Error('Unrecognised design HTML: no bundler payload, stylesheet link, or style block');
}

function payload(html, type) {
  const m = html.match(PAYLOAD(type));
  if (!m) throw new Error(`Malformed bundle: no __bundler/${type} script block`);
  return m[1].trim();
}

/**
 * Read the three bundler payloads. The template is stored as a JSON *string*,
 * so it needs parsing rather than using the raw block.
 */
export function readBundle(html) {
  return {
    manifest: JSON.parse(payload(html, 'manifest')),
    extResources: JSON.parse(payload(html, 'ext_resources')),
    template: JSON.parse(payload(html, 'template'))
  };
}

import { gunzipSync, inflateSync } from 'node:zlib';

/** Manifest entries are base64; `compressed` ones are gzip, with raw deflate as a fallback. */
export function decodeEntry(entry) {
  const raw = Buffer.from(entry.data, 'base64');
  if (!entry.compressed) return raw;
  try {
    return gunzipSync(raw);
  } catch {
    return inflateSync(raw);
  }
}

/** UUIDs of the text/babel sources, in the order the template loads them. */
export function babelOrder(template) {
  return [...template.matchAll(/<script type="text\/babel" src="([0-9a-f-]{36})"/g)]
    .map((m) => m[1]);
}

/** Top-level PascalCase declarations — components and SCREAMING_CASE data alike. */
export function declaredComponents(source) {
  return [...source.matchAll(/^(?:function|const|let|var)\s+([A-Z]\w*)/gm)].map((m) => m[1]);
}

/**
 * Filename stem for a file that declares many components. A Flow or Module is the
 * whole file's subject; otherwise the last Screen is; otherwise fall back to the
 * first declaration. inventory.json carries the full per-file component list either way.
 */
export function primaryName(decls) {
  const last = (re) => [...decls].reverse().find((d) => re.test(d));
  // `declaredComponents` also returns SCREAMING_CASE data constants, so the
  // fallback skips them — naming a file of date pickers `C_MONTHS.jsx` helps
  // nobody. Any choice here is arbitrary for a file with no Flow/Module/Screen;
  // inventory.json carries the real per-file component list either way.
  const isComponent = (n) => /^[A-Z][a-z]/.test(n);
  return (
    last(/Flow$/) ?? last(/Module$/) ?? last(/Screen$/) ??
    decls.find(isComponent) ?? decls[0]
  );
}

/**
 * Split the stylesheet in two: the theme-token block (`:root` and both
 * `[data-theme]` blocks) and everything else. Later phases read them separately —
 * phase 1 needs only the tokens, phase 3 needs only the rules.
 *
 * Works against any HTML carrying `<style>` blocks, not just the bundler
 * template string — an `inline-style` export's raw source splits the same way.
 */
/**
 * A theme-token rule. The lookbehind keeps `:root` from matching inside a
 * compound selector like `.x:root` without *consuming* anything — an earlier
 * version anchored on `(?:^|\})`, which ate the preceding rule's closing brace
 * and so silently skipped every second consecutive token block.
 * `[^}]*` is safe here: token blocks are flat declaration lists, never nested.
 */
const TOKEN_RULE = /(?<![\w.#[-])(:root|\[data-theme="(?:light|dark)"\])\s*\{[^}]*\}/g;

export function splitStyles(template) {
  const blocks = [...template.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  const css = blocks.join('\n');
  const tokenRules = [];
  const rest = css.replace(TOKEN_RULE, (match) => {
    tokenRules.push(match.trim());
    return '';
  });
  return {
    tokensCss: tokenRules.join('\n\n'),
    appCss: rest.replace(/\n{3,}/g, '\n\n').trim()
  };
}

/** Pull `--name: value;` pairs out of the :root and both [data-theme] blocks. */
export function parseTokens(tokensCss) {
  const out = { root: {}, light: {}, dark: {} };
  const bucketFor = (sel) =>
    sel === ':root' ? out.root : sel.includes('light') ? out.light : out.dark;
  for (const m of tokensCss.matchAll(
    /(:root|\[data-theme="(?:light|dark)"\])\s*\{([\s\S]*?)\}/g
  )) {
    const bucket = bucketFor(m[1]);
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      bucket[d[1]] = d[2].replace(/\s+/g, ' ').trim();
    }
  }
  return out;
}

/**
 * Resolve `var(--name)` chains in a token table to literal values.
 *
 * A real 3-tier token system (foundation → semantic → component) declares the
 * upper tiers purely as references — `--color-text-primary:
 * var(--color-neutral-1000);` — not as literals. Classifying by value shape
 * has to happen *after* this resolves, not before, or every referencing token
 * throws as unclassifiable even though it's perfectly well-formed. `table`
 * should already be the merged view for one theme (e.g. `{ ...root, ...light
 * }`) so a reference resolves against whichever tier declared it, root or the
 * theme itself.
 *
 * Only resolves a token whose *entire* value is one `var(--name)` reference —
 * a reference embedded inside a larger expression (a gradient built from two
 * var()s, say) is a component-level CSS concern the RN builder reads
 * directly off the rule, not a token-table concern.
 */
export function resolveVarRefs(table) {
  const cache = new Map();
  const resolveOne = (name, seen) => {
    if (cache.has(name)) return cache.get(name);
    if (!(name in table)) throw new Error(`Unresolved token reference: ${name}`);
    const raw = table[name];
    const m = raw.trim().match(/^var\((--[\w-]+)\)$/);
    if (!m) {
      cache.set(name, raw);
      return raw;
    }
    const ref = m[1];
    if (seen.has(ref)) {
      throw new Error(`Circular token reference: ${[...seen, ref].join(' -> ')}`);
    }
    const resolved = resolveOne(ref, new Set(seen).add(ref));
    cache.set(name, resolved);
    return resolved;
  };
  const out = {};
  for (const name of Object.keys(table)) out[name] = resolveOne(name, new Set([name]));
  return out;
}

const NAMED_COLORS = new Set(['transparent', 'currentcolor', 'white', 'black', 'inherit']);

/**
 * Classify a token by the shape of its value. Order matters: a gradient contains
 * colours, and a box-shadow contains lengths, so the more specific tests come first.
 */
export function classifyValue(value) {
  const v = value.trim();
  if (v === 'none') return 'none';
  if (/^url\(/i.test(v)) return 'asset';
  if (/(?:linear|radial|conic)-gradient\(/i.test(v)) return 'gradient';
  if (/(?:drop-shadow|blur|brightness|saturate)\(/i.test(v)) return 'filter';
  if (/^#[0-9a-f]{3,8}$/i.test(v) || /^(?:rgba?|hsla?)\(/i.test(v)) return 'color';
  if (NAMED_COLORS.has(v.toLowerCase())) return 'color';
  // A bare number (an opacity, a unitless line-height/weight) or a number with
  // one of the units a design-token foundation tier actually uses (px spacing
  // and radii, ms durations, deg angles, occasionally em/rem/vh/vw/%) — both
  // print into the same "place by hand" scalar bucket downstream, so the unit
  // itself doesn't need stripping here.
  if (/^-?[\d.]+(?:px|ms|deg|s|em|rem|vh|vw|%)?$/.test(v)) return 'scalar';
  // A motion easing curve. Not a colour, not a length — there is no other
  // token kind for it, and it is common enough in a real token set (every
  // per-tier "duration"/"easing" pair) to be worth naming rather than
  // hard-stopping on. Kept as the literal cubic-bezier() string; whoever
  // reconciles the scalar bucket by hand treats it as a one-off.
  if (/^cubic-bezier\(/i.test(v)) return 'scalar';
  // A box-shadow is two or more lengths followed by a colour, optionally `inset`.
  if (/(?:^|\s|,)(?:inset\s+)?-?[\d.]+(?:px)?\s+-?[\d.]+(?:px)?/.test(v) && /(?:#|rgba?\()/i.test(v))
    return 'shadow';
  if (/,/.test(v) && /(?:sans-serif|serif|monospace|system-ui|['"])/.test(v)) return 'font';
  return 'unknown';
}

const KIND_TO_FILE = {
  color: 'Colors.ts',
  gradient: 'Gradients.ts',
  shadow: 'Shadows.ts',
  filter: 'Shadows.ts',
  asset: 'assets',
  scalar: 'Metrics.tsx',
  font: 'Fonts'
};

/** `--gc-card-grad` → `gcCardGrad` */
const camel = (name) =>
  name.replace(/^--/, '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * Classify a token across both themes. `none` is a value, not a kind — when one
 * theme disables an effect the other theme decides what the token is.
 */
export function classifyToken(name, light, dark) {
  const kinds = [classifyValue(light), classifyValue(dark)].filter((k) => k !== 'none');
  const kind = kinds.find((k) => k !== 'unknown');
  if (!kind) {
    throw new Error(`Unclassifiable token ${name}: light=${light} dark=${dark}`);
  }
  return { name, key: camel(name), kind, file: KIND_TO_FILE[kind], light, dark };
}

/**
 * Classify every token declared across root/light/dark, resolving var() chains
 * first. A token declared only in `:root` (no per-theme override — the only
 * case a single-theme export ever has) used to be silently dropped here,
 * because the token-name set was built only from the light/dark buckets;
 * fixed by unioning all three.
 */
export function classifyAllTokens(tokens) {
  const names = new Set([
    ...Object.keys(tokens.root), ...Object.keys(tokens.light), ...Object.keys(tokens.dark)
  ]);
  const lightResolved = resolveVarRefs({ ...tokens.root, ...tokens.light });
  const darkResolved = resolveVarRefs({ ...tokens.root, ...tokens.dark });
  return [...names].map((n) =>
    classifyToken(n, lightResolved[n] ?? darkResolved[n], darkResolved[n] ?? lightResolved[n])
  );
}

import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, extname, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import {
  parseStylesheet,
  buildTokenTable,
  declarationsToRN,
  parseDeclarations,
  typographyScale,
  fontInventory,
  selectorClasses
} from './lib/css-model.mjs';
import { buildNavModel, renderTree, buildScopeIndex, inferModules } from './lib/nav-model.mjs';
import {
  extractChrome,
  extractTexts,
  extractInputs,
  extractActions,
  extractSections,
  extractClasses,
  extractInlineStyles,
  findRenderFns,
  findDynamicRegions,
  scanInnerHTMLTargets,
  screenContainer,
  scanElements
} from './lib/html-model.mjs';

const MIME_EXT = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
  'font/woff2': '.woff2',
  'application/javascript': '.jsx',
  'text/javascript': '.js'
};

/**
 * Catalog every inline `<svg>...</svg>` block and every `data:image/*`
 * (raster) reference found in `html`, deduped by content, each written out
 * as a real file under `assets/` — not left as unindexed markup a screen's
 * builder has to grep for by hand, and not just flagged as a boolean
 * capability. `screens` (`{ file, outerHTML }[]`) is used only to compute
 * which screen(s) each asset appears in; scanning happens once, over the
 * whole document, so an asset shared by several screens (a logo reused via
 * a JS variable that re-inserts the same markup, as well as one simply
 * copy-pasted into multiple screens' static markup) is recorded once with
 * every screen that carries it, not once per screen.
 */
/**
 * Some designs keep a single named icon library (`var ICONS = {name: "<path.../>"}`)
 * behind a small `ic(name, size)` wrapper instead of writing out full `<svg>`
 * markup per usage site. When one exists, matching an inline SVG's inner
 * content against it gives a real name (`icon-back`) instead of a counter
 * (`svg-14`) — every occurrence rendered via the wrapper is a byte-for-byte
 * match on the inner markup, so this is exact, not a guess.
 */
export function parseNamedIconLibrary(behaviorSrc) {
  const map = new Map();
  const re = /(?:var|const|let)\s+\w*icons?\w*\s*=\s*(\{[\s\S]*?\})\s*;/gi;
  let m;
  while ((m = re.exec(behaviorSrc))) {
    let obj;
    try {
      obj = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const entries = Object.entries(obj).filter(([, v]) => typeof v === 'string' && /<path/i.test(v));
    if (entries.length < Object.keys(obj).length / 2) continue; // not an icon-path table
    for (const [name, value] of entries) map.set(value.replace(/\s+/g, ' ').trim(), name);
  }
  return map;
}

/** The nearest `class="..."` (first token) or `id="..."` before `index`, for naming an unmatched inline asset. */
function nearestClassOrId(html, index) {
  const window = html.slice(Math.max(0, index - 300), index);
  const classMatches = [...window.matchAll(/class\s*=\s*"([^"]*)"/g)];
  if (classMatches.length) return classMatches[classMatches.length - 1][1].trim().split(/\s+/)[0];
  const idMatches = [...window.matchAll(/\bid\s*=\s*"([^"]*)"/g)];
  if (idMatches.length) return idMatches[idMatches.length - 1][1].trim();
  return null;
}

export function extractInlineAssets(html, screens, outDir, behaviorSrc) {
  const assets = [];
  const byNormalizedMarkup = new Map();
  const usedIds = new Set();
  let svgCount = 0;
  let imgCount = 0;

  const namedIcons = parseNamedIconLibrary(behaviorSrc ?? '');

  const record = (id, kind, file, extra, normKey) => {
    const foundIn = screens.filter((s) => s.outerHTML.includes(extra.__raw)).map((s) => s.file);
    const entry = { id, kind, file, foundIn: foundIn.length ? foundIn : ['(outside any screen container)'], ...extra };
    delete entry.__raw;
    byNormalizedMarkup.set(normKey, entry);
    assets.push(entry);
    return entry;
  };

  /** Turn a candidate name into a unique, filesystem-safe asset id. */
  const uniqueId = (prefix, candidate) => {
    const slug = candidate && candidate.replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
    let id = slug ? `${prefix}-${slug}` : null;
    if (id && !usedIds.has(id)) {
      usedIds.add(id);
      return id;
    }
    if (id) {
      let n = 2;
      while (usedIds.has(`${id}-${n}`)) n += 1;
      usedIds.add(`${id}-${n}`);
      return `${id}-${n}`;
    }
    return null;
  };

  for (const m of html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi)) {
    const markup = m[0];
    const normKey = markup.replace(/\s+/g, ' ').trim();
    if (byNormalizedMarkup.has(normKey)) {
      const existing = byNormalizedMarkup.get(normKey);
      for (const s of screens) {
        if (s.outerHTML.includes(markup) && !existing.foundIn.includes(s.file)) existing.foundIn.push(s.file);
      }
      continue;
    }
    const viewBox = /viewBox\s*=\s*"([^"]*)"/i.exec(markup)?.[1] ?? null;
    const inner = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('<')).replace(/\s+/g, ' ').trim();
    const iconName = namedIcons.get(inner);
    let id = (iconName && uniqueId('icon', iconName)) || uniqueId('svg', nearestClassOrId(html, m.index));
    if (!id) {
      id = `svg-${svgCount}`;
      usedIds.add(id);
    }
    svgCount += 1;
    const file = `assets/${id}.svg`;
    writeFileSync(join(outDir, file), markup);
    record(id, 'svg', file, { viewBox, iconName: iconName ?? null, bytes: markup.length, __raw: markup }, normKey);
  }

  const dataUriRe = /data:(image\/(?:png|jpe?g|gif|webp));base64,([a-z0-9+/=]+)/gi;
  for (const m of html.matchAll(dataUriRe)) {
    const [full, mime, base64] = m;
    if (byNormalizedMarkup.has(full)) {
      const existing = byNormalizedMarkup.get(full);
      for (const s of screens) {
        if (s.outerHTML.includes(full) && !existing.foundIn.includes(s.file)) existing.foundIn.push(s.file);
      }
      continue;
    }
    const ext = MIME_EXT[mime] || `.${mime.split('/')[1]}`;
    const id = `img-${imgCount}`;
    imgCount += 1;
    const file = `assets/${id}${ext}`;
    const bytes = Buffer.from(base64, 'base64');
    writeFileSync(join(outDir, file), bytes);
    record(id, 'raster', file, { bytes: bytes.length, __raw: full }, full);
  }

  return assets;
}

/** What the design needs that plain React Native does not provide. */
export function detectCapabilities(appCss, sources) {
  const src = sources.join('\n');
  return {
    gradients: /(?:linear|radial|conic)-gradient\(/i.test(appCss),
    svg: /<svg[\s>]/i.test(src) || /<svg[\s>]/i.test(appCss),
    blur: /backdrop-filter\s*:|filter\s*:[^;]*blur\(/i.test(appCss),
    animation: /@keyframes|transition\s*:|animation\s*:/i.test(appCss),
    // Two independent signals, OR'd. An earlier version required a top-only
    // border-radius AND `position:fixed … bottom:0` inside one rule block, which
    // missed a design with nine Sheet components because they animate in with
    // translateY instead. A false negative here is expensive — the dependency
    // gate silently omits the sheet library and phase 3 hard-stops on it — while
    // a false positive only proposes a dependency the user can decline.
    bottomSheet:
      /<\w*Sheet[\s/>]|(?:function|const)\s+\w*Sheet\b/.test(src) ||
      (/border-radius\s*:\s*[^;]*\s+0\s+0\s*[;}]/i.test(appCss) &&
        /position\s*:\s*(?:fixed|absolute)|transform\s*:\s*translateY/i.test(appCss))
  };
}

/* ====================================================== compiled RN styles */

/**
 * Translate the stylesheet to React Native once, here, instead of once per
 * screen by hand in phase 3. Each screen gets `styles/rn/<Screen>.json`
 * holding only the rules its own class names reach, already converted:
 * `scale()`-wrapped lengths, theme-key colour expressions, expanded
 * shorthands, shadow objects with an Android `elevation`, and an explicit list
 * of what could not port.
 *
 * The whole point of the phase-3 gate is that the builder composes a tree from
 * correct values rather than re-deriving values it can get wrong; this file is
 * what makes that true.
 */
export function compileRnStyles(rules, tokenTable, scaleFn) {
  const compiled = [];
  const byClass = new Map();
  for (const rule of rules) {
    if (rule.at.some((a) => /^@keyframes/i.test(a))) continue;
    if (!Object.keys(rule.declarations).length) continue;
    const rn = declarationsToRN(rule.declarations, { tokenTable, scaleFn });
    const entry = {
      selector: rule.selector.trim(),
      at: rule.at.length ? rule.at : undefined,
      classes: selectorClasses(rule.selector),
      style: rn.style,
      drift: rn.drift.length ? rn.drift : undefined,
      unmapped: rn.unmapped.length ? rn.unmapped : undefined
    };
    compiled.push(entry);
    for (const c of entry.classes) {
      if (!byClass.has(c)) byClass.set(c, []);
      byClass.get(c).push(entry);
    }
  }
  return { compiled, byClass };
}

/** The rules a given set of class names reaches, in stylesheet order. */
export function styleSliceFor(classes, byClass) {
  const want = new Set(classes);
  const out = new Map();
  for (const c of want) {
    for (const entry of byClass.get(c) ?? []) {
      // Every class the selector needs must be present, or the rule never
      // applies to this screen — `.job .card` doesn't fire on a screen with
      // only `.card`.
      if (entry.classes.every((cl) => want.has(cl))) out.set(entry.selector + (entry.at ?? ''), entry);
    }
  }
  return [...out.values()];
}

/**
 * A class token that only ever flips a state, never identifies what the
 * element *is*. Stripped when grouping elements into a component signature —
 * `.btn.active` and `.btn` must fall into the same candidate, or every
 * stateful screen fragments a real component into noise — but kept in
 * `variants` so the printed inventory still shows every combination seen.
 */
const STATE_CLASS_RE = /^(?:is-|has-)[\w-]+$|^(?:active|selected|disabled|open|closed|checked|expanded|collapsed|hidden|visible|hover(?:ed)?|focus(?:ed)?|current|highlighted?|readonly|read-only|invalid|valid|loading|error|success|warning|first|last)$/i;

/**
 * RN style properties that mean "this element has its own look", as opposed
 * to pure layout (`flexDirection`, `alignItems`, `gap`...). A signature with
 * none of these behind any of its classes is a structural wrapper, not a
 * component — including it would flood the mined inventory with every
 * `.row`/`.section`/`.content` div the design happens to reuse for layout.
 */
const VISUAL_STYLE_PROPS = new Set([
  'backgroundColor', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderWidth', 'borderTopWidth',
  'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderColor', 'color',
  'shadowColor', 'shadowOpacity', 'shadowRadius', 'shadowOffset', 'elevation',
  'fontSize', 'fontWeight', 'fontFamily', 'textTransform', 'opacity', 'textDecorationLine'
]);

function styleKeysFor(classes, byClass) {
  const keys = new Set();
  for (const c of classes) {
    for (const rule of byClass.get(c) ?? []) {
      for (const k of Object.keys(rule.style ?? {})) keys.add(k);
    }
  }
  return keys;
}

/** True when at least one of the style keys is a "look", not just a layout instruction. */
function hasVisualStyle(styleKeys) {
  for (const k of styleKeys) if (VISUAL_STYLE_PROPS.has(k)) return true;
  return false;
}

/**
 * Repeated, visually-styled element shapes across the whole screen set — the
 * data `design-components` needs to print a mined inventory with real usage
 * counts. Counting this by hand (or asking an agent to eyeball dozens of
 * screens) is exactly the kind of unbounded read `references/reading-budget.md`
 * warns against; it is mechanical, so it belongs here, once, at extract time.
 *
 * Grouped by `tag + non-state classes`, not by CSS selector, because two
 * elements sharing that shape are the same component candidate even when one
 * carries an extra state class (`.btn.active`) — see `STATE_CLASS_RE`. Filtered
 * to signatures reaching at least one real visual RN property (see
 * `VISUAL_STYLE_PROPS`), so a layout-only wrapper div never crowds out an
 * actual button/card/badge in the printed list.
 */
export function detectComponentCandidates(screenPairs, byClass, opts = {}) {
  const minScreens = opts.minScreens ?? 2;
  const bySignature = new Map();

  for (const { file, outerHTML } of screenPairs) {
    const els = scanElements(outerHTML);
    if (!els.length) continue;
    const rootDepth = els[0].depth;
    for (const el of els) {
      if (el.depth === rootDepth) continue; // the screen container itself, not a candidate
      const classes = (el.attrs.class ?? '').split(/\s+/).filter(Boolean);
      if (!classes.length) continue; // a bare tag has no identity to name a component after
      const baseClasses = [...new Set(classes.filter((c) => !STATE_CLASS_RE.test(c)))].sort();
      if (!baseClasses.length) continue; // every class present was a state modifier
      if (!hasVisualStyle(styleKeysFor(baseClasses, byClass))) continue; // structural wrapper, not a component

      const signature = `${el.tag}.${baseClasses.join('.')}`;
      if (!bySignature.has(signature)) {
        bySignature.set(signature, {
          signature,
          tag: el.tag,
          baseClasses,
          variants: new Set(),
          screens: new Set(),
          count: 0,
          sample: outerHTML.slice(el.start, Math.min(el.end, el.start + 300))
        });
      }
      const entry = bySignature.get(signature);
      entry.variants.add(classes.sort().join(' '));
      entry.screens.add(file);
      entry.count += 1;
    }
  }

  return [...bySignature.values()]
    .filter((e) => e.screens.size >= minScreens)
    .map((e) => ({
      signature: e.signature,
      tag: e.tag,
      baseClasses: e.baseClasses,
      variants: [...e.variants].sort(),
      screenCount: e.screens.size,
      totalUsages: e.count,
      foundIn: [...e.screens].sort(),
      styleKeys: [...styleKeysFor(e.baseClasses, byClass)].sort(),
      sample: e.sample
    }))
    .sort((a, b) => b.screenCount - a.screenCount || b.totalUsages - a.totalUsages || a.signature.localeCompare(b.signature));
}

/** Inline `style="..."` attributes compiled the same way as stylesheet rules. */
export function compileInlineStyles(inlineStyles, tokenTable, scaleFn) {
  return inlineStyles.map((el) => {
    const rn = declarationsToRN(parseDeclarations(el.style), { tokenTable, scaleFn });
    return {
      selector: `${el.class ? `.${el.class.split(/\s+/)[0]}` : el.tag} (inline: ${el.style})`,
      inline: true,
      style: rn.style,
      drift: rn.drift.length ? rn.drift : undefined,
      unmapped: rn.unmapped.length ? rn.unmapped : undefined
    };
  });
}

/* ============================================== companion token references */

/** Flatten a W3C DTCG token file to `{ path, type, value, ref }` rows. */
function flattenDtcg(node, path = [], out = []) {
  if (node && typeof node === 'object' && '$value' in node) {
    const v = node.$value;
    const ref = typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : null;
    out.push({ path: path.join('.'), type: node.$type ?? null, value: v, ref });
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      flattenDtcg(v, [...path, k], out);
    }
  }
  return out;
}

/**
 * The designer's companion files, when they sit next to the HTML source: a
 * W3C DTCG `design-tokens.json`, an RN `theme.ts`, a `tokens-preview.html`.
 *
 * These used to be declared out of scope, on the grounds that the HTML is the
 * only source of truth. It still is — nothing here overrides a value extracted
 * from the CSS. What they add is the *tier structure* the flat `:root` block
 * loses: which tokens are foundation, which are semantic, and which are
 * component-scoped (`component.button.height`). That tiering is exactly what
 * phase 1 needs to decide what belongs in a theme file versus a component's
 * own styles, and re-deriving it from 314 flat names is guesswork.
 *
 * Every companion value is cross-checked against the CSS-derived token of the
 * same literal value; disagreements are reported, never silently preferred.
 */
function readCompanions(htmlPath, classified) {
  const dir = dirname(htmlPath);
  const byValue = new Map();
  for (const t of classified) {
    const k = String(t.light).toLowerCase().replace(/\s+/g, '');
    if (!byValue.has(k)) byValue.set(k, []);
    byValue.get(k).push(t.name);
  }

  const companions = [];

  const dtcgPath = ['design-tokens.json', 'tokens.json', 'apps/mobile/design/design-tokens.json']
    .map((f) => join(dir, f))
    .find((p) => existsSync(p));
  let tiers = null;
  if (dtcgPath) {
    try {
      const rows = flattenDtcg(JSON.parse(readFileSync(dtcgPath, 'utf8')));
      const tierOf = (p) => (p.startsWith('semantic.') ? 'semantic' : p.startsWith('component.') ? 'component' : 'foundation');
      const entries = rows.map((r) => {
        const lit = typeof r.value === 'string' ? r.value.toLowerCase().replace(/\s+/g, '') : null;
        return {
          ...r,
          tier: tierOf(r.path),
          cssTokens: r.ref ? [] : (lit && byValue.get(lit)) ?? []
        };
      });
      tiers = {
        file: basename(dtcgPath),
        total: entries.length,
        byTier: entries.reduce((acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] ?? 0) + 1 }), {}),
        // A component-tier token is a design decision the CSS flattens away —
        // `component.button.height` is worth carrying into the port verbatim.
        component: entries.filter((e) => e.tier === 'component').map(({ path, type, value, ref }) => ({ path, type, value, ref })),
        semantic: entries.filter((e) => e.tier === 'semantic').map(({ path, type, value, ref, cssTokens }) => ({ path, type, value, ref, cssTokens })),
        unmatchedFoundation: entries
          .filter((e) => e.tier === 'foundation' && !e.ref && !e.cssTokens.length)
          .map((e) => ({ path: e.path, value: e.value }))
      };
      companions.push({ file: basename(dtcgPath), kind: 'w3c-dtcg', used: 'tier structure + component tokens' });
    } catch (err) {
      companions.push({ file: basename(dtcgPath), kind: 'w3c-dtcg', used: `failed to parse: ${err.message}` });
    }
  }

  for (const [name, kind, note] of [
    ['theme.ts', 'rn-theme', 'cross-check only — phase 1 writes this repo’s own theme files'],
    ['tokens-preview.html', 'token-preview', 'visual reference; every value it shows is already in tokens.css']
  ]) {
    const p = join(dir, name);
    if (existsSync(p)) companions.push({ file: name, kind, used: note });
  }

  return { companions, tiers };
}

/* ============================================================ inline-style */

/** Blank out `<script>`/`<style>` contents (same length, so offsets still line
 * up with the original string) before scanning for structural tags — a stray
 * `<div class="x" id="y">`-shaped string inside a JS string literal must never
 * be mistaken for a real element. */
function blankNonStructural(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, (s) => ' '.repeat(s.length))
    .replace(/<style[\s\S]*?<\/style>/gi, (s) => ' '.repeat(s.length));
}

/** `name="value"` pairs anywhere in an attribute string, order-independent. */
export function parseAttrs(attrStr) {
  const attrs = {};
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(attrStr))) {
    attrs[m[1]] = m[3] !== undefined ? m[3] : m[4];
  }
  return attrs;
}

/**
 * Which repeated element is "the screen" in a plain HTML export. Every design
 * tool names this differently (`page`, `screen-panel`, `view`...), so this is
 * a heuristic, not a fixed convention: the `tag.class` combination that (a)
 * appears on the most elements, (b) where every one of those elements carries
 * its own distinct `id` — a shared modifier class like `.active` disqualifies
 * itself because it only ever appears on one id at a time. `override` (from
 * `config.json`'s `source.screenSelector`) skips the guess entirely.
 */
export function detectScreenSelector(html, override) {
  if (override) {
    const m = /^([a-zA-Z][\w-]*)\.([\w-]+)$/.exec(override.trim());
    if (!m) {
      throw new Error(`source.screenSelector must look like "tag.class", got ${JSON.stringify(override)}`);
    }
    return { tag: m[1], className: m[2] };
  }

  const structural = blankNonStructural(html);
  const tagRe = /<([a-zA-Z][\w-]*)\s+[^<>]*?>/g;
  const counts = new Map(); // "tag.class" -> Set(ids)
  let m;
  while ((m = tagRe.exec(structural))) {
    const attrs = parseAttrs(m[0]);
    if (!attrs.id || !attrs.class) continue;
    for (const cls of attrs.class.split(/\s+/).filter(Boolean)) {
      const key = `${m[1]}.${cls}`;
      if (!counts.has(key)) counts.set(key, new Set());
      counts.get(key).add(attrs.id);
    }
  }

  let best = null;
  for (const [key, ids] of counts) {
    if (ids.size < 2) continue;
    if (!best || ids.size > best.count) best = { key, count: ids.size };
  }
  if (!best) {
    throw new Error(
      'Could not find a repeated screen container — an element class shared by ' +
      '2+ siblings, each with its own id. Set source.screenSelector in ' +
      '.claude/html-design-to-rn/config.json to "tag.class" to name it explicitly.'
    );
  }
  const dot = best.key.indexOf('.');
  return { tag: best.key.slice(0, dot), className: best.key.slice(dot + 1) };
}

/**
 * Find the element starting at `openStart` and return its full outerHTML,
 * matching same-tag nesting by depth rather than assuming the next close tag
 * is the right one.
 */
export function extractBalancedElement(html, openStart, tagName) {
  const firstClose = html.indexOf('>', openStart);
  if (firstClose === -1) throw new Error(`Unterminated <${tagName}> at index ${openStart}`);
  if (html[firstClose - 1] === '/') return html.slice(openStart, firstClose + 1); // self-closing

  const anyTagRe = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}\\s*>`, 'gi');
  anyTagRe.lastIndex = firstClose + 1;
  let depth = 1;
  let m;
  while ((m = anyTagRe.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(openStart, m.index + m[0].length);
  }
  throw new Error(`Unbalanced <${tagName}> starting at index ${openStart} — no matching close tag`);
}

/** Everything between a screen element's own open and close tags. '' for a self-closing shell. */
function innerContent(outerHTML, tagName) {
  const openEnd = outerHTML.indexOf('>') + 1;
  const closeStart = outerHTML.lastIndexOf(`</${tagName}`);
  return closeStart === -1 ? '' : outerHTML.slice(openEnd, closeStart);
}

/** `p-signin` -> `Signin`; a design without a common prefix just PascalCases the whole id. */
function pascalFromId(id) {
  const stripped = id.replace(/^[a-z]{1,3}-/, '');
  const words = (stripped || id).split(/[-_]/).filter(Boolean);
  const name = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return name || id;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * The previous run's inventory plus the two global files whose content
 * changing invalidates per-screen skipping below — a shared class's compiled
 * RN value or which function fills which id can shift for a screen whose own
 * markup didn't change at all. Read before this run overwrites any of them,
 * or there is nothing left to diff against (first-ever extraction: `null`).
 */
function loadPreviousExtraction(outDir) {
  const inventoryPath = join(outDir, 'inventory.json');
  if (!existsSync(inventoryPath)) return null;
  let inventory;
  try {
    inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  } catch {
    return null;
  }
  const appCssPath = join(outDir, 'styles/app.css');
  const behaviorPath = inventory.behavior ? join(outDir, inventory.behavior.file) : null;
  return {
    inventory,
    appCss: existsSync(appCssPath) ? readFileSync(appCssPath, 'utf8') : null,
    behaviorSrc: behaviorPath && existsSync(behaviorPath) ? readFileSync(behaviorPath, 'utf8') : null
  };
}

/** A short, cheap-to-read line for one changed screen — never the full diff
 * (that would be exactly the "megabytes of base64 in context" problem the
 * reading-budget rule exists to avoid, just relocated into CHANGELOG.md). */
function summarizeScreenChange(prev, curr) {
  const parts = [];
  const p = prev.counts ?? {};
  const c = curr.counts ?? {};
  for (const key of ['texts', 'sections', 'inputs', 'actions', 'classes']) {
    if (p[key] !== c[key]) parts.push(`${key} ${p[key] ?? '?'}→${c[key] ?? '?'}`);
  }
  if (prev.bytes !== curr.bytes) parts.push(`bytes ${prev.bytes}→${curr.bytes}`);
  if (prev.renderStatus === 'rendered' && curr.dynamic) {
    parts.push('was live-rendered — re-run render-dynamic-screens.mjs for this screen');
  }
  return parts.length ? parts.join(', ') : 'content changed';
}

/**
 * Diffs this run's screens/chrome against the previous run's (by `id`/`name`,
 * never by array position — a screen added earlier in the source shifts
 * every later `order`, and that alone must never read as "everything
 * changed"), and prepends one dated entry to `CHANGELOG.md`. Kept
 * deliberately terse per screen (see `summarizeScreenChange`) — this file is
 * meant to be read whole before planning a re-port, not grepped like
 * `app.css`.
 */
function writeChangelog(outDir, { screens, chrome, previous, globalsChanged }) {
  const prevScreens = new Map((previous?.inventory.screens ?? []).map((s) => [s.id, s]));
  const prevChrome = new Map((previous?.inventory.chrome ?? []).map((c) => [c.name, c]));
  const currScreenIds = new Set(screens.map((s) => s.id));
  const currChromeNames = new Set(chrome.map((c) => c.name));

  const screenDiff = {
    added: screens.filter((s) => !prevScreens.has(s.id)),
    removed: [...prevScreens.values()].filter((s) => !currScreenIds.has(s.id)),
    changed: screens.filter((s) => prevScreens.has(s.id) && prevScreens.get(s.id).sourceHash !== s.sourceHash),
    unchanged: screens.filter((s) => prevScreens.has(s.id) && prevScreens.get(s.id).sourceHash === s.sourceHash)
  };
  const chromeDiff = {
    added: chrome.filter((c) => !prevChrome.has(c.name)),
    removed: [...prevChrome.values()].filter((c) => !currChromeNames.has(c.name)),
    changed: chrome.filter((c) => prevChrome.has(c.name) && prevChrome.get(c.name).sourceHash !== c.sourceHash),
    unchanged: chrome.filter((c) => prevChrome.has(c.name) && prevChrome.get(c.name).sourceHash === c.sourceHash)
  };

  const header = '# Design extraction changelog\n\nNewest first — one entry per `extract-design.mjs` run. "Changed" is a ' +
    'content hash of the screen/chrome region\'s own markup; see SKILL.md\'s "Incremental extraction" section for exactly ' +
    'what that does and doesn\'t catch.\n\n';
  const lines = [`## ${new Date().toISOString()}`, ''];
  if (!previous) {
    lines.push(`Initial extraction — ${screens.length} screens, ${chrome.length} chrome regions.`);
  } else {
    lines.push(
      `**Screens:** ${screenDiff.added.length} added, ${screenDiff.removed.length} removed, ${screenDiff.changed.length} changed, ${screenDiff.unchanged.length} unchanged`,
      `**Chrome:** ${chromeDiff.added.length} added, ${chromeDiff.removed.length} removed, ${chromeDiff.changed.length} changed, ${chromeDiff.unchanged.length} unchanged`
    );
    if (globalsChanged.length) {
      lines.push(
        '',
        `⚠️ ${globalsChanged.join(' and ')} changed since the last extraction, so every screen was re-derived from ` +
        'scratch (the per-screen skip above only applies when both are stable too) — any screen previously populated ' +
        'by render-dynamic-screens.mjs needs that pass re-run, "unchanged" markup or not.'
      );
    }
    if (screenDiff.added.length) lines.push('', '### Screens added', ...screenDiff.added.map((s) => `- ${s.id} (${s.name})`));
    if (screenDiff.removed.length) lines.push('', '### Screens removed', ...screenDiff.removed.map((s) => `- ${s.id} (${s.name}) — no longer present in the design source`));
    if (screenDiff.changed.length) {
      lines.push('', '### Screens changed', ...screenDiff.changed.map((s) => `- ${s.id} (${s.name}) — ${summarizeScreenChange(prevScreens.get(s.id), s)}`));
    }
    if (chromeDiff.added.length) lines.push('', '### Chrome added', ...chromeDiff.added.map((c) => `- ${c.name}`));
    if (chromeDiff.removed.length) lines.push('', '### Chrome removed', ...chromeDiff.removed.map((c) => `- ${c.name} — no longer present in the design source`));
    if (chromeDiff.changed.length) lines.push('', '### Chrome changed', ...chromeDiff.changed.map((c) => `- ${c.name}`));
  }
  lines.push('', '');

  const changelogPath = join(outDir, 'CHANGELOG.md');
  const existing = existsSync(changelogPath) ? readFileSync(changelogPath, 'utf8') : header;
  const body = existing.startsWith(header) ? existing.slice(header.length) : existing;
  writeFileSync(changelogPath, header + lines.join('\n') + body);

  return { file: 'CHANGELOG.md', screenDiff, chromeDiff, globalsChanged };
}

/** Unique function names referenced by `onclick="fn(...)"`-style attributes in a screen. */
export function screenHandlers(outerHTML) {
  const names = new Set();
  for (const m of outerHTML.matchAll(/\bon[a-z]+\s*=\s*"([a-zA-Z_$][\w$]*)\(/g)) names.add(m[1]);
  return [...names].sort();
}

/**
 * Split every top-level `<tag class="...className...">` element into one
 * screen, in document order. Requires an `id` — an element matching the
 * selector without one is skipped rather than silently misnamed; that's worth
 * surfacing, not guessing past.
 */
export function extractScreenSections(html, selector) {
  const { tag, className } = selector;
  const structural = blankNonStructural(html);
  const openRe = new RegExp(`<${tag}\\b\\s+[^<>]*?>`, 'gi');
  const screens = [];
  let m;
  while ((m = openRe.exec(structural))) {
    const attrs = parseAttrs(m[0]);
    const classes = (attrs.class || '').split(/\s+/).filter(Boolean);
    if (!classes.includes(className) || !attrs.id) continue;
    const outerHTML = extractBalancedElement(html, m.index, tag);
    screens.push({ id: attrs.id, outerHTML, order: screens.length, start: m.index, end: m.index + outerHTML.length });
  }
  if (!screens.length) {
    throw new Error(`No <${tag} class="${className}" id="..."> elements found`);
  }
  return screens;
}

/**
 * The literal, embedded `<script>` blocks (bundler payloads and external
 * `src=` scripts excluded) — an inline-style export's shared navigation/state
 * logic usually lives in exactly one of these. Concatenated in document order
 * into a single file; splitting it per screen would require real JS analysis
 * this extractor doesn't attempt — phase 3 greps it by screen id or handler
 * name instead (see `screens[].handlers`).
 */
export function extractInlineScripts(html) {
  const parts = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = parseAttrs(m[1]);
    if (attrs.type && attrs.type.startsWith('__bundler/')) continue;
    if (attrs.src) continue;
    if (m[2].trim()) parts.push(m[2]);
  }
  return parts.join('\n\n');
}

async function extractInlineStyleFormat(html, htmlPath, outDir, opts) {
  // Read before anything below overwrites it — the whole point is to diff
  // against what was there a moment ago.
  const previous = loadPreviousExtraction(outDir);

  for (const d of ['styles', 'styles/rn', 'screens', 'scripts', 'maps', 'assets', 'chrome']) {
    mkdirSync(join(outDir, d), { recursive: true });
  }

  const { tokensCss, appCss } = splitStyles(html);
  writeFileSync(join(outDir, 'styles/tokens.css'), tokensCss);
  writeFileSync(join(outDir, 'styles/app.css'), appCss);

  const selector = detectScreenSelector(html, opts.screenSelector);
  const sections = extractScreenSections(html, selector);

  const behaviorSrc = extractInlineScripts(html);
  let behavior = null;
  if (behaviorSrc.trim()) {
    behavior = { file: 'scripts/app.js', bytes: behaviorSrc.length };
    writeFileSync(join(outDir, behavior.file), behaviorSrc);
  }
  const scopeIndex = behaviorSrc ? buildScopeIndex(behaviorSrc) : { at: () => null };
  // Built once for the whole script — every screen's `findRenderFns` and the
  // dynamic-region pass below both read from this same map instead of each
  // rescanning `behaviorSrc` (once per screen, in the loop's case).
  const innerHTMLTargets = behaviorSrc ? scanInnerHTMLTargets(behaviorSrc, scopeIndex) : new Map();

  // Whether a screen's own markup is unchanged is necessary but not
  // sufficient for skipping its files below — a shared CSS class's compiled
  // value or which function fills which id can shift the same screen's real
  // output even when its own shell didn't move a single byte.
  const globalsChanged = [];
  if (previous && previous.appCss !== appCss) globalsChanged.push('styles/app.css');
  if (previous && previous.behaviorSrc !== behaviorSrc) globalsChanged.push('scripts/app.js');
  const globalsStable = previous !== null && globalsChanged.length === 0;
  const previousScreensById = new Map((previous?.inventory.screens ?? []).map((s) => [s.id, s]));

  const tokens = parseTokens(tokensCss);
  const classified = classifyAllTokens(tokens);
  const tokenTable = buildTokenTable(classified);
  const scaleFn = opts.scaleFn ?? 'scale';

  const rules = parseStylesheet(appCss);
  const { compiled, byClass } = compileRnStyles(rules, tokenTable, scaleFn);

  const screens = [];
  const screenSources = [];
  // Real-world threshold, not a formal one: a self-closed shell is 0 chars of
  // inner content; anything with actual markup runs into the hundreds. 30
  // draws the line comfortably below any real static screen while still
  // catching the empty-shell case a JS render function fills at runtime.
  const DYNAMIC_THRESHOLD = 30;
  let screensSkipped = 0;
  for (const { id, outerHTML, order } of sections) {
    const name = pascalFromId(id);
    const file = `screens/${String(order).padStart(2, '0')}-${name}.html`;
    const styleFile = `styles/rn/${String(order).padStart(2, '0')}-${name}.json`;
    const factsFile = `screens/${String(order).padStart(2, '0')}-${name}.facts.json`;
    const sourceHash = sha256(outerHTML);

    // Unchanged since the last run, globals stable too: reuse everything —
    // including whatever `render-dynamic-screens.mjs` populated this screen's
    // files with since then, which a blind rewrite from this same (still just
    // the raw, pre-render) `outerHTML` would otherwise silently discard. Only
    // the three on-disk files are skipped; `screens`/`screenSources` below
    // still get a real entry so nav-model building, dynamic-region detection
    // and inventory.json all see this screen exactly as before.
    const prevScreen = previousScreensById.get(id);
    if (globalsStable && prevScreen && prevScreen.sourceHash === sourceHash) {
      screensSkipped += 1;
      screens.push({ ...prevScreen, order, file, styleFile, factsFile, sourceHash });
      screenSources.push(outerHTML);
      continue;
    }

    writeFileSync(join(outDir, file), outerHTML);
    const inner = innerContent(outerHTML, selector.tag).trim();
    const classes = extractClasses(outerHTML);
    const inlineStyles = extractInlineStyles(outerHTML);

    // The CSS this screen actually reaches, already in RN form. Written per
    // screen so phase 3 opens one small file instead of slicing app.css.
    const slice = styleSliceFor(classes, byClass);
    const inlineCompiled = compileInlineStyles(inlineStyles, tokenTable, scaleFn);
    writeFileSync(
      join(outDir, styleFile),
      JSON.stringify({ screen: id, rules: slice, inline: inlineCompiled }, null, 2)
    );

    // Everything a planner would otherwise open the screen's HTML to learn.
    // Kept in its own file rather than in `inventory.json`, because the
    // inventory has to stay small enough to read whole — one screen's facts
    // are cheap, ninety-two screens' facts inlined are not.
    const facts = {
      screen: id,
      handlers: screenHandlers(outerHTML),
      classes,
      sections: extractSections(outerHTML),
      texts: extractTexts(inner),
      inputs: extractInputs(outerHTML),
      actions: extractActions(outerHTML),
      inlineStyles
    };
    writeFileSync(join(outDir, factsFile), JSON.stringify(facts, null, 2));

    const renderFns = findRenderFns(id, innerHTMLTargets);
    const emptyShell = inner.length < DYNAMIC_THRESHOLD;
    // Non-empty markup that a render function *also* overwrites. This is the
    // dangerous case, and the one a size heuristic alone gets wrong: the export
    // carries a full, plausible-looking screen that is replaced at load, so it
    // reads as authoritative while describing a screen nobody ever sees. On the
    // first sample `p-signin` shipped ~3 KB of superseded markup — a different
    // heading, different fields, different buttons — and every downstream
    // artifact (facts, compiled styles, screenshots) inherited the wrong screen.
    // A screen only counts as `static` when NO render function targets its id.
    const overwritten = !emptyShell && renderFns.length > 0;

    screens.push({
      file,
      styleFile,
      factsFile,
      order,
      id,
      name,
      // True whenever the behaviour script produces this screen's real content —
      // whether the extracted markup is an empty shell or stale markup that gets
      // replaced. Either way the extracted HTML is not what renders, so
      // `render-dynamic-screens.mjs` must populate it before anyone plans from it.
      dynamic: emptyShell || renderFns.length > 0,
      // Which of the two it is, because they need different scepticism: an empty
      // shell is obviously unusable, stale markup silently looks fine.
      staticMarkup: emptyShell ? 'empty-shell' : overwritten ? 'stale-overwritten' : 'authoritative',
      overwritten,
      renderFns,
      bytes: outerHTML.length,
      sourceHash,
      counts: {
        classes: classes.length,
        sections: facts.sections.length,
        texts: facts.texts.length,
        inputs: facts.inputs.length,
        actions: facts.actions.length,
        inlineStyles: inlineStyles.length,
        styleRules: slice.length
      }
    });
    screenSources.push(outerHTML);
  }

  // The app shell around the screens — header, tab bar, sheet, toast, drawer.
  // Shared components, not screens; counted and written separately so the
  // screen count means what it says.
  const chromeNames = new Set();
  const previousChromeByName = new Map((previous?.inventory.chrome ?? []).map((c) => [c.name, c]));
  const chromeRegions = extractChrome(html, sections);
  const chrome = chromeRegions.map((c, i) => {
    let name = (c.role ?? c.id ?? c.class?.split(/\s+/)[0] ?? `region-${i}`).replace(/[^\w-]/g, '-');
    if (chromeNames.has(name)) name = `${name}-${c.id ?? i}`;
    chromeNames.add(name);
    const file = `chrome/${name}.html`;
    const styleFile = `styles/rn/chrome-${name}.json`;
    const sourceHash = sha256(c.html);

    const prevChrome = previousChromeByName.get(name);
    if (globalsStable && prevChrome && prevChrome.sourceHash === sourceHash) {
      return { ...prevChrome, file, styleFile, sourceHash };
    }

    writeFileSync(join(outDir, file), c.html);
    const classes = extractClasses(c.html);
    writeFileSync(
      join(outDir, styleFile),
      JSON.stringify(
        {
          region: name,
          rules: styleSliceFor(classes, byClass),
          inline: compileInlineStyles(extractInlineStyles(c.html), tokenTable, scaleFn)
        },
        null,
        2
      )
    );
    return {
      name,
      role: c.role,
      file,
      styleFile,
      tag: c.tag,
      id: c.id,
      class: c.class,
      bytes: c.html.length,
      sourceHash,
      classes,
      texts: extractTexts(c.html),
      actions: extractActions(c.html)
    };
  });

  // Sub-regions the behaviour script repaints inside an already-known screen
  // or chrome region (a tab body, a list refresh) rather than a whole-screen
  // navigation — invisible to both extractScreenSections and extractChrome
  // until now. Detect + report only; see findDynamicRegions's own docstring.
  const container = screenContainer(html, sections);
  const dynamicRegions = behaviorSrc
    ? findDynamicRegions({
        behaviorSrc,
        scopeIndex,
        screenIds: screens.map((s) => s.id),
        screenDocs: screens.map((s, i) => ({ key: s.id, file: s.file, html: screenSources[i] })),
        chromeDocs: chrome.map((c, i) => ({ key: c.name, file: c.file, html: chromeRegions[i].html })),
        containerDoc: container
      })
    : [];
  for (const region of dynamicRegions) {
    if (region.ownerKind !== 'chrome') continue;
    const owner = chrome.find((c) => c.name === region.owner.name);
    if (owner) (owner.dynamicRegions ??= []).push({ id: region.id, renderFns: region.renderFns, calledBy: region.calledBy });
  }
  writeFileSync(join(outDir, 'dynamic-regions.json'), JSON.stringify({ regions: dynamicRegions }, null, 2));

  // Rules that belong to no class (element/reset selectors) — the app-wide
  // defaults every screen inherits.
  writeFileSync(
    join(outDir, 'styles/rn/_global.json'),
    JSON.stringify({ rules: compiled.filter((r) => !r.classes.length) }, null, 2)
  );

  // The source, unmodified — phase 4's pixel gate renders this directly, same
  // as the bundler-v1 path's rewritten template.
  writeFileSync(join(outDir, 'index.html'), html);

  const screenPairs = screens.map((s, i) => ({ file: s.file, outerHTML: screenSources[i] }));

  // Cross-screen repetition is the input `design-components` (phase 2) needs
  // to mine reusable components — computed once, mechanically, rather than
  // asked of an agent whose reading budget is scoped to a single screen.
  const componentCandidates = detectComponentCandidates(screenPairs, byClass, {
    minScreens: opts.componentMinScreens ?? 2
  });
  writeFileSync(
    join(outDir, 'styles/component-candidates.json'),
    JSON.stringify({ candidates: componentCandidates }, null, 2)
  );

  const assets = extractInlineAssets(html, screenPairs, outDir, behaviorSrc);
  // An asset outside every screen belongs to a chrome region — say which one
  // instead of the old "(outside any screen container)".
  for (const a of assets) {
    if (!a.foundIn?.[0]?.startsWith('(outside')) continue;
    const raw = readFileSync(join(outDir, a.file), a.kind === 'svg' ? 'utf8' : null);
    const owners = chrome.filter((c) => a.kind === 'svg' && readFileSync(join(outDir, c.file), 'utf8').includes(String(raw)));
    if (owners.length) a.foundIn = owners.map((c) => c.file);
  }

  const nav = buildNavModel({
    screens,
    behaviorSrc,
    indexHtml: html,
    screenHtml: new Map(screens.map((s, i) => [s.id.replace(/^p-/, ''), screenSources[i]]))
  });
  const moduleInference = inferModules(nav);

  const regionsByScreen = new Map();
  for (const region of dynamicRegions) {
    if (region.ownerKind !== 'screen') continue;
    if (!regionsByScreen.has(region.owner.id)) regionsByScreen.set(region.owner.id, []);
    regionsByScreen.get(region.owner.id).push({ id: region.id, renderFns: region.renderFns, calledBy: region.calledBy });
  }

  for (const s of screens) {
    const n = nav.perScreen.get(s.id.replace(/^p-/, ''));
    if (!n) continue;
    Object.assign(s, {
      role: n.role,
      parent: n.parent,
      parentSource: n.parentSource,
      children: n.children,
      tab: n.tab,
      title: n.title,
      subtitle: n.subtitle,
      depth: n.depth,
      flow: n.flow
    });
    // Which functions navigate to this screen, and which sub-regions the
    // behaviour script repaints inside it, are planning detail, not index
    // detail — both go to the facts file so `inventory.json` stays readable
    // whole by every phase.
    const factsPath = join(outDir, s.factsFile);
    const facts = JSON.parse(readFileSync(factsPath, 'utf8'));
    writeFileSync(
      factsPath,
      JSON.stringify({ ...facts, reachedBy: n.reachedBy, dynamicRegions: regionsByScreen.get(s.id) ?? [] }, null, 2)
    );
  }

  const screensById = new Map(screens.map((s) => [s.id.replace(/^p-/, ''), s]));
  writeFileSync(join(outDir, 'screens/INDEX.md'), renderTree(nav, screensById));

  // A screen/chrome region present last run and absent now: clean up its
  // orphaned files (this directory is gitignored scratch, not a git history —
  // nothing else will ever remove them) and let the changelog below name it,
  // rather than leaving a file nothing in inventory.json points at anymore.
  const currentScreenIds = new Set(screens.map((s) => s.id));
  for (const prevScreen of previousScreensById.values()) {
    if (currentScreenIds.has(prevScreen.id)) continue;
    for (const f of [prevScreen.file, prevScreen.styleFile, prevScreen.factsFile, prevScreen.screenshot]) {
      if (f && existsSync(join(outDir, f))) rmSync(join(outDir, f));
    }
  }
  const currentChromeNames = new Set(chrome.map((c) => c.name));
  for (const prevChrome of previousChromeByName.values()) {
    if (currentChromeNames.has(prevChrome.name)) continue;
    for (const f of [prevChrome.file, prevChrome.styleFile]) {
      if (f && existsSync(join(outDir, f))) rmSync(join(outDir, f));
    }
  }
  const changelog = writeChangelog(outDir, { screens, chrome, previous, globalsChanged });
  if (previous) {
    console.log(
      `Incremental extraction: ${changelog.screenDiff.unchanged.length} screens unchanged (reused as-is)` +
      `, ${changelog.screenDiff.changed.length} changed, ${changelog.screenDiff.added.length} added, ${changelog.screenDiff.removed.length} removed.` +
      (globalsChanged.length ? ` ${globalsChanged.join(' and ')} changed — every screen was re-derived from scratch regardless.` : '') +
      ` See ${changelog.file}.`
    );
  }

  const typography = typographyScale(rules, tokenTable);
  const fonts = fontInventory(html, rules, tokenTable);
  const { companions, tiers } = readCompanions(htmlPath, classified);

  // The token detail is phase 1's input and nobody else's — 60 KB of it in
  // `inventory.json` would be paid for by every phase that only wanted the
  // screen index. Split three ways so each read matches one need: the token
  // table (the phase 1 gate), the companion tier map (a cross-check), and the
  // type scale (reconciling textStyles).
  writeFileSync(join(outDir, 'styles/tokens.json'), JSON.stringify({ classified }, null, 2));
  writeFileSync(join(outDir, 'styles/typography.json'), JSON.stringify({ typography }, null, 2));
  if (tiers) writeFileSync(join(outDir, 'styles/tokens.tiers.json'), JSON.stringify(tiers, null, 2));

  const inventory = {
    source: { file: htmlPath, bytes: html.length, format: 'inline-style' },
    screenSelector: `${selector.tag}.${selector.className}`,
    tokens: {
      file: 'styles/tokens.json',
      count: classified.length,
      byKind: classified.reduce((a, t) => ({ ...a, [t.kind]: (a[t.kind] ?? 0) + 1 }), {}),
      themes: { light: Object.keys(tokens.light).length, dark: Object.keys(tokens.dark).length },
      tiers: tiers
        ? { file: 'styles/tokens.tiers.json', from: tiers.file, byTier: tiers.byTier, unmatchedFoundation: tiers.unmatchedFoundation.length }
        : null,
      companions
    },
    typography: { file: 'styles/typography.json', count: typography.length, names: typography.map((t) => t.rnName) },
    fonts,
    navigation: nav.summary,
    screens: screens.sort((a, b) => a.order - b.order),
    chrome,
    dynamicRegions: {
      file: 'dynamic-regions.json',
      count: dynamicRegions.length,
      byOwnerKind: dynamicRegions.reduce((a, r) => ({ ...a, [r.ownerKind]: (a[r.ownerKind] ?? 0) + 1 }), {}),
      note: 'getElementById(...).innerHTML= targets that are not a screen — sub-views repainted at runtime (tab bodies, list refreshes, stage pills), not full-screen navigations. This phase only detects + reports (and the ownership below is resolved against the still-unrendered static markup, so a region owned by a `dynamic: true` screen often reads `unresolved` here) — run render-dynamic-screens.mjs to render dynamic screens, re-resolve ownership against their real rendered markup, and live-render whichever screen-owned region is still empty afterward. owner.kind === "chrome" stays report-only there too — already covered by inventory.chrome, not a planning gap (see SKILL.md).'
    },
    modules: moduleInference,
    componentCandidates: {
      file: 'styles/component-candidates.json',
      count: componentCandidates.length,
      note: 'Repeated, visually-styled element shapes across 2+ screens, with real usage counts — read by design-components (phase 2) instead of asking an agent to re-derive this by scanning every screen.'
    },
    assets,
    capabilities: detectCapabilities(appCss, screenSources),
    behavior,
    styles: {
      rulesParsed: rules.length,
      compiled: compiled.length,
      global: 'styles/rn/_global.json',
      note: 'Per-screen RN styles live in each screen’s styleFile — read that, never app.css.'
    }
  };
  writeFileSync(join(outDir, 'inventory.json'), JSON.stringify(inventory, null, 2));
  return inventory;
}

/* ============================================================= bundler-v1 */

async function extractBundlerV1Format(html, htmlPath, outDir, opts = {}) {
  for (const d of ['styles', 'screens', 'assets', 'assets/fonts', 'maps', 'vendor']) {
    mkdirSync(join(outDir, d), { recursive: true });
  }

  const { template, manifest, extResources } = readBundle(html);
  const idOf = Object.fromEntries(extResources.map((e) => [e.uuid, e.id]));
  const babel = babelOrder(template);
  const localPath = {};
  const screens = [];
  const assets = [];
  const jsxSources = [];

  for (const [uuid, entry] of Object.entries(manifest)) {
    const bytes = decodeEntry(entry);
    const idx = babel.indexOf(uuid);

    if (idx !== -1) {
      const source = bytes.toString('utf8');
      const decls = declaredComponents(source);
      const file = `screens/${String(idx).padStart(2, '0')}-${primaryName(decls)}.jsx`;
      writeFileSync(join(outDir, file), source);
      localPath[uuid] = file;
      jsxSources.push(source);
      screens.push({ file, order: idx, components: decls });
      continue;
    }

    // Vendor scripts (React, ReactDOM, Babel) are not design content, but they
    // must still be written: index.html is what phase 4's pixel gate renders,
    // and without them the template's script tags 404 and nothing mounts.
    // Kept in vendor/ so they are obviously not part of the design.
    if (/javascript/.test(entry.mime)) {
      const file = `vendor/${uuid.slice(0, 8)}.js`;
      writeFileSync(join(outDir, file), bytes);
      localPath[uuid] = file;
      continue;
    }

    const id = idOf[uuid] ?? uuid.slice(0, 8);
    const dir = entry.mime.startsWith('font/') ? 'assets/fonts' : 'assets';
    const file = `${dir}/${id}${MIME_EXT[entry.mime] || extname(id) || '.bin'}`;
    writeFileSync(join(outDir, file), bytes);
    localPath[uuid] = file;
    assets.push({ id, uuid, file, mime: entry.mime, bytes: bytes.length });
  }

  const { tokensCss, appCss } = splitStyles(template);
  writeFileSync(join(outDir, 'styles/tokens.css'), tokensCss);
  writeFileSync(join(outDir, 'styles/app.css'), appCss);

  let rewritten = template;
  for (const [uuid, file] of Object.entries(localPath)) {
    rewritten = rewritten.split(uuid).join(file);
  }

  // The bundle's own unpacker injected `window.__resources` (logical id -> blob
  // URL) before running the app; the template itself never carries it. Without
  // it the screens fall back to paths like "assets/mg-icon.png" that do not
  // exist here, and every image renders broken. Same idea, local paths.
  const resourceMap = Object.fromEntries(
    extResources.filter((e) => localPath[e.uuid]).map((e) => [e.id, localPath[e.uuid]])
  );
  const inject =
    `<script>window.__resources = ${JSON.stringify(resourceMap)};</` +
    `script>\n<style id="__audit_frame">/* Phase 4 renders this page for the pixel gate, ` +
    `where the design's own phone bezel and mock status bar would be diffed against a ` +
    `simulator that draws neither. Set data-audit="1" on <html> to strip the frame and ` +
    `let the screen fill the viewport. */\n` +
    `html[data-audit] #stage,html[data-audit] #phone-wrap{all:unset;display:block;` +
    `width:100%;height:100%}\nhtml[data-audit] #screen-root{width:100%;height:100%;` +
    `border-radius:0;overflow:hidden}\nhtml[data-audit] .status-bar,` +
    `html[data-audit] .statusbar{display:none}</style>`;
  const head = rewritten.match(/<head[^>]*>/i);
  if (head) {
    const at = head.index + head[0].length;
    rewritten = rewritten.slice(0, at) + inject + rewritten.slice(at);
  }

  writeFileSync(join(outDir, 'index.html'), rewritten);

  const tokens = parseTokens(tokensCss);
  const classified = classifyAllTokens(tokens);

  // The manifest already covers real binary assets; this additionally catches
  // an SVG embedded as literal JSX markup instead of a manifest reference —
  // same gap as the inline-style format, same fix.
  const screenPairs = screens.map((s, i) => ({ file: s.file, outerHTML: jsxSources[i] }));
  const inlineAssets = extractInlineAssets(jsxSources.join('\n'), screenPairs, outDir, jsxSources.join('\n'));
  for (const a of inlineAssets) assets.push(a);

  // Same CSS→RN precompile as the inline-style path. A JSX export has no class
  // attributes to slice per screen, so the whole compiled sheet goes to one
  // file; it is still the difference between reading translated values and
  // translating raw CSS by hand.
  mkdirSync(join(outDir, 'styles/rn'), { recursive: true });
  const tokenTable = buildTokenTable(classified);
  const rules = parseStylesheet(appCss);
  const { compiled } = compileRnStyles(rules, tokenTable, opts.scaleFn ?? 'scale');
  writeFileSync(join(outDir, 'styles/rn/_all.json'), JSON.stringify({ rules: compiled }, null, 2));
  const { companions, tiers } = readCompanions(htmlPath, classified);

  const inventory = {
    source: { file: htmlPath, bytes: html.length, format: 'bundler-v1' },
    tokens: { ...tokens, classified, tiers, companions },
    typography: typographyScale(rules, tokenTable),
    fonts: fontInventory(html, rules, tokenTable),
    screens: screens.sort((a, b) => a.order - b.order),
    assets,
    capabilities: detectCapabilities(appCss, jsxSources),
    styles: { rulesParsed: rules.length, compiled: compiled.length, all: 'styles/rn/_all.json' }
  };
  writeFileSync(join(outDir, 'inventory.json'), JSON.stringify(inventory, null, 2));
  return inventory;
}

/**
 * Unpack an HTML design source into `outDir`. Returns the inventory it wrote.
 * `opts.screenSelector` (an inline-style-only override, `"tag.class"`) skips
 * the screen-container guess — set `source.screenSelector` in this project's
 * `.claude/html-design-to-rn/config.json` when it guesses wrong.
 */
export async function extract(htmlPath, outDir, opts = {}) {
  const html = readFileSync(htmlPath, 'utf8');
  const format = detectFormat(html);
  if (format === 'bundler-v1') return extractBundlerV1Format(html, htmlPath, outDir, opts);
  if (format === 'inline-style') return extractInlineStyleFormat(html, htmlPath, outDir, opts);
  throw new Error(
    `Format ${format} is recognised but not yet unpackable. bundler-v1 and ` +
    `inline-style exports are supported; a linked-css export (an external ` +
    `<link rel="stylesheet">) has no real sample to build against yet — inline ` +
    `the stylesheet into a <style> block by hand, or open an issue naming the ` +
    `export tool so real support can be added.`
  );
}

// CLI: node extract-design.mjs <html> --out <dir> [--screen-selector "tag.class"] [--scale-fn scale]
if (import.meta.url === `file://${process.argv[1]}`) {
  const [htmlPath] = process.argv.slice(2);
  const arg = (flag, fallback) => {
    const i = process.argv.indexOf(flag);
    return i === -1 ? fallback : process.argv[i + 1];
  };
  const outDir = arg('--out', 'apps/mobile/design/.extracted');
  const minScreensArg = arg('--component-min-screens', undefined);
  const inv = await extract(htmlPath, outDir, {
    screenSelector: arg('--screen-selector', undefined),
    scaleFn: arg('--scale-fn', 'scale'),
    componentMinScreens: minScreensArg !== undefined ? Number(minScreensArg) : undefined
  });

  const n = inv.navigation;
  const pad = (s) => String(s).padStart(4);
  console.log(`\n${inv.source.format} → ${outDir}\n`);

  if (n) {
    // The headline number is the one that drives planning: how many screens
    // are actually independent destinations, not how many DOM nodes matched.
    console.log('SCREENS');
    console.log(`${pad(n.total)} page elements total`);
    console.log(`${pad(n.tabScreens.length)}   tab destinations   ${n.tabScreens.join(', ')}`);
    console.log(`${pad(n.childScreens)}   pushed detail screens (grouped under a parent — see screens/INDEX.md)`);
    for (const f of n.flows) console.log(`${pad(f.steps.length)}   flow steps — ${f.fn}: ${f.steps.join(' → ')}`);
    console.log(`${pad(n.unlinkedScreens.length)}   unlinked (deep-linked or no detected trigger)`);
    if (n.ambiguous.length) console.log(`${pad(n.ambiguous.length)}   ambiguous parent — left flat, never guessed`);
    const sheetTabs = n.tabs.filter((t) => t.id.startsWith('('));
    if (sheetTabs.length) console.log(`${pad(sheetTabs.length)}   tab-bar buttons that open an overlay, not a screen: ${sheetTabs.map((t) => t.label).join(', ')}`);
    console.log(`     route-meta table: ${n.routeMetaTable ? `${n.routeMetaTable.name} (${n.routeMetaTable.entries} screens)` : 'none found — parents came from nav-stack greps'}`);
  } else {
    console.log(`SCREENS\n${pad(inv.screens.length)} sources`);
  }

  if (inv.chrome?.length) {
    console.log(`\nCHROME (shared shell components, not screens — chrome/*.html)`);
    for (const c of inv.chrome) console.log(`${pad('')} ${(c.role ?? 'region').padEnd(15)} ${c.file}`);
  }

  const dyn = inv.screens.filter((s) => s.dynamic);
  if (dyn.length) {
    const withFn = dyn.filter((s) => s.renderFns?.length).length;
    const stale = inv.screens.filter((s) => s.overwritten);
    console.log(`\nDYNAMIC\n${pad(dyn.length)} screens are produced at runtime; ${withFn} have a render function named in inventory (renderFns).`);
    console.log('     Run render-dynamic-screens.mjs to populate them before planning.');
    if (stale.length) {
      console.log(`\n${pad(stale.length)} of those ship STALE markup that a render function overwrites at load —`);
      console.log('     the extracted HTML looks like a real screen but is superseded. Do NOT');
      console.log('     plan, quote copy, or answer "which screen is this?" from it until rendered:');
      for (const s of stale) {
        console.log(`       ${s.id.padEnd(22)} ${s.file}  ← ${(s.renderFns ?? []).join('/')}()`);
      }
    }
  }

  if (inv.dynamicRegions?.count) {
    const dr = inv.dynamicRegions;
    console.log(`\nDYNAMIC REGIONS (sub-views repainted at runtime — not screens, not chrome roots)`);
    console.log(`${pad(dr.count)} getElementById(...).innerHTML= targets found for an id that is not a screen.`);
    const k = dr.byOwnerKind;
    console.log(`     owned by a screen: ${k.screen ?? 0} · owned by chrome (already covered above): ${k.chrome ?? 0} · shared container: ${k.container ?? 0} · unresolved: ${k.unresolved ?? 0} · ambiguous: ${k.ambiguous ?? 0}`);
    console.log(`     full list → ${dr.file}`);
  }

  if (inv.modules?.modules?.length) {
    console.log(`\nMODULES (auto-inferred from the nav tree — names are SUGGESTIONS, confirm via /design-module)`);
    for (const m of inv.modules.modules) {
      console.log(`     ${m.kind.padEnd(5)} ${m.name}${m.nameConfirmed ? '' : ' (unconfirmed)'}  — ${m.screens.length} screens: ${m.screens.join(', ')}`);
    }
    if (inv.modules.unassigned.length) {
      console.log(`     ${pad(inv.modules.unassigned.length)} screens in no module (unlinked): ${inv.modules.unassigned.join(', ')}`);
    }
  }

  const tokenCount = inv.tokens.count ?? inv.tokens.classified?.length ?? 0;
  console.log(`\nDESIGN SYSTEM`);
  console.log(`${pad(tokenCount)} tokens → ${inv.tokens.file ?? 'inventory.tokens.classified'}`);
  if (inv.tokens.tiers) {
    const t = inv.tokens.tiers.byTier;
    console.log(`     tiered by ${inv.tokens.tiers.from ?? inv.tokens.tiers.file} → ${inv.tokens.tiers.file}: ` +
      `${Object.entries(t).map(([k, v]) => `${v} ${k}`).join(', ')}` +
      `${inv.tokens.tiers.unmatchedFoundation ? ` · ${inv.tokens.tiers.unmatchedFoundation} companion values with no CSS token` : ''}`);
  }
  console.log(`${pad(inv.typography?.count ?? inv.typography?.length ?? 0)} typography styles (semantic type scale with the design's own RN names)`);
  console.log(`${pad(inv.styles?.compiled ?? 0)} CSS rules compiled to RN → styles/rn/`);
  console.log(`${pad((inv.assets ?? []).length)} assets`);
  if (inv.componentCandidates) {
    console.log(`${pad(inv.componentCandidates.count)} component candidates (2+ screens, real visual style) → ${inv.componentCandidates.file}`);
  }

  if (inv.fonts?.length) {
    console.log(`\nFONTS`);
    for (const f of inv.fonts) {
      console.log(`     ${f.family}  ${f.source}${f.source === 'referenced' ? ' — NOT shipped with the design; source the file or fall back to the system font' : ''}`);
      console.log(`       weights ${f.weights.join(', ') || '—'} · sizes ${f.sizes.join(', ') || '—'} · ${f.usedByCount} rules`);
    }
  } else {
    console.log('\nFONTS\n     none named beyond the system stack.');
  }

  if (inv.tokens.companions?.length) {
    console.log('\nCOMPANION FILES');
    for (const c of inv.tokens.companions) console.log(`     ${c.file} (${c.kind}) — ${c.used}`);
  }

  console.log('\nCAPABILITIES', inv.capabilities);
  console.log('\nRead next: inventory.json (index only) and screens/INDEX.md. Never the source HTML.\n');
}
