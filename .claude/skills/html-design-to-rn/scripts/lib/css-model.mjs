/**
 * CSS → React Native, done once at extract time instead of once per screen by
 * hand. Phase 3's builder used to read raw CSS rules out of `app.css` and
 * translate them in its head; every translation was a chance to drop a
 * declaration, scale a font size like a spacing value, or miss that a
 * `var(--x)` resolves to a token that already has a name in the theme file.
 *
 * This module does the mechanical part deterministically and writes the result
 * to `styles/rn/*.json`, so the builder's job shrinks to composing already-
 * correct style objects into a component tree.
 *
 * The property table here is the same one `references/css-to-rn.md` documents
 * and `audit-styles.mjs` checks against — change one, change all three.
 */

/* ------------------------------------------------------------------ parse */

/** `prop: value;` pairs from one rule body, last-wins like the cascade. */
export function parseDeclarations(body) {
  const out = {};
  // Split on top-level `;` only — a `;` can't appear inside a CSS value except
  // in a data: URI, which is why the url(...) guard exists.
  let depth = 0;
  let buf = '';
  const flush = () => {
    const d = buf.trim();
    buf = '';
    if (!d) return;
    const c = d.indexOf(':');
    if (c === -1) return;
    const prop = d.slice(0, c).trim().toLowerCase();
    const value = d.slice(c + 1).trim();
    if (prop && value) out[prop] = value;
  };
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ';' && depth === 0) flush();
    else buf += ch;
  }
  flush();
  return out;
}

/**
 * Every style rule in document order, each carrying its at-rule context and
 * the comment that trails it. A design system commonly writes the RN name of a
 * utility class as exactly that trailing comment
 * (`.typography-body-lg{...}  /* bodyLg *\/`), which is a free, exact mapping
 * — far better than re-deriving a name from the class.
 */
export function parseStylesheet(css) {
  const rules = [];
  const ctx = [];
  let i = 0;
  let prelude = '';

  const attachTrailing = (text) => {
    // A comment on the same line as the previous rule's `}` names that rule.
    const last = rules[rules.length - 1];
    if (last && !/\n/.test(prelude) && last.trailingComment === null) last.trailingComment = text;
  };

  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const text = css.slice(i + 2, end === -1 ? css.length : end).trim();
      attachTrailing(text);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (ch === '{') {
      const sel = prelude.trim();
      prelude = '';
      if (/^@(?:media|supports|layer|container|keyframes)\b/i.test(sel)) {
        ctx.push(sel);
        i += 1;
        continue;
      }
      let depth = 1;
      let j = i + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth += 1;
        else if (css[j] === '}') depth -= 1;
        j += 1;
      }
      rules.push({
        selector: sel,
        at: ctx.slice(),
        declarations: parseDeclarations(css.slice(i + 1, j - 1)),
        trailingComment: null,
        order: rules.length
      });
      i = j;
      continue;
    }
    if (ch === '}') {
      ctx.pop();
      prelude = '';
      i += 1;
      continue;
    }
    prelude += ch;
    i += 1;
  }
  return rules;
}

/** Class names a selector depends on — the index key screens are matched on. */
export function selectorClasses(selector) {
  return [...new Set([...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]))];
}

/* -------------------------------------------------------- value resolution */

const NUM = /^-?[\d.]+/;

/** `16px` → 16, `1.45` → 1.45, `-0.011em` → null (needs a font size to resolve). */
function px(value) {
  const v = String(value).trim();
  if (/^-?[\d.]+px$/.test(v)) return parseFloat(v);
  if (/^-?[\d.]+$/.test(v)) return parseFloat(v);
  return null;
}

/**
 * Replace every `var(--x)` with the token's literal value, remembering which
 * tokens were touched so the emitted RN expression can reference the theme key
 * (`Colors[theme]?.surfacePrimary`) rather than inlining a hex nobody can
 * re-theme. `var(--x, fallback)` uses the fallback when the token is unknown.
 */
export function resolveValue(value, tokenTable) {
  const refs = [];
  let out = String(value);
  for (let pass = 0; pass < 6 && out.includes('var('); pass += 1) {
    out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (whole, name, fallback) => {
      const tok = tokenTable.get(name);
      if (tok) {
        refs.push(name);
        return tok.value;
      }
      return fallback !== undefined ? fallback.trim() : whole;
    });
  }
  return { literal: out.trim(), refs: [...new Set(refs)], unresolved: out.includes('var(') };
}

/** `{ name: {key, kind, value} }` keyed by CSS custom-property name. */
export function buildTokenTable(classified) {
  const t = new Map();
  for (const c of classified) t.set(c.name, { key: c.key, kind: c.kind, value: c.light });
  return t;
}

/* ------------------------------------------------------ the property table */

/** Straight rename, no unit maths. */
const DIRECT = {
  'flex-direction': 'flexDirection',
  'align-items': 'alignItems',
  'align-self': 'alignSelf',
  'align-content': 'alignContent',
  'justify-content': 'justifyContent',
  'flex-wrap': 'flexWrap',
  'flex-grow': 'flexGrow',
  'flex-shrink': 'flexShrink',
  'flex-basis': 'flexBasis',
  flex: 'flex',
  'text-align': 'textAlign',
  'text-transform': 'textTransform',
  'text-decoration-line': 'textDecorationLine',
  'z-index': 'zIndex',
  position: 'position',
  overflow: 'overflow',
  opacity: 'opacity',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'aspect-ratio': 'aspectRatio',
  'border-style': 'borderStyle'
};

/** `NNpx` → `scale(NN)`; spacing/size values round up. */
const SCALED = {
  width: 'width',
  height: 'height',
  'min-width': 'minWidth',
  'min-height': 'minHeight',
  'max-width': 'maxWidth',
  'max-height': 'maxHeight',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  gap: 'gap',
  'row-gap': 'rowGap',
  'column-gap': 'columnGap',
  'border-width': 'borderWidth',
  'border-top-width': 'borderTopWidth',
  'border-right-width': 'borderRightWidth',
  'border-bottom-width': 'borderBottomWidth',
  'border-left-width': 'borderLeftWidth',
  'padding-top': 'paddingTop',
  'padding-right': 'paddingRight',
  'padding-bottom': 'paddingBottom',
  'padding-left': 'paddingLeft',
  'margin-top': 'marginTop',
  'margin-right': 'marginRight',
  'margin-bottom': 'marginBottom',
  'margin-left': 'marginLeft',
  'border-top-left-radius': 'borderTopLeftRadius',
  'border-top-right-radius': 'borderTopRightRadius',
  'border-bottom-right-radius': 'borderBottomRightRadius',
  'border-bottom-left-radius': 'borderBottomLeftRadius'
};

/** Typography values scale without the ceil — see known-traps.md. */
const SCALED_TEXT = {
  'font-size': 'fontSize',
  'line-height': 'lineHeight',
  'letter-spacing': 'letterSpacing'
};

const COLORS = {
  color: 'color',
  'background-color': 'backgroundColor',
  'border-color': 'borderColor',
  'border-top-color': 'borderTopColor',
  'border-right-color': 'borderRightColor',
  'border-bottom-color': 'borderBottomColor',
  'border-left-color': 'borderLeftColor'
};

/** Four-sided shorthands, expanded per the CSS 1-4-value rule. */
const SHORTHAND_SIDES = {
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  'border-radius': [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius'
  ]
};

/** No RN equivalent; annotate the style key rather than pretend it ported. */
const ANNOTATABLE = {
  'box-shadow': 'CSS box-shadow — RN needs shadowColor/Offset/Opacity/Radius plus Android elevation',
  'text-shadow': 'CSS text-shadow — RN exposes textShadow* separately',
  filter: 'No RN style equivalent; needs a component (expo-blur) or is dropped',
  'backdrop-filter': 'No RN style equivalent; needs a component (expo-blur) or is dropped',
  'background-image': 'Gradient/image background renders via a component, not a style value',
  'mix-blend-mode': 'No RN equivalent',
  'backface-visibility': 'Supported but rarely meaningful outside a 3D transform',
  'grid-template-columns': 'RN has no CSS grid; port as flex rows/wrap or a FlatList numColumns',
  'grid-template-rows': 'RN has no CSS grid; port as flex rows/wrap',
  'grid-column': 'RN has no CSS grid',
  'grid-row': 'RN has no CSS grid'
};

/** Read by nothing downstream; listing them keeps `unmapped` honest. */
const IGNORED = new Set([
  'display',
  'font-family',
  'white-space',
  'text-overflow',
  'cursor',
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'outline',
  'outline-offset',
  'box-sizing',
  'content',
  'appearance',
  'scroll-behavior',
  'scroll-snap-type',
  'scroll-snap-align',
  'user-select',
  'will-change',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-fill-mode',
  'visibility',
  'pointer-events',
  'list-style',
  'float',
  'clear',
  'isolation',
  'touch-action',
  'overscroll-behavior',
  'text-rendering',
  'font-variant-numeric',
  'font-feature-settings'
]);

/** Split on whitespace that isn't inside parentheses — `calc(a + b)` stays whole. */
export function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let buf = '';
  for (const ch of value) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (/\s/.test(ch) && depth === 0) {
      if (buf) parts.push(buf);
      buf = '';
    } else buf += ch;
  }
  if (buf) parts.push(buf);
  return parts;
}

/**
 * `calc(62px + 24px)` → 86. Only the arithmetic a design system actually
 * writes — a chain of `+`/`-` over px lengths, which is the shape of every
 * "content inset plus tab bar height" rule. Anything with a `%`, a `vh` or a
 * multiplication returns null and is reported unmapped rather than guessed.
 */
export function evalCalc(expr) {
  const inner = expr.slice(expr.indexOf('(') + 1, expr.lastIndexOf(')')).trim();
  if (!/^[-+\d.px\s]+$/.test(inner)) return null;
  const tokens = inner.match(/[-+]|[\d.]+px|[\d.]+/g);
  if (!tokens || !tokens.length) return null;
  let total = parseFloat(tokens[0]);
  if (Number.isNaN(total)) return null;
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n = parseFloat(tokens[i + 1]);
    if (Number.isNaN(n) || (op !== '+' && op !== '-')) return null;
    total += op === '+' ? n : -n;
  }
  return total;
}

/** `padding: 8px 12px` → four values, per the CSS 1-4-value rule. */
function expandSides(value) {
  const parts = splitTopLevel(value);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return parts.slice(0, 4);
}

/**
 * `0 4px 14px rgba(16,24,40,.08)` → the five RN props that approximate it.
 * `inset` and multi-layer shadows keep the drift note; the first layer is
 * still emitted so the screen has something visually close rather than nothing.
 */
export function shadowToRN(value, scaleExpr) {
  const layers = value.split(/,(?![^(]*\))/).map((s) => s.trim());
  const first = layers[0];
  const inset = /\binset\b/.test(first);
  const colorM = first.match(/(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))/i);
  const lengths = (first.replace(/(?:rgba?|hsla?)\([^)]*\)/gi, '').match(/-?[\d.]+px|(?<=\s|^)-?[\d.]+(?=\s|$)/g) || [])
    .map((n) => parseFloat(n));
  const [dx = 0, dy = 0, blur = 0] = lengths;
  const opacityM = colorM?.[0].match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/i);
  return {
    style: {
      shadowColor: { expr: `'${(colorM?.[0] ?? '#000').replace(/rgba?\(([^)]*)\)/i, (w) => w)}'`, css: colorM?.[0] ?? null },
      shadowOffset: { expr: `{ width: ${scaleExpr(dx)}, height: ${scaleExpr(dy)} }`, css: `${dx}px ${dy}px` },
      shadowOpacity: { expr: String(opacityM ? parseFloat(opacityM[1]) : 1), css: value },
      shadowRadius: { expr: scaleExpr(blur), css: `${blur}px` },
      elevation: { expr: String(Math.max(1, Math.round(blur / 2))), css: 'android approximation of blur radius' }
    },
    inset,
    layers: layers.length
  };
}

/** `linear-gradient(180deg,#1B4A2C 0%,#0E1F14 100%)` → LinearGradient props. */
export function gradientToRN(value) {
  const inner = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'));
  const parts = inner.split(/,(?![^(]*\))/).map((s) => s.trim());
  let angle = null;
  if (/deg|to\s/.test(parts[0]) && !/#|rgb|hsl/i.test(parts[0])) angle = parts.shift();
  const stops = parts.map((p) => {
    const m = p.match(/^(.*?)(?:\s+([\d.]+%))?$/);
    return { color: (m?.[1] ?? p).trim(), position: m?.[2] ?? null };
  });
  // 180deg (top→bottom) is CSS's default-ish vertical; map the common cases and
  // leave anything exotic for the builder to eyeball.
  const dir = { '180deg': { start: [0, 0], end: [0, 1] }, '90deg': { start: [0, 0], end: [1, 0] },
    'to bottom': { start: [0, 0], end: [0, 1] }, 'to right': { start: [0, 0], end: [1, 0] } };
  const d = dir[(angle ?? '180deg').toLowerCase()] ?? { start: [0, 0], end: [0, 1] };
  return { colors: stops.map((s) => s.color), locations: stops.every((s) => s.position) ? stops.map((s) => parseFloat(s.position) / 100) : null, start: d.start, end: d.end, angle };
}

/**
 * One rule body → an RN style object, plus everything that could not port.
 *
 * Every emitted property carries three things: the RN `expr` to paste, the
 * original `css` it came from (so the auditor can diff it), and the theme
 * `token` it references when the value came from a custom property.
 */
export function declarationsToRN(decls, opts = {}) {
  const tokenTable = opts.tokenTable ?? new Map();
  const scaleFn = opts.scaleFn ?? 'scale';
  const colorExpr = opts.colorExpr ?? ((key) => `Colors[theme]?.${key}`);
  const scaleExpr = (n, text = false) =>
    n === 0 ? '0' : `${scaleFn}(${n}${text ? ', true' : ''})`;

  const style = {};
  const drift = [];
  const ignored = [];
  const unmapped = [];

  const put = (rnProp, expr, css, token) => {
    style[rnProp] = token ? { expr, css, token } : { expr, css };
  };

  const emitLength = (rnProp, rawValue, text = false) => {
    const { literal, refs, unresolved } = resolveValue(rawValue, tokenTable);
    if (unresolved) {
      unmapped.push({ prop: rnProp, value: rawValue, reason: 'unresolved var()' });
      return;
    }
    let n = px(literal);
    if (n === null && /^calc\(/i.test(literal)) {
      const c = evalCalc(literal);
      if (c !== null) {
        put(rnProp, scaleExpr(c, text), `${rawValue} → ${c}px`, refs[0] && tokenTable.get(refs[0])?.key);
        return;
      }
    }
    if (n === null) {
      // `%`, `auto`, `calc()`, `100vh` — pass through as a literal string and
      // let the builder decide; a percentage is legal RN, a calc() is not.
      const safeArea = /env\(\s*safe-area-inset-(\w+)/.exec(literal);
      put(rnProp, /^[\d.]+%$|^auto$/.test(literal) ? `'${literal}'` : `/* TODO ${literal} */`, rawValue, refs[0] && tokenTable.get(refs[0])?.key);
      if (!/^[\d.]+%$|^auto$/.test(literal)) {
        unmapped.push({
          prop: rnProp,
          value: literal,
          // The single most common unportable length in a mobile web design,
          // and the one with an exact RN answer — worth naming instead of
          // leaving as a generic "no equivalent".
          reason: safeArea
            ? `safe-area inset — use useSafeAreaInsets().${safeArea[1]} from react-native-safe-area-context, added to the rest of the expression`
            : 'no numeric RN equivalent'
        });
      }
      return;
    }
    put(rnProp, scaleExpr(n, text), rawValue, refs[0] && tokenTable.get(refs[0])?.key);
  };

  for (const [prop, rawValue] of Object.entries(decls)) {
    const value = rawValue.replace(/\s*!important\s*$/, '').trim();

    if (IGNORED.has(prop) || /^(?:-webkit-|-moz-|-ms-)/.test(prop)) {
      ignored.push(prop);
      continue;
    }

    if (COLORS[prop]) {
      const { literal, refs, unresolved } = resolveValue(value, tokenTable);
      if (unresolved) {
        unmapped.push({ prop, value, reason: 'unresolved var()' });
        continue;
      }
      const tok = refs.length ? tokenTable.get(refs[0]) : null;
      put(COLORS[prop], tok?.kind === 'color' ? colorExpr(tok.key) : `'${literal}'`, value, tok?.key);
      continue;
    }

    if (SCALED[prop]) {
      emitLength(SCALED[prop], value);
      continue;
    }

    if (SCALED_TEXT[prop]) {
      const { literal } = resolveValue(value, tokenTable);
      if (prop === 'line-height' && /^[\d.]+$/.test(literal) && parseFloat(literal) < 4) {
        // A unitless ratio needs the rule's own font-size to become RN's
        // absolute px lineHeight. Resolve it here when both live in the same
        // rule; otherwise say so rather than emitting a ratio RN will read as px.
        const fs = px(resolveValue(decls['font-size'] ?? '', tokenTable).literal);
        if (fs === null) {
          unmapped.push({ prop, value, reason: 'unitless line-height with no font-size in the same rule — multiply by the inherited size' });
          continue;
        }
        put('lineHeight', scaleExpr(Math.round(fs * parseFloat(literal)), true), `${value} × ${fs}px`);
        continue;
      }
      if (prop === 'letter-spacing' && /em$/.test(literal)) {
        const fs = px(resolveValue(decls['font-size'] ?? '', tokenTable).literal);
        if (fs === null) {
          unmapped.push({ prop, value, reason: 'em letter-spacing with no font-size in the same rule' });
          continue;
        }
        put('letterSpacing', scaleExpr(Math.round(parseFloat(literal) * fs * 100) / 100, true), `${value} × ${fs}px`);
        continue;
      }
      emitLength(SCALED_TEXT[prop], value, true);
      continue;
    }

    if (SHORTHAND_SIDES[prop]) {
      const sides = expandSides(value);
      SHORTHAND_SIDES[prop].forEach((rnProp, i) => emitLength(rnProp, sides[i]));
      continue;
    }

    if (prop === 'border' || /^border-(?:top|right|bottom|left)$/.test(prop)) {
      // `1px solid var(--border)` — width and colour are portable, style rarely matters.
      const side = prop === 'border' ? '' : prop.split('-')[1].replace(/^./, (c) => c.toUpperCase());
      const widthM = value.match(/(-?[\d.]+px|var\(--[\w-]+\))/);
      const colorM = value.match(/(var\(--[\w-]+\)|#[0-9a-f]{3,8}|rgba?\([^)]*\)|transparent|currentColor)\s*$/i);
      if (/\bnone\b/.test(value)) {
        put(`border${side}Width`, '0', value);
        continue;
      }
      if (widthM) emitLength(`border${side}Width`, widthM[1]);
      if (colorM) {
        const { literal, refs } = resolveValue(colorM[1], tokenTable);
        const tok = refs.length ? tokenTable.get(refs[0]) : null;
        put(`border${side}Color`, tok?.kind === 'color' ? colorExpr(tok.key) : `'${literal}'`, value, tok?.key);
      }
      continue;
    }

    if (prop === 'background') {
      const { literal, refs } = resolveValue(value, tokenTable);
      if (/gradient\(/i.test(literal)) {
        drift.push({ prop, reason: ANNOTATABLE['background-image'], gradient: gradientToRN(literal) });
        continue;
      }
      const tok = refs.length ? tokenTable.get(refs[0]) : null;
      if (/^(?:#|rgba?\(|hsla?\(|transparent$|currentcolor$)/i.test(literal) || tok?.kind === 'color') {
        put('backgroundColor', tok?.kind === 'color' ? colorExpr(tok.key) : `'${literal}'`, value, tok?.key);
        continue;
      }
      unmapped.push({ prop, value, reason: 'compound background shorthand' });
      continue;
    }

    if (prop === 'box-shadow') {
      const { literal } = resolveValue(value, tokenTable);
      if (/^none$/i.test(literal)) continue;
      const s = shadowToRN(literal, (n) => (n === 0 ? '0' : `${scaleFn}(${n})`));
      Object.assign(style, s.style);
      drift.push({
        prop,
        reason:
          s.layers > 1 || s.inset
            ? `${s.layers}-layer${s.inset ? ' inset' : ''} CSS shadow; RN supports one non-inset shadow`
            : ANNOTATABLE['box-shadow']
      });
      continue;
    }

    if (prop === 'transform') {
      const fns = [...literalOf(value, tokenTable).matchAll(/([\w]+)\(([^)]*)\)/g)].map((m) => {
        const arg = m[2].trim();
        const n = px(arg);
        return `{ ${m[1]}: ${n === null ? `'${arg}'` : /translate/.test(m[1]) ? scaleExpr(n) : n} }`;
      });
      if (fns.length) put('transform', `[${fns.join(', ')}]`, value);
      continue;
    }

    if (DIRECT[prop]) {
      const { literal } = resolveValue(value, tokenTable);
      const numeric = /^-?[\d.]+$/.test(literal);
      put(DIRECT[prop], numeric ? literal : `'${literal}'`, value);
      continue;
    }

    if (ANNOTATABLE[prop]) {
      drift.push({ prop, reason: ANNOTATABLE[prop], value });
      continue;
    }

    unmapped.push({ prop, value, reason: 'no rule in the property table' });
  }

  return { style: collapseShorthands(style), drift, ignored: [...new Set(ignored)], unmapped };
}

/**
 * Fold four expanded sides back into the shorthand a human would have written.
 * Expansion is how the values get resolved correctly; four identical
 * `paddingTop/Right/Bottom/Left` lines is not how anyone writes RN, and the
 * noise makes a generated style file hard to review.
 */
const COLLAPSE_GROUPS = [
  { sides: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'], all: 'padding', v: 'paddingVertical', h: 'paddingHorizontal' },
  { sides: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'], all: 'margin', v: 'marginVertical', h: 'marginHorizontal' },
  { sides: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'], all: 'borderRadius' }
];

export function collapseShorthands(style) {
  const out = { ...style };
  for (const g of COLLAPSE_GROUPS) {
    const vals = g.sides.map((s) => out[s]);
    if (vals.some((v) => v === undefined)) continue;
    const e = vals.map((v) => v.expr);
    const drop = () => g.sides.forEach((s) => delete out[s]);
    if (e[0] === e[1] && e[1] === e[2] && e[2] === e[3]) {
      const v = vals[0];
      drop();
      out[g.all] = v;
    } else if (g.v && e[0] === e[2] && e[1] === e[3]) {
      const [top, right] = vals;
      drop();
      out[g.v] = top;
      out[g.h] = right;
    }
  }
  return out;
}

function literalOf(value, tokenTable) {
  return resolveValue(value, tokenTable).literal;
}

/* ---------------------------------------------------------- typography set */

/**
 * The design system's own semantic type scale, with the RN name the design
 * already wrote next to each class as a trailing comment. This is what phase 1
 * reconciles `textStylesFile` against — a real mapping, not a guess from the
 * class name.
 */
export function typographyScale(rules, tokenTable) {
  const out = [];
  for (const rule of rules) {
    if (!/^\.typography-[\w-]+$/.test(rule.selector.trim())) continue;
    const cls = rule.selector.trim().slice(1);
    const rn = declarationsToRN(rule.declarations, { tokenTable });
    const name = (rule.trailingComment ?? '').split('/')[0].trim() || null;
    out.push({
      class: cls,
      rnName: name && /^[a-zA-Z][\w]*$/.test(name) ? name : camelFromClass(cls.replace(/^typography-/, '')),
      aliases: (rule.trailingComment ?? '').includes('/')
        ? rule.trailingComment.split('/').map((s) => s.trim()).filter(Boolean)
        : [],
      css: rule.declarations,
      style: rn.style
    });
  }
  return out;
}

const camelFromClass = (c) => c.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());

/* ------------------------------------------------------------ font records */

/**
 * Which typefaces the design actually asks for, where each comes from, and at
 * what weights/sizes it is used. A design that names `"SF Pro Text"` without
 * shipping a `@font-face` needs the file sourced before phase 1 can register
 * it — that is a hard fact worth reporting at extract time, not a surprise
 * three screens into the port.
 */
export function fontInventory(html, rules, tokenTable) {
  const families = new Map(); // primary family name -> record

  const note = (stack, origin) => {
    const primary = stack.split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (!primary || primary.startsWith('var(')) return null;
    if (!families.has(primary)) {
      families.set(primary, {
        family: primary,
        stack: stack.trim(),
        source: 'referenced',
        embedded: null,
        weights: new Set(),
        sizes: new Set(),
        usedBy: new Set(),
        origins: new Set()
      });
    }
    const rec = families.get(primary);
    rec.origins.add(origin);
    return rec;
  };

  // Token-declared families first — these are the design system's own names.
  for (const [name, tok] of tokenTable) {
    if (tok.kind !== 'font') continue;
    const rec = note(tok.value, `token ${name}`);
    if (rec) rec.token = tok.key;
  }

  for (const rule of rules) {
    const fam = rule.declarations['font-family'];
    if (fam) {
      const rec = note(resolveValue(fam, tokenTable).literal, `rule ${rule.selector.slice(0, 60)}`);
      if (rec) rec.usedBy.add(rule.selector.trim());
    }
    const w = rule.declarations['font-weight'];
    const s = rule.declarations['font-size'];
    for (const rec of families.values()) {
      if (!rec.usedBy.has(rule.selector.trim())) continue;
      if (w) rec.weights.add(resolveValue(w, tokenTable).literal);
      if (s) rec.sizes.add(resolveValue(s, tokenTable).literal);
    }
  }

  // Anything the export actually ships: @font-face src, or a data:font URI.
  const faces = [...html.matchAll(/@font-face\s*\{([^}]*)\}/gi)].map((m) => parseDeclarations(m[1]));
  for (const face of faces) {
    const rec = note(face['font-family'] ?? '', '@font-face');
    if (!rec) continue;
    rec.source = 'embedded';
    rec.embedded = { src: face.src ?? null, weight: face['font-weight'] ?? null, style: face['font-style'] ?? null };
  }

  const SYSTEM = /^(?:-apple-system|BlinkMacSystemFont|system-ui|ui-\w+|sans-serif|serif|monospace|cursive|inherit|Helvetica|Arial|Roboto|Segoe UI)$/i;
  return [...families.values()]
    .filter((r) => !SYSTEM.test(r.family))
    .map((r) => ({
      family: r.family,
      token: r.token ?? null,
      stack: r.stack,
      // `referenced` means: named by the design, no file shipped with it. The
      // port either sources the real typeface or falls back to the system font.
      source: r.source,
      embedded: r.embedded,
      weights: [...r.weights].sort(),
      sizes: [...r.sizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
      usedByCount: r.usedBy.size,
      origins: [...r.origins].slice(0, 4)
    }));
}
