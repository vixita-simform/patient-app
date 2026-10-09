#!/usr/bin/env node
/**
 * Step 5 — structural check: do the built RN style values match the spec?
 *
 * Reads `styleMap` from <Name>.spec.json ({ "<styleKey>": { prop: designValue } },
 * keys optionally namespaced "<Base>.<key>" where <Base> is a Styles file name
 * without "Styles.ts", e.g. "HomeScreen.header", "DocCard.title"), parses the
 * StyleSheet.create blocks of the built *Styles.ts files, resolves each value
 * to a design number/colour, and lists what is missing or off.
 *
 * Resolution (paths come from .claude/react-design-to-rn/config.json → project.*):
 *   scale(14) / ms(14) / any fn(N)  → 14          (config project.scaleFn, default scale)
 *   Colors[theme].primary            → colorsFile value of `primary`
 *   theme.colors.primary             → same
 *   Fonts.size.h4 / Fonts.weight.semi / Fonts.family.bold → fontsFile block value
 *   literals                          → as is
 *
 * Usage:
 *   node audit-styles.mjs --spec design/.rdr/.build/Home.spec.json --dir src/screens/home
 *        [--styles a.ts,b.ts] [--config .claude/react-design-to-rn/config.json] [--tolerance 0.5] [--json]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[argv[i].slice(2)] = true;
      else {
        out[argv[i].slice(2)] = next;
        i += 1;
      }
    }
  }
  return out;
}

function findStyleFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...findStyleFiles(p));
    else if (/Styles\.tsx?$/.test(f)) out.push(p);
  }
  return out;
}

/** Index of matching close brace for the open brace at `i`. String-aware. */
function matchBrace(s, i) {
  let depth = 0;
  let q = null;
  for (let k = i; k < s.length; k += 1) {
    const c = s[k];
    if (q) {
      if (c === '\\') k += 1;
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return k;
    }
  }
  return -1;
}

/** Split an object body into top-level `key: value` pairs. */
function pairs(body) {
  const out = [];
  let depth = 0;
  let q = null;
  let start = 0;
  const push = (seg) => {
    const m = /^\s*(?:["']?)([\w$]+)(?:["']?)\s*:\s*([\s\S]+?)\s*$/.exec(seg);
    if (m) out.push([m[1], m[2]]);
  };
  for (let k = 0; k < body.length; k += 1) {
    const c = body[k];
    if (q) {
      if (c === '\\') k += 1;
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if ('{([' .includes(c)) depth += 1;
    else if ('})]'.includes(c)) depth -= 1;
    else if (c === ',' && depth === 0) {
      push(body.slice(start, k));
      start = k + 1;
    }
  }
  push(body.slice(start));
  return out.map(([k, v]) => [k, v.replace(/\/\/.*$/gm, '').trim()]);
}

function parseStyleFile(path) {
  const s = readFileSync(path, 'utf8');
  const at = s.indexOf('StyleSheet.create(');
  if (at < 0) return {};
  const open = s.indexOf('{', at);
  const body = s.slice(open + 1, matchBrace(s, open));
  const out = {};
  for (const [key, val] of pairs(body)) {
    if (!val.startsWith('{')) continue;
    const props = {};
    for (const [p, v] of pairs(val.slice(1, matchBrace(val, 0)))) {
      if (v.startsWith('{')) for (const [p2, v2] of pairs(v.slice(1, matchBrace(v, 0)))) props[`${p}.${p2}`] = v2;
      else props[p] = v;
    }
    out[key] = props;
  }
  return out;
}

/** Flat map from a TS constants file: "block.key" and "key" → literal value. */
function parseConstFile(path, scaleFn) {
  const map = new Map();
  if (!path || !existsSync(path)) return map;
  const s = readFileSync(path, 'utf8');
  const re = /(?:const|let|var)\s+(\w+)\s*(?::[^=]+)?=\s*\{/g;
  let m;
  while ((m = re.exec(s))) {
    const open = s.indexOf('{', m.index + m[0].length - 1);
    const close = matchBrace(s, open);
    for (const [k, v] of pairs(s.slice(open + 1, close))) {
      const lit = literal(v, scaleFn);
      if (lit === undefined) continue;
      if (!map.has(`${m[1]}.${k}`)) map.set(`${m[1]}.${k}`, lit);
      if (!map.has(k)) map.set(k, lit);
    }
  }
  return map;
}

function literal(v, scaleFn) {
  v = v.replace(/\s+as\s+const$/, '').trim();
  let m;
  if ((m = /^["'`]([^"'`]*)["'`]$/.exec(v))) return m[1];
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((m = new RegExp(`^(?:${scaleFn}|\\w+)\\((-?\\d+(?:\\.\\d+)?)\\)$`).exec(v))) return Number(m[1]);
  return undefined;
}

function normColor(v) {
  if (typeof v !== 'string') return v;
  let s = v.trim().toLowerCase().replace(/\s+/g, '');
  if (/^#[0-9a-f]{3}$/.test(s)) s = `#${[...s.slice(1)].map((c) => c + c).join('')}`;
  if (/^#[0-9a-f]{6}ff$/.test(s)) s = s.slice(0, 7);
  s = s.replace(/(^|[,(])\./g, '$10.');
  if (s === 'white') return '#ffffff';
  if (s === 'black') return '#000000';
  return s;
}

function main() {
  const a = args(process.argv.slice(2));
  if (!a.spec || (!a.dir && !a.styles)) {
    console.error('Usage: node audit-styles.mjs --spec <spec.json> --dir <screen dir> | --styles a.ts,b.ts [--config cfg.json] [--tolerance 0.5] [--json]');
    process.exit(2);
  }
  const cfgPath = resolve(a.config || '.claude/react-design-to-rn/config.json');
  const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {};
  const proj = cfg.project ?? {};
  const scaleFn = proj.scaleFn || 'scale';
  const colors = parseConstFile(proj.colorsFile && resolve(proj.colorsFile), scaleFn);
  const fonts = parseConstFile(proj.fontsFile && resolve(proj.fontsFile), scaleFn);
  const tol = Number(a.tolerance ?? 0.5);

  const spec = JSON.parse(readFileSync(resolve(a.spec), 'utf8'));
  const styleMap = spec.styleMap ?? {};
  const files = a.styles ? String(a.styles).split(',').map((p) => resolve(p)) : findStyleFiles(resolve(a.dir));

  const built = new Map(); // "Base.key" -> props ; plus bare key -> [Base.key]
  const bare = new Map();
  for (const f of files) {
    const base = basename(f).replace(/Styles\.tsx?$/, '');
    for (const [k, props] of Object.entries(parseStyleFile(f))) {
      built.set(`${base}.${k}`, { file: f, props });
      if (!bare.has(k)) bare.set(k, []);
      bare.get(k).push(`${base}.${k}`);
    }
  }

  const resolveVal = (expr) => {
    let m;
    const lit = literal(expr, scaleFn);
    if (lit !== undefined) return { ok: true, value: lit };
    if ((m = /^(?:Colors\[[^\]]+\]|theme\.colors|colors|\w+Colors)\.(\w+)$/.exec(expr)))
      return colors.has(m[1]) ? { ok: true, value: colors.get(m[1]) } : { ok: false };
    if ((m = /^Fonts\.(\w+)\.(\w+)$/.exec(expr))) {
      const v = fonts.get(`${m[1]}.${m[2]}`) ?? fonts.get(m[2]);
      return v !== undefined ? { ok: true, value: v } : { ok: false };
    }
    return { ok: false };
  };

  const report = { missingKeys: [], missingProps: [], mismatches: [], unresolved: [], checked: 0, matched: 0 };
  for (const [key, want] of Object.entries(styleMap)) {
    const cands = bare.get(key) ?? [];
    // un-namespaced keys belong to the screen's own *ScreenStyles file when several files define them
    const full = built.has(key) ? key : cands.length === 1 ? cands[0] : cands.find((c) => /Screen\./.test(c)) ?? null;
    if (!full) {
      report.missingKeys.push(cands.length > 1 ? `${key} (ambiguous: ${cands.join(', ')} — namespace it)` : key);
      continue;
    }
    const got = built.get(full).props;
    for (const [prop, wantVal] of Object.entries(want)) {
      if (prop.startsWith('$')) continue;
      report.checked += 1;
      if (!(prop in got)) {
        report.missingProps.push(`${key}.${prop} (want ${JSON.stringify(wantVal)})`);
        continue;
      }
      const r = resolveVal(got[prop]);
      if (!r.ok) {
        report.unresolved.push(`${key}.${prop} = ${got[prop]} (want ${JSON.stringify(wantVal)})`);
        continue;
      }
      const ok =
        typeof wantVal === 'number' && typeof r.value === 'number'
          ? Math.abs(wantVal - r.value) <= tol
          : String(normColor(wantVal)) === String(normColor(r.value));
      if (ok) report.matched += 1;
      else report.mismatches.push(`${key}.${prop}: built ${got[prop]} → ${JSON.stringify(r.value)}, spec ${JSON.stringify(wantVal)}`);
    }
  }
  report.files = files;
  if (a.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`audit: ${report.matched}/${report.checked} props match · ${report.mismatches.length} mismatch · ${report.missingProps.length} missing prop · ${report.missingKeys.length} missing key · ${report.unresolved.length} unresolved`);
    for (const [label, list] of [['MISMATCH', report.mismatches], ['MISSING PROP', report.missingProps], ['MISSING KEY', report.missingKeys], ['UNRESOLVED', report.unresolved]])
      for (const x of list.slice(0, 40)) console.log(`  ${label} ${x}`);
  }
}

main();
