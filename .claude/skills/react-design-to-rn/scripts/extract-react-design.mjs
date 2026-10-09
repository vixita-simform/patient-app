#!/usr/bin/env node
/**
 * Step 1 — extract a React-in-HTML design into small, readable artifacts.
 *
 * Handles designs where the app is React + JSX compiled in the browser
 * (Babel standalone), with inline style objects and state-driven screens:
 *   - the JSX lives in a <script type="text/babel"> of the HTML itself, or
 *   - the whole app is a template string injected into an iframe srcdoc
 *     (the wrapper is a device frame; the real app is inside the string).
 *
 * No LLM, no browser. Parses the JSX with @babel/parser and writes:
 *   app.html, app.jsx            runnable inner app / its script (base64 stripped from app.jsx)
 *   inventory.json               index of everything below — the only file to read first
 *   screens/<Name>.jsx           source slice of one screen + its private helpers
 *   screens/<Name>.facts.json    texts, state, handlers, branches, lists, styles, navigation
 *   components/<Name>.jsx        shared (2+ screens) components
 *   components.json              every non-screen component, props, used-by
 *   data/<NAME>.json             top-level data constants
 *   tokens.json                  named colour consts + every colour literal with usage
 *   typography.json              font combos with usage, web fonts, global css
 *   icons/<name>.svg, icons.json icon map + inline svgs, deduped
 *   assets/*                     decoded data: URIs
 *   navigation.json              root state, routes, gates, tabs
 *   hooks.json                   hook order per component (render-reference uses it)
 *   states.seed.json             how to reach every screen / sub-state
 *   CHANGELOG.md                 screens added / changed / removed since last run
 *
 * Usage:
 *   node extract-react-design.mjs --html <design.html> [--out design/.rdr]
 *        [--template-var appHTML] [--root App] [--screens A,B] [--json]
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { load } from './lib/resolve.mjs';

const { parse } = load('@babel/parser');

// ───────────────────────── args ─────────────────────────
function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true;
    else {
      out[a.slice(2)] = next;
      i += 1;
    }
  }
  return out;
}

// ───────────────────────── AST helpers ─────────────────────────
const SKIP_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'range']);

function walk(node, visit, parents = []) {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node, parents) === false) return;
  parents.push(node);
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;
    const v = node[key];
    if (Array.isArray(v)) for (const c of v) walk(c, visit, parents);
    else if (v && typeof v.type === 'string') walk(v, visit, parents);
  }
  parents.pop();
}

const isFn = (n) => n && (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression');
const isCap = (s) => /^[A-Z]/.test(s);
const jsxName = (n) => {
  if (!n) return '';
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${jsxName(n.object)}.${jsxName(n.property)}`;
  return '';
};

const BASE64_RE = /(["'`])data:([\w/+.-]+);base64,[A-Za-z0-9+/=]+\1/g;

/** Static evaluation of literal-ish expressions. Returns { ok, value }. */
function evaluate(node, env) {
  if (!node) return { ok: false };
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return { ok: true, value: node.value };
    case 'NullLiteral':
      return { ok: true, value: null };
    case 'Identifier':
      if (node.name === 'undefined') return { ok: true, value: undefined };
      return env.has(node.name) ? { ok: true, value: env.get(node.name) } : { ok: false };
    case 'TemplateLiteral': {
      let s = '';
      for (let i = 0; i < node.quasis.length; i += 1) {
        s += node.quasis[i].value.cooked;
        if (i < node.expressions.length) {
          const r = evaluate(node.expressions[i], env);
          if (!r.ok) return { ok: false };
          s += r.value;
        }
      }
      return { ok: true, value: s };
    }
    case 'UnaryExpression': {
      const r = evaluate(node.argument, env);
      if (!r.ok) return r;
      if (node.operator === '-') return { ok: true, value: -r.value };
      if (node.operator === '+') return { ok: true, value: +r.value };
      if (node.operator === '!') return { ok: true, value: !r.value };
      return { ok: false };
    }
    case 'BinaryExpression': {
      const l = evaluate(node.left, env);
      const r = evaluate(node.right, env);
      if (!l.ok || !r.ok) return { ok: false };
      const ops = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b };
      return ops[node.operator] ? { ok: true, value: ops[node.operator](l.value, r.value) } : { ok: false };
    }
    case 'ArrayExpression': {
      const out = [];
      for (const el of node.elements) {
        if (!el || el.type === 'SpreadElement') return { ok: false };
        const r = evaluate(el, env);
        if (!r.ok) return { ok: false };
        out.push(r.value);
      }
      return { ok: true, value: out };
    }
    case 'ObjectExpression': {
      const out = {};
      for (const p of node.properties) {
        if (p.type !== 'ObjectProperty' || p.computed) return { ok: false };
        const key = p.key.type === 'Identifier' ? p.key.name : p.key.value;
        const r = evaluate(p.value, env);
        if (!r.ok) return { ok: false };
        out[key] = r.value;
      }
      return { ok: true, value: out };
    }
    default:
      return { ok: false };
  }
}

// ───────────────────────── source location ─────────────────────────
function findAppSource(html, templateVar) {
  // 1. A JS template string holding a full HTML document (iframe srcdoc wrapper).
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)];
  let best = null;
  for (const m of scripts) {
    if (/text\/babel/.test(m[1])) continue;
    let ast;
    try {
      ast = parse(m[2], { sourceType: 'script', errorRecovery: true });
    } catch {
      continue;
    }
    walk(ast, (n) => {
      if (n.type !== 'VariableDeclarator' || !n.init || n.init.type !== 'TemplateLiteral') return;
      if (n.init.expressions.length) return;
      const name = n.id.type === 'Identifier' ? n.id.name : '';
      if (templateVar && name !== templateVar) return;
      const text = n.init.quasis[0].value.cooked ?? '';
      if (!/text\/babel/.test(text)) return;
      if (!best || text.length > best.text.length) best = { name, text };
    });
  }
  const appHtml = best ? best.text : html;
  // 2. The (last, largest) babel script inside it.
  const babel = [...appHtml.matchAll(/<script[^>]*type=["']text\/babel["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .sort((a, b) => b.length - a.length)[0];
  if (!babel) throw new Error('No <script type="text/babel"> found — is this a React-in-HTML design?');
  return { appHtml, jsx: babel, templateVar: best?.name ?? null };
}

// ───────────────────────── main ─────────────────────────
function main() {
  const a = args(process.argv.slice(2));
  if (!a.html) {
    console.error('Usage: node extract-react-design.mjs --html <design.html> [--out design/.rdr] [--template-var name] [--root App] [--screens A,B] [--json]');
    process.exit(2);
  }
  const htmlPath = resolve(a.html);
  const outDir = resolve(a.out || 'design/.rdr');
  const html = readFileSync(htmlPath, 'utf8');
  const { appHtml, jsx, templateVar } = findAppSource(html, a['template-var']);

  const prevInventory = existsSync(join(outDir, 'inventory.json'))
    ? JSON.parse(readFileSync(join(outDir, 'inventory.json'), 'utf8'))
    : null;

  for (const d of ['screens', 'components', 'data', 'icons', 'assets']) {
    rmSync(join(outDir, d), { recursive: true, force: true });
    mkdirSync(join(outDir, d), { recursive: true });
  }

  const ast = parse(jsx, { sourceType: 'script', plugins: ['jsx'], errorRecovery: true });
  const src = (n) => jsx.slice(n.start, n.end);
  const declSrc = (d) => (d.stmt.type === 'VariableDeclarator' ? `const ${src(d.stmt)};` : src(d.stmt));
  const lines = (n) => [n.loc.start.line, n.loc.end.line];

  // ── assets: decode every data: URI once ──
  const assets = new Map(); // base64 string -> file
  let assetN = 0;
  walk(ast, (n, parents) => {
    if (n.type !== 'StringLiteral' || !n.value.startsWith('data:')) return;
    const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(n.value);
    if (!m || assets.has(n.value)) return;
    const parent = parents[parents.length - 1];
    const base = parent?.type === 'VariableDeclarator' && parent.id.name ? parent.id.name.toLowerCase() : `asset-${++assetN}`;
    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/gif': 'gif' }[m[1]] || 'bin';
    const file = `assets/${base}.${ext}`;
    writeFileSync(join(outDir, file), Buffer.from(m[2], 'base64'));
    assets.set(n.value, file);
  });
  const stripBase64 = (text) =>
    text.replace(BASE64_RE, (whole, q) => {
      const inner = whole.slice(1, -1);
      return `${q}asset:${assets.get(inner) ?? 'unknown'}${q}`;
    });

  writeFileSync(join(outDir, 'app.html'), appHtml);
  writeFileSync(join(outDir, 'app.jsx'), stripBase64(jsx));

  // ── top-level declarations ──
  const decls = new Map(); // name -> { name, node (init or fn decl), stmt, kind }
  let rootName = a.root || null;
  for (const stmt of ast.program.body) {
    if (stmt.type === 'VariableDeclaration') {
      for (const d of stmt.declarations) {
        if (d.id.type !== 'Identifier' || !d.init) continue;
        decls.set(d.id.name, { name: d.id.name, node: d.init, stmt: d, kind: null });
      }
    } else if (stmt.type === 'FunctionDeclaration' && stmt.id) {
      decls.set(stmt.id.name, { name: stmt.id.name, node: stmt, stmt, kind: null });
    } else if (stmt.type === 'ExpressionStatement' && !rootName) {
      // ReactDOM.createRoot(...).render(<App/>)
      walk(stmt, (n) => {
        if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'render') {
          const arg = n.arguments[0];
          if (arg?.type === 'JSXElement') rootName = jsxName(arg.openingElement.name);
        }
      });
    }
  }
  if (!rootName || !decls.has(rootName)) rootName = decls.has('App') ? 'App' : rootName;
  if (!rootName || !decls.has(rootName)) throw new Error('Could not find the root component. Pass --root <Name>.');

  // env of statically known constants (tokens, data)
  const env = new Map();
  for (const d of decls.values()) {
    if (isFn(d.node) || d.node.type === 'FunctionDeclaration') continue;
    const r = evaluate(d.node, env);
    if (r.ok) env.set(d.name, r.value);
  }

  // classify
  for (const d of decls.values()) {
    if (d.node.type === 'FunctionDeclaration' || isFn(d.node)) d.kind = isCap(d.name) ? 'component' : 'helper';
    else if (env.has(d.name)) {
      const v = env.get(d.name);
      d.kind = typeof v === 'string' && v.startsWith('data:') ? 'asset' : typeof v === 'object' && v !== null ? 'data' : 'const';
    } else d.kind = 'other';
  }

  // references between top-level decls
  const refs = new Map();
  for (const d of decls.values()) {
    const set = new Set();
    walk(d.node, (n) => {
      if ((n.type === 'Identifier' || n.type === 'JSXIdentifier') && decls.has(n.name) && n.name !== d.name) set.add(n.name);
    });
    refs.set(d.name, set);
  }

  // screens = components rendered by the root (or --screens)
  const screenNames = a.screens
    ? String(a.screens).split(',').map((s) => s.trim()).filter(Boolean)
    : (() => {
        // components the root renders, minus building blocks that other candidates also use (e.g. an Icon in the tab bar)
        const cands = [...refs.get(rootName)].filter((n) => decls.get(n).kind === 'component');
        const usedByOthers = new Set();
        for (const c of cands) {
          const seen = new Set();
          const stack = [...refs.get(c)];
          while (stack.length) {
            const n = stack.pop();
            if (seen.has(n) || n === rootName) continue;
            seen.add(n);
            stack.push(...refs.get(n));
          }
          for (const n of seen) if (n !== c) usedByOthers.add(n);
        }
        return cands.filter((c) => !usedByOthers.has(c));
      })();
  const screenSet = new Set(screenNames);

  // transitive reach of each screen through non-screen decls
  const reach = new Map();
  for (const s of screenNames) {
    const seen = new Set();
    const stack = [...refs.get(s)];
    while (stack.length) {
      const n = stack.pop();
      if (seen.has(n) || screenSet.has(n) || n === rootName) continue;
      seen.add(n);
      stack.push(...refs.get(n));
    }
    reach.set(s, seen);
  }
  const usedBy = new Map();
  for (const [s, set] of reach) for (const n of set) {
    if (!usedBy.has(n)) usedBy.set(n, new Set());
    usedBy.get(n).add(s);
  }
  for (const n of refs.get(rootName)) if (!screenSet.has(n)) {
    if (!usedBy.has(n)) usedBy.set(n, new Set());
    usedBy.get(n).add(rootName);
  }
  const usersOf = (name) => [...(usedBy.get(name) ?? [])];

  // ── icon component: an object whose values are mostly <svg> JSX ──
  let iconComponent = null;
  const iconMap = new Map(); // name -> JSXElement
  for (const d of decls.values()) {
    if (d.kind !== 'component') continue;
    walk(d.node, (n) => {
      if (n.type !== 'ObjectExpression' || iconComponent) return;
      const svgProps = n.properties.filter(
        (p) => p.type === 'ObjectProperty' && p.value.type === 'JSXElement' && jsxName(p.value.openingElement.name) === 'svg'
      );
      if (svgProps.length >= 3) {
        iconComponent = d.name;
        for (const p of svgProps) iconMap.set(p.key.type === 'Identifier' ? p.key.name : p.key.value, p.value);
      }
    });
  }

  // ── svg serializer ──
  const KEEP_CAMEL = new Set(['viewBox', 'preserveAspectRatio', 'gradientUnits', 'gradientTransform', 'patternUnits']);
  const kebab = (s) => (KEEP_CAMEL.has(s) ? s : s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
  function svgOf(el, { normalize = false } = {}) {
    const name = jsxName(el.openingElement.name);
    const attrs = [];
    for (const at of el.openingElement.attributes) {
      if (at.type !== 'JSXAttribute') continue;
      const key = at.name.name;
      if (key === 'key') continue;
      let val;
      if (!at.value) val = 'true';
      else if (at.value.type === 'StringLiteral') val = at.value.value;
      else if (at.value.type === 'JSXExpressionContainer') {
        const ex = at.value.expression;
        const r = evaluate(ex, env);
        if (r.ok) val = String(r.value);
        else if (/^(width|height|size)$/.test(key)) val = '24';
        else if (/fill|stroke|color/i.test(key)) val = 'currentColor';
        else val = '';
      }
      if (normalize && /^(width|height)$/.test(key)) continue;
      if (normalize && /^(stroke|fill|color)$/.test(key) && val !== 'none') val = 'currentColor';
      attrs.push(`${kebab(key)}="${String(val).replace(/"/g, '&quot;')}"`);
    }
    if (name === 'svg' && !attrs.some((x) => x.startsWith('xmlns='))) attrs.unshift('xmlns="http://www.w3.org/2000/svg"');
    const kids = el.children.filter((c) => c.type === 'JSXElement').map((c) => svgOf(c, { normalize }));
    return kids.length ? `<${name} ${attrs.join(' ')}>${kids.join('')}</${name}>` : `<${name} ${attrs.join(' ')}/>`;
  }
  const viewBoxOf = (el) => {
    const at = el.openingElement.attributes.find((x) => x.type === 'JSXAttribute' && x.name.name === 'viewBox');
    return at?.value?.type === 'StringLiteral' ? at.value.value : null;
  };

  // which top-level decl contains a given offset
  const declSpans = [...decls.values()].map((d) => ({ name: d.name, start: d.stmt.start, end: d.stmt.end }));
  const ownerAt = (pos) => declSpans.find((s) => pos >= s.start && pos < s.end)?.name;
  const screensFor = (declName) => (screenSet.has(declName) ? [declName] : usersOf(declName));

  // icons
  const icons = [];
  const iconByKey = new Map();
  for (const [name, el] of iconMap) {
    const svg = svgOf(el);
    writeFileSync(join(outDir, `icons/${name}.svg`), svg);
    const entry = { name, file: `icons/${name}.svg`, source: `${iconComponent} map`, viewBox: viewBoxOf(el), usedBy: new Set(), lines: [el.loc.start.line] };
    icons.push(entry);
    iconByKey.set(svgOf(el, { normalize: true }), entry);
  }
  let inlineN = 0;
  walk(ast, (n, parents) => {
    if (n.type !== 'JSXElement' || jsxName(n.openingElement.name) !== 'svg') return;
    if (parents.some((p) => p.type === 'JSXElement' && jsxName(p.openingElement.name) === 'svg')) return;
    const owner = ownerAt(n.start);
    if (owner === iconComponent) return false;
    const key = svgOf(n, { normalize: true });
    let entry = iconByKey.get(key);
    if (!entry) {
      const name = `inline-${++inlineN}`;
      writeFileSync(join(outDir, `icons/${name}.svg`), svgOf(n));
      entry = { name, file: `icons/${name}.svg`, source: 'inline', viewBox: viewBoxOf(n), usedBy: new Set(), lines: [] };
      icons.push(entry);
      iconByKey.set(key, entry);
    }
    entry.lines.push(n.loc.start.line);
    for (const s of screensFor(owner)) entry.usedBy.add(s);
    return false;
  });
  // usage of the icon component by name
  if (iconComponent) {
    walk(ast, (n) => {
      if (n.type !== 'JSXOpeningElement' || jsxName(n.name) !== iconComponent) return;
      const at = n.attributes.find((x) => x.type === 'JSXAttribute' && x.name.name === 'name');
      const owner = ownerAt(n.start);
      const names = [];
      if (at?.value?.type === 'StringLiteral') names.push(at.value.value);
      for (const nm of names) {
        const e = icons.find((i) => i.name === nm);
        if (e) for (const s of screensFor(owner)) e.usedBy.add(s);
      }
    });
  }
  // icons referenced via data (e.g. NAV_ITEMS[].icon)
  for (const d of decls.values()) {
    if (d.kind !== 'data') continue;
    const json = JSON.stringify(env.get(d.name));
    for (const e of icons) if (e.source !== 'inline' && json.includes(`"icon":"${e.name}"`)) for (const s of screensFor(d.name)) e.usedBy.add(s);
  }

  // ── style evaluation ──
  function styleValue(node) {
    const r = evaluate(node, env);
    if (r.ok) return r.value;
    if (node.type === 'ConditionalExpression') return { $cond: src(node.test), then: styleValue(node.consequent), else: styleValue(node.alternate) };
    return { $expr: stripBase64(src(node)).slice(0, 160) };
  }
  function styleObject(node) {
    if (!node) return null;
    if (node.type !== 'ObjectExpression') {
      const r = evaluate(node, env);
      return r.ok ? r.value : { $expr: src(node).slice(0, 160) };
    }
    const out = {};
    const tokenRefs = {};
    for (const p of node.properties) {
      if (p.type === 'SpreadElement') {
        out[`$spread:${src(p.argument)}`] = true;
        continue;
      }
      if (p.type !== 'ObjectProperty') continue;
      const key = p.computed ? `[${src(p.key)}]` : p.key.type === 'Identifier' ? p.key.name : p.key.value;
      out[key] = styleValue(p.value);
      const ids = [];
      walk(p.value, (n) => {
        if (n.type === 'Identifier' && decls.get(n.name)?.kind === 'const') ids.push(n.name);
      });
      if (ids.length) tokenRefs[key] = [...new Set(ids)];
    }
    if (Object.keys(tokenRefs).length) out.$tokens = tokenRefs;
    return out;
  }

  // ── colour + typography usage across the app ──
  const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|(?:linear|radial)-gradient\((?:[^()]|\([^)]*\))*\)/g;
  const colorUse = new Map();
  const gradientUse = new Map();
  const addColor = (v, owner) => {
    for (const m of v.matchAll(COLOR_RE)) {
      const key = m[0].replace(/\s+/g, '');
      const bucket = key.includes('gradient') ? gradientUse : colorUse;
      if (!bucket.has(key)) bucket.set(key, { value: m[0], count: 0, usedBy: new Set() });
      const e = bucket.get(key);
      e.count += 1;
      for (const s of screensFor(owner) ?? []) e.usedBy.add(s);
    }
  };
  walk(ast, (n) => {
    if (n.type === 'StringLiteral' && !n.value.startsWith('data:')) addColor(n.value, ownerAt(n.start));
    if (n.type === 'TemplateElement') addColor(n.value.cooked ?? '', ownerAt(n.start));
  });
  const named = {};
  const namedUsage = {};
  for (const d of decls.values()) {
    if (d.kind !== 'const' || typeof env.get(d.name) !== 'string') continue;
    const v = env.get(d.name);
    if (!/^(#[0-9a-fA-F]{3,8}|rgba?\(.*\))$/.test(v)) continue;
    named[d.name] = v;
    let c = 0;
    walk(ast, (n) => {
      if (n.type === 'Identifier' && n.name === d.name) c += 1;
    });
    namedUsage[d.name] = c - 1;
  }
  const sortUse = (m) =>
    [...m.values()].sort((x, y) => y.count - x.count).map((e) => ({ value: e.value, count: e.count, usedBy: [...e.usedBy].sort() }));
  writeFileSync(
    join(outDir, 'tokens.json'),
    JSON.stringify({ named, namedUsage, literals: sortUse(colorUse), gradients: sortUse(gradientUse) }, null, 2)
  );

  // ── per-element style scan (used for typography + facts) ──
  const TYPO_KEYS = ['fontSize', 'fontWeight', 'fontFamily', 'letterSpacing', 'lineHeight', 'textTransform', 'fontStyle'];
  const typo = new Map();
  function scanStyles(rootNode, owner) {
    const out = [];
    walk(rootNode, (n, parents) => {
      if (n.type !== 'JSXElement') return;
      const op = n.openingElement;
      const tag = jsxName(op.name);
      const styleAttr = op.attributes.find((x) => x.type === 'JSXAttribute' && x.name.name === 'style');
      if (!styleAttr || styleAttr.value?.type !== 'JSXExpressionContainer') return;
      if (tag === 'svg' || parents.some((p) => p.type === 'JSXElement' && jsxName(p.openingElement.name) === 'svg')) return;
      const style = styleObject(styleAttr.value.expression);
      const path = parents
        .filter((p) => p.type === 'JSXElement')
        .map((p) => jsxName(p.openingElement.name))
        .concat(tag)
        .join('>');
      // first static text below this element, else the first bound expression (e.g. {client.name})
      let text = '';
      let bind = '';
      walk(n, (c, ps) => {
        if (text) return false;
        if (c.type === 'JSXAttribute') return false;
        if (c.type === 'JSXText' && c.value.trim()) text = c.value.trim().replace(/\s+/g, ' ');
        else if (!bind && c.type === 'JSXExpressionContainer' && c.expression.type !== 'JSXEmptyExpression' && ps[ps.length - 1]?.type === 'JSXElement')
          bind = src(c.expression).replace(/\s+/g, ' ').slice(0, 60);
      });
      const entry = { line: n.loc.start.line, tag, path: path.split('>').slice(-4).join('>'), ...(text ? { text: text.slice(0, 50) } : bind ? { bind } : {}), style };
      out.push(entry);
      // typography
      if (style && typeof style === 'object' && TYPO_KEYS.some((k) => k in style)) {
        const combo = { tag: /^h[1-6]$/.test(tag) ? tag : undefined };
        for (const k of TYPO_KEYS) if (k in style) combo[k] = style[k];
        const key = JSON.stringify(combo);
        if (!typo.has(key)) typo.set(key, { ...combo, count: 0, usedBy: new Set(), sample: entry.text });
        const t = typo.get(key);
        t.count += 1;
        for (const s of screensFor(owner)) t.usedBy.add(s);
      }
    });
    return out;
  }

  // ── facts for one component body ──
  function bodyStatements(fnNode) {
    const body = fnNode.type === 'FunctionDeclaration' ? fnNode.body : fnNode.body;
    return body.type === 'BlockStatement' ? body.body : [];
  }
  function hookOrder(fnNode) {
    const out = [];
    for (const st of bodyStatements(fnNode)) {
      const calls = [];
      if (st.type === 'VariableDeclaration') {
        for (const d of st.declarations) {
          if (d.init?.type === 'CallExpression' && d.init.callee.type === 'Identifier' && /^use[A-Z]/.test(d.init.callee.name)) {
            const name =
              d.id.type === 'ArrayPattern' ? d.id.elements[0]?.name : d.id.type === 'Identifier' ? d.id.name : null;
            const setter = d.id.type === 'ArrayPattern' ? d.id.elements[1]?.name : null;
            calls.push({ hook: d.init.callee.name, name, setter, initial: d.init.arguments[0] ? src(d.init.arguments[0]).slice(0, 80) : undefined });
          }
        }
      } else if (st.type === 'ExpressionStatement' && st.expression.type === 'CallExpression' && st.expression.callee.type === 'Identifier' && /^use[A-Z]/.test(st.expression.callee.name)) {
        calls.push({ hook: st.expression.callee.name });
      }
      out.push(...calls);
    }
    return out;
  }
  function propsOf(fnNode) {
    const p = fnNode.params?.[0];
    if (!p) return [];
    if (p.type === 'ObjectPattern')
      return p.properties
        .filter((x) => x.type === 'ObjectProperty')
        .map((x) => {
          const name = x.key.name ?? x.key.value;
          return x.value.type === 'AssignmentPattern' ? { name, default: stripBase64(src(x.value.right)).slice(0, 60) } : { name };
        });
    return [{ name: src(p) }];
  }

  const TEXT_ATTRS = new Set(['placeholder', 'title', 'alt', 'label', 'aria-label', 'accessibilityLabel']);
  function factsFor(screen, ownNodes) {
    const node = decls.get(screen).node;
    const hooks = hookOrder(node);
    const stateNames = new Set(hooks.filter((h) => h.hook === 'useState').map((h) => h.name));
    const setterToState = new Map(hooks.filter((h) => h.setter).map((h) => [h.setter, h.name]));
    const props = propsOf(node);
    const propNames = new Set(props.map((p) => p.name));
    const texts = [];
    const textSeen = new Set();
    const stateValues = {};
    const handlers = [];
    const branches = [];
    const branchSeen = new Set();
    const lists = [];
    const propCalls = [];
    const inputs = [];
    const localData = [];
    const elementsUsed = {};
    const iconNames = new Set();
    const addText = (t, line, kind) => {
      const v = t.replace(/\s+/g, ' ').trim();
      if (!v || /^[\s·•|,.:;()\-–—/]+$/.test(v)) return;
      if (/^(#[0-9a-f]{3,8}|rgba?\(|\d+(px|%)?$)/i.test(v) || iconMap.has(v)) return;
      const key = `${kind}|${v}`;
      if (textSeen.has(key)) return;
      textSeen.add(key);
      texts.push({ text: v, line, kind });
    };
    const addValue = (state, v) => {
      if (!stateValues[state]) stateValues[state] = [];
      if (!stateValues[state].includes(v)) stateValues[state].push(v);
    };

    // locals: handlers and data declared in the body
    for (const st of bodyStatements(node)) {
      if (st.type !== 'VariableDeclaration') continue;
      for (const d of st.declarations) {
        if (d.id.type !== 'Identifier' || !d.init) continue;
        if (isFn(d.init)) handlers.push({ name: d.id.name, line: d.loc.start.line, source: src(d.init).replace(/\s+/g, ' ').slice(0, 300) });
        else {
          const r = evaluate(d.init, env);
          if (r.ok && typeof r.value === 'object' && r.value !== null) localData.push({ name: d.id.name, line: d.loc.start.line, value: r.value });
        }
      }
    }

    for (const own of ownNodes) {
      const isScreenBody = own === node;
      walk(own, (n, parents) => {
        const parent = parents[parents.length - 1];
        if (n.type === 'JSXOpeningElement') {
          const tag = jsxName(n.name);
          elementsUsed[tag] = (elementsUsed[tag] ?? 0) + 1;
          if (tag === iconComponent) {
            const at = n.attributes.find((x) => x.type === 'JSXAttribute' && x.name.name === 'name');
            if (at?.value?.type === 'StringLiteral') iconNames.add(at.value.value);
            else if (at?.value) iconNames.add(`{${src(at.value.expression)}}`);
          }
          if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            const o = { line: n.loc.start.line, tag };
            for (const at of n.attributes) {
              if (at.type !== 'JSXAttribute' || at.name.name === 'style') continue;
              o[at.name.name] = !at.value ? true : at.value.type === 'StringLiteral' ? at.value.value : `{${src(at.value.expression).slice(0, 80)}}`;
            }
            inputs.push(o);
          }
          for (const at of n.attributes) {
            if (at.type === 'JSXAttribute' && TEXT_ATTRS.has(at.name.name) && at.value?.type === 'StringLiteral')
              addText(at.value.value, n.loc.start.line, `attr:${at.name.name}`);
          }
        }
        if (n.type === 'JSXText') addText(n.value, n.loc.start.line, 'jsx');
        if ((n.type === 'StringLiteral' || n.type === 'TemplateLiteral') && !n.value?.startsWith?.('data:')) {
          // user-facing strings inside a JSX child expression (not style, not comparisons, not keys)
          const inStyle = parents.some((p) => p.type === 'JSXAttribute' && p.name.name !== 'children' && !TEXT_ATTRS.has(p.name.name));
          const inChildExpr = parents.some(
            (p, i) => p.type === 'JSXExpressionContainer' && (parents[i - 1]?.type === 'JSXElement' || parents[i - 1]?.type === 'JSXFragment')
          );
          const inCompare = parent?.type === 'BinaryExpression' || (parent?.type === 'CallExpression' && parent.callee !== n && !/join|concat/.test(src(parent.callee)));
          const isKey = parent?.type === 'ObjectProperty' && parent.key === n;
          const inMember = parent?.type === 'MemberExpression';
          if (inChildExpr && !inStyle && !inCompare && !isKey && !inMember) {
            if (n.type === 'StringLiteral') addText(n.value, n.loc.start.line, 'expr');
            else for (const q of n.quasis) addText(q.value.cooked ?? '', n.loc.start.line, 'template');
          }
        }
        if (n.type === 'BinaryExpression' && /^[!=]==?$/.test(n.operator)) {
          const [id, lit] = n.left.type === 'Identifier' ? [n.left, n.right] : [n.right, n.left];
          if (id.type === 'Identifier' && stateNames.has(id.name) && ['StringLiteral', 'NumericLiteral'].includes(lit.type)) addValue(id.name, lit.value);
        }
        if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
          const callee = n.callee.name;
          if (setterToState.has(callee) && n.arguments[0]) {
            const r = evaluate(n.arguments[0], env);
            if (r.ok && (typeof r.value === 'string' || typeof r.value === 'number' || typeof r.value === 'boolean')) addValue(setterToState.get(callee), r.value);
          }
          if (propNames.has(callee)) propCalls.push({ prop: callee, args: n.arguments.map((x) => src(x).slice(0, 60)), line: n.loc.start.line });
        }
        if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'map') {
          const fn = n.arguments[0];
          lists.push({
            line: n.loc.start.line,
            source: stripBase64(src(n.callee.object)).replace(/\s+/g, ' ').slice(0, 120),
            params: isFn(fn) ? fn.params.map((p) => src(p).slice(0, 40)) : [],
          });
        }
        const inJsxExpr = parents.some((p) => p.type === 'JSXExpressionContainer');
        if (n.type === 'ConditionalExpression' && inJsxExpr) {
          const t = src(n.test).replace(/\s+/g, ' ');
          if (!parents.some((p) => p.type === 'JSXAttribute') && !branchSeen.has(t)) {
            branchSeen.add(t);
            branches.push({ kind: 'ternary', test: t.slice(0, 120), line: n.loc.start.line });
          }
        }
        if (n.type === 'LogicalExpression' && n.operator === '&&' && inJsxExpr && (n.right.type === 'JSXElement' || n.right.type === 'JSXFragment')) {
          const t = src(n.left).replace(/\s+/g, ' ');
          if (!branchSeen.has(t)) {
            branchSeen.add(t);
            branches.push({ kind: 'and', test: t.slice(0, 120), line: n.loc.start.line });
          }
        }
        if (isScreenBody && n.type === 'IfStatement' && parents.length && (n.consequent.type === 'ReturnStatement' || n.consequent.body?.some?.((s) => s.type === 'ReturnStatement'))) {
          const t = src(n.test).replace(/\s+/g, ' ');
          if (!branchSeen.has(t)) {
            branchSeen.add(t);
            branches.push({ kind: 'early-return', test: t.slice(0, 120), line: n.loc.start.line });
          }
        }
      });
    }

    // JSX props passed to layout components (e.g. <SubScreen title=".." back="more">)
    const layoutProps = [];
    walk(node, (n) => {
      if (n.type !== 'JSXOpeningElement') return;
      const tag = jsxName(n.name);
      if (!decls.has(tag) || tag === iconComponent) return;
      const o = {};
      for (const at of n.attributes) {
        if (at.type !== 'JSXAttribute') continue;
        if (at.value?.type === 'StringLiteral') o[at.name.name] = at.value.value;
      }
      if (Object.keys(o).length) layoutProps.push({ component: tag, line: n.loc.start.line, props: o });
    });

    const styles = [];
    for (const own of ownNodes) {
      const ownerName = [...decls.values()].find((d) => d.node === own)?.name ?? screen;
      for (const s of scanStyles(own, ownerName)) styles.push({ owner: ownerName, ...s });
    }

    const shared = [...reach.get(screen)].filter((n) => decls.get(n).kind === 'component' && usersOf(n).length > 1);
    const data = [...reach.get(screen)].filter((n) => decls.get(n).kind === 'data');
    return {
      screen,
      props,
      hooks,
      stateValues,
      handlers,
      localData,
      propCalls,
      layoutProps: layoutProps.slice(0, 40),
      branches,
      lists,
      inputs,
      texts,
      icons: [...iconNames],
      sharedComponents: shared,
      data,
      elementsUsed,
      styles,
    };
  }

  // ── write components ──
  const components = [];
  for (const d of decls.values()) {
    if (d.kind !== 'component' || screenSet.has(d.name) || d.name === rootName) continue;
    const users = usersOf(d.name);
    const fn = d.node;
    const entry = {
      name: d.name,
      lines: lines(d.stmt),
      props: propsOf(fn),
      usedBy: users.sort(),
      shared: users.length > 1,
      isIconComponent: d.name === iconComponent,
    };
    if (entry.shared || users.includes(rootName)) {
      entry.file = `components/${d.name}.jsx`;
      writeFileSync(join(outDir, entry.file), `// ${d.name} — app.jsx lines ${entry.lines.join('-')}; used by: ${users.join(', ')}\n${stripBase64(declSrc(d))}\n`);
    }
    components.push(entry);
  }
  writeFileSync(join(outDir, 'components.json'), JSON.stringify(components, null, 2));

  // ── write data ──
  const data = [];
  for (const d of decls.values()) {
    if (d.kind !== 'data') continue;
    const v = env.get(d.name);
    const file = `data/${d.name}.json`;
    writeFileSync(join(outDir, file), JSON.stringify(v, null, 2));
    data.push({ name: d.name, file, count: Array.isArray(v) ? v.length : Object.keys(v).length, usedBy: usersOf(d.name).sort() });
  }

  // ── screens ──
  const hooksJson = {};
  for (const d of decls.values()) if (d.kind === 'component') hooksJson[d.name] = hookOrder(d.node).map((h) => h.name ?? h.hook);
  writeFileSync(join(outDir, 'hooks.json'), JSON.stringify(hooksJson, null, 2));

  const screens = [];
  for (const s of screenNames) {
    const d = decls.get(s);
    const privates = [...reach.get(s)].filter((n) => ['component', 'helper'].includes(decls.get(n).kind) && usersOf(n).length === 1 && n !== iconComponent);
    const shared = [...reach.get(s)].filter((n) => decls.get(n).kind === 'component' && usersOf(n).length > 1);
    const dataUsed = [...reach.get(s)].filter((n) => decls.get(n).kind === 'data');
    const parts = [
      `// Screen: ${s} — app.jsx lines ${lines(d.stmt).join('-')}`,
      shared.length ? `// Shared components (components/*.jsx): ${shared.join(', ')}` : null,
      dataUsed.length ? `// Data (data/*.json): ${dataUsed.join(', ')}` : null,
      '',
    ].filter((x) => x !== null);
    for (const p of privates.sort((x, y) => decls.get(x).stmt.start - decls.get(y).stmt.start)) {
      const pd = decls.get(p);
      parts.push(`// ── private: ${p} (app.jsx ${lines(pd.stmt).join('-')})`, stripBase64(declSrc(pd)), '');
    }
    parts.push(`// ── screen`, stripBase64(declSrc(d)), '');
    const sliceText = parts.join('\n');
    writeFileSync(join(outDir, `screens/${s}.jsx`), sliceText);
    const facts = factsFor(s, [d.node, ...privates.filter((p) => decls.get(p).kind === 'component').map((p) => decls.get(p).node)]);
    writeFileSync(join(outDir, `screens/${s}.facts.json`), JSON.stringify(facts, null, 2));
    screens.push({
      name: s,
      file: `screens/${s}.jsx`,
      facts: `screens/${s}.facts.json`,
      lines: lines(d.stmt),
      bytes: sliceText.length,
      hash: createHash('sha1').update(sliceText).digest('hex').slice(0, 12),
      privateComponents: privates,
      sharedComponents: shared,
      data: dataUsed,
      icons: icons.filter((i) => i.usedBy.has(s)).map((i) => i.name),
      counts: {
        texts: facts.texts.length,
        styles: facts.styles.length,
        state: facts.hooks.filter((h) => h.hook === 'useState').length,
        branches: facts.branches.length,
        lists: facts.lists.length,
        inputs: facts.inputs.length,
      },
    });
  }

  // ── typography + fonts ──
  const fonts = [];
  for (const m of appHtml.matchAll(/fonts\.googleapis\.com\/css2\?([^"']+)/g)) {
    for (const fam of m[1].split('&').filter((x) => x.startsWith('family='))) {
      const [name, spec] = decodeURIComponent(fam.slice(7)).replace(/\+/g, ' ').split(':');
      fonts.push({ family: name, spec: spec ?? null });
    }
  }
  const globalCss = [...appHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1].trim()).join('\n\n');
  writeFileSync(join(outDir, 'global.css'), globalCss);
  writeFileSync(
    join(outDir, 'typography.json'),
    JSON.stringify(
      {
        fonts,
        globalCss: 'global.css',
        combos: [...typo.values()].sort((x, y) => y.count - x.count).map((t) => ({ ...t, usedBy: [...t.usedBy].sort() })),
      },
      null,
      2
    )
  );

  // ── navigation (root analysis) ──
  const root = decls.get(rootName).node;
  const rootHooks = hookOrder(root);
  const rootState = Object.fromEntries(
    rootHooks.filter((h) => h.hook === 'useState').map((h) => {
      const init = evaluate(parse(`(${h.initial ?? 'undefined'})`, { sourceType: 'script' }).program.body[0].expression, env);
      return [h.name, init.ok ? init.value : h.initial];
    })
  );
  const routes = [];
  const gates = [];
  let tabs = null;
  let switchOn = null;
  const elementNames = (n) => {
    const out = [];
    walk(n, (c) => {
      if (c.type === 'JSXOpeningElement' && screenSet.has(jsxName(c.name))) out.push(jsxName(c.name));
    });
    return out;
  };
  walk(root, (n, parents) => {
    if (n.type === 'SwitchStatement') {
      switchOn = src(n.discriminant);
      for (const c of n.cases) {
        const target = elementNames({ type: 'X', body: c.consequent, ...{} });
        let comps = [];
        for (const st of c.consequent) comps = comps.concat(elementNames(st));
        const props = {};
        walk({ type: 'Block', body: c.consequent }, (x) => {
          if (x.type === 'JSXOpeningElement' && screenSet.has(jsxName(x.name)))
            for (const at of x.attributes) if (at.type === 'JSXAttribute') props[at.name.name] = at.value ? (at.value.type === 'StringLiteral' ? at.value.value : src(at.value.expression).slice(0, 80)) : true;
        });
        routes.push({ key: c.test ? (c.test.value ?? src(c.test)) : 'default', component: comps[0] ?? target[0] ?? null, props });
      }
    }
    if (n.type === 'IfStatement' && parents.every((p) => p.type !== 'SwitchStatement') && !parents.some((p) => isFn(p) && p !== root)) {
      gates.push({ test: src(n.test), line: n.loc.start.line, renders: elementNames(n.consequent), node: n });
    }
    if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'map' && n.callee.object.type === 'Identifier') {
      const nm = n.callee.object.name;
      if (decls.get(nm)?.kind === 'data' && !tabs) tabs = { source: nm, items: env.get(nm) };
    }
  });
  const derived = [];
  for (const st of bodyStatements(root)) {
    if (st.type !== 'VariableDeclaration') continue;
    for (const d of st.declarations) if (d.id.type === 'Identifier' && d.init && !isFn(d.init) && d.init.type !== 'CallExpression') derived.push({ name: d.id.name, source: src(d.init).slice(0, 400) });
  }
  // the design's app column (maxWidth on the root's outer element) — the reference viewport width
  const rootStyles = scanStyles(root, rootName);
  const frameStyle = rootStyles.find((x) => x.style && typeof x.style.maxWidth === 'number')?.style;
  const frame = frameStyle ? { maxWidth: frameStyle.maxWidth, background: frameStyle.background ?? frameStyle.backgroundColor ?? null } : null;
  writeFileSync(
    join(outDir, 'navigation.json'),
    JSON.stringify(
      {
        root: rootName,
        frame,
        rootState,
        switchOn,
        routes,
        gates: gates.map(({ node, ...g }) => g),
        tabs,
        derived,
        note: 'routes[].props show what the root passes each screen (navigation callbacks). gates are early returns before the switch (splash / auth).',
      },
      null,
      2
    )
  );

  // ── states seed ──
  // A state = list of {set:"Component", name, hook, value} applied via React fiber hooks, then screenshot.
  const hookIdx = (comp, name) => hooksJson[comp]?.indexOf(name);
  const setOp = (comp, name, value) => ({ set: comp, name, hook: hookIdx(comp, name), value });
  const condOps = (test, truthy) => {
    // Identifier / !Identifier / id==="lit" on root state
    if (test.type === 'Identifier' && test.name in rootState) return [setOp(rootName, test.name, truthy)];
    if (test.type === 'UnaryExpression' && test.operator === '!' && test.argument.type === 'Identifier' && test.argument.name in rootState)
      return [setOp(rootName, test.argument.name, !truthy)];
    if (test.type === 'BinaryExpression' && test.operator === '===' && test.left.type === 'Identifier' && test.left.name in rootState && test.right.type === 'StringLiteral') {
      if (truthy) return [setOp(rootName, test.left.name, test.right.value)];
      const init = rootState[test.left.name];
      return init !== test.right.value ? [setOp(rootName, test.left.name, init)] : null;
    }
    return null;
  };
  const states = {};
  const todo = [];
  const priorGateOps = [];
  for (const g of gates) {
    const enter = condOps(g.node.test, true);
    const skip = condOps(g.node.test, false);
    // screens rendered inside this gate, following ternaries on root state
    const visit = (n, ops) => {
      if (!n) return;
      if (n.type === 'ReturnStatement') return visit(n.argument, ops);
      if (n.type === 'BlockStatement') return n.body.forEach((x) => visit(x, ops));
      if (n.type === 'ConditionalExpression') {
        const t = condOps(n.test, true);
        const f = condOps(n.test, false);
        visit(n.consequent, t ? [...ops, ...t] : ops);
        visit(n.alternate, f ? [...ops, ...f] : ops);
        return;
      }
      if (n.type === 'JSXElement') {
        const nm = jsxName(n.openingElement.name);
        if (screenSet.has(nm)) states[nm] = { screen: nm, steps: [...priorGateOps, ...ops] };
      }
    };
    if (enter) visit(g.node.consequent, enter);
    else todo.push(`gate "${g.test}" — could not derive state ops`);
    if (skip) priorGateOps.push(...skip);
    else todo.push(`gate "${g.test}" — could not derive how to skip it`);
  }
  for (const r of routes) {
    if (!r.component || states[r.component] || r.key === 'default') continue;
    const discr = switchOn && switchOn in rootState ? switchOn : null;
    states[r.component] = { screen: r.component, steps: [...priorGateOps, ...(discr ? [setOp(rootName, discr, r.key)] : [])] };
  }
  for (const s of screenNames) if (!states[s]) todo.push(`${s} — not reachable from root analysis; add its steps by hand`);
  // sub-states from screen state values / booleans
  for (const sc of screens) {
    const base = states[sc.name];
    if (!base) continue;
    const facts = JSON.parse(readFileSync(join(outDir, sc.facts), 'utf8'));
    for (const h of facts.hooks) {
      if (h.hook !== 'useState') continue;
      const init = (() => {
        try {
          const r = evaluate(parse(`(${h.initial ?? 'undefined'})`, { sourceType: 'script' }).program.body[0].expression, env);
          return r.ok ? r.value : Symbol('dynamic');
        } catch {
          return Symbol('dynamic');
        }
      })();
      const values = (facts.stateValues[h.name] ?? []).filter((v) => v !== init);
      if (typeof init === 'boolean' && !values.includes(!init)) values.push(!init);
      for (const v of values.slice(0, 6)) {
        const id = `${sc.name}.${h.name}=${String(v).replace(/\s+/g, '_')}`;
        states[id] = { screen: sc.name, steps: [...base.steps, { waitMs: 300 }, setOp(sc.name, h.name, v)] };
      }
    }
  }
  writeFileSync(
    join(outDir, 'states.seed.json'),
    JSON.stringify(
      {
        note: 'Auto-seeded. Override or add entries in .claude/react-design-to-rn/states.json (same shape; user entries win by key). Step types: {set,name,hook?,value} | {click:"visible text"} | {waitMs} | {eval:"js"}',
        todo,
        states,
      },
      null,
      2
    )
  );

  // ── inventory + changelog ──
  const inventory = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      file: htmlPath,
      bytes: html.length,
      sha1: createHash('sha1').update(html).digest('hex').slice(0, 12),
      templateVar,
    },
    root: rootName,
    frame,
    iconComponent,
    screens,
    components: components.map((c) => ({ name: c.name, shared: c.shared, usedBy: c.usedBy.length, file: c.file ?? null })),
    data,
    icons: icons.map((i) => ({ name: i.name, file: i.file, source: i.source, usedBy: [...i.usedBy].sort() })),
    assets: [...assets.values()],
    files: {
      tokens: 'tokens.json',
      typography: 'typography.json',
      components: 'components.json',
      navigation: 'navigation.json',
      hooks: 'hooks.json',
      states: 'states.seed.json',
      appHtml: 'app.html',
      appJsx: 'app.jsx',
      globalCss: 'global.css',
    },
    counts: {
      screens: screens.length,
      components: components.length,
      sharedComponents: components.filter((c) => c.shared).length,
      data: data.length,
      namedColors: Object.keys(named).length,
      colorLiterals: colorUse.size,
      icons: icons.length,
      states: Object.keys(states).length,
    },
  };
  writeFileSync(join(outDir, 'inventory.json'), JSON.stringify(inventory, null, 2));

  const changes = [];
  if (prevInventory) {
    const prev = new Map(prevInventory.screens.map((s) => [s.name, s]));
    const curr = new Map(screens.map((s) => [s.name, s]));
    for (const s of screens) {
      if (!prev.has(s.name)) changes.push(`- added: ${s.name}`);
      else if (prev.get(s.name).hash !== s.hash) changes.push(`- changed: ${s.name}`);
    }
    for (const n of prev.keys()) if (!curr.has(n)) changes.push(`- removed: ${n}`);
  }
  const changelogPath = join(outDir, 'CHANGELOG.md');
  const old = existsSync(changelogPath) ? readFileSync(changelogPath, 'utf8') : '# Extraction changelog\n';
  const entry = `\n## ${inventory.generatedAt} (source ${inventory.source.sha1})\n${prevInventory ? changes.join('\n') || '- no screen changes' : '- first extraction'}\n`;
  writeFileSync(changelogPath, old + entry);

  // mark specs stale in status.json
  const statusPath = join(outDir, 'status.json');
  if (existsSync(statusPath) && changes.length) {
    const status = JSON.parse(readFileSync(statusPath, 'utf8'));
    for (const c of changes) {
      const m = /^- (changed|removed): (.+)$/.exec(c);
      if (m && status.screens?.[m[2]]) status.screens[m[2]].specStale = true;
    }
    writeFileSync(statusPath, JSON.stringify(status, null, 2));
  }

  // ── summary ──
  const summary = {
    out: outDir,
    root: rootName,
    counts: inventory.counts,
    screens: screens.map((s) => `${s.name}(${s.counts.texts}t/${s.counts.styles}s/${s.counts.state}st)`),
    shared: components.filter((c) => c.shared).map((c) => c.name),
    changes,
    todo,
  };
  if (a.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(`Extracted → ${outDir}`);
    console.log(`root: ${rootName} · ${JSON.stringify(inventory.counts)}`);
    console.log(`screens: ${summary.screens.join(', ')}`);
    console.log(`shared components: ${summary.shared.join(', ') || '-'}`);
    if (changes.length) console.log(`changes:\n${changes.join('\n')}`);
    if (todo.length) console.log(`todo:\n- ${todo.join('\n- ')}`);
  }
}

main();
