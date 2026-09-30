/**
 * The design's own navigation model, recovered from its router script.
 *
 * A flat list of 92 `.page` elements is a lie about the design: four of them
 * are tab destinations, most of the rest are detail screens pushed on top of
 * one of those, and a handful are steps in a pre-auth flow. Planning against
 * the flat list means planning 92 peers; planning against the tree means
 * planning a tab bar, a few stacks, and one onboarding flow.
 *
 * Everything here reads the export's *own* structures — its route-meta table,
 * its tab-bar markup, its history-stack calls — rather than guessing from
 * names. What it cannot resolve it reports as unresolved instead of guessing.
 *
 * This subsumes what `organize-screen-hierarchy.mjs` used to do as a separate
 * post-pass, which is why that script no longer exists: it needed the rendered
 * markup only because it had no route-meta table to read, and it moved files
 * around to express a hierarchy that belongs in the inventory instead.
 */

/* ------------------------------------------------------------- JS scanning */

/**
 * For every character index, which function's body is active there.
 *
 * "The nearest `function foo(` before this index" is wrong on any file that
 * monkey-patches (`go = function(page){...}` re-declared later), because the
 * reassignment's body lexically follows an unrelated declaration. This tracks
 * real brace depth and skips strings and comments.
 */
export function buildScopeIndex(src) {
  const breakpoints = [];
  const stack = [];
  let depth = 0;
  let pendingName = null;
  const fnDeclRe = /function\s+(\w+)\s*\(/;
  const fnExprRe = /(\w+)\s*=\s*function\s*\(/;
  // A `/` starts a regex literal only where a value is expected. Getting this
  // wrong is not cosmetic: `.replace(/'/g,"")` contains a lone quote, and
  // treating it as a string opener swallows everything up to the next quote —
  // hundreds of lines — so every scope lookup after it names the wrong
  // function. That misattribution is how a screen ends up crediting its render
  // to whichever unrelated helper happened to precede the desync.
  const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
  let lastSignificant = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] !== '/' && src[i + 1] !== '*' && REGEX_PRECEDERS.has(lastSignificant)) {
      i += 1;
      let inClass = false;
      while (i < src.length) {
        if (src[i] === '\\') i += 2;
        else if (src[i] === '[') { inClass = true; i += 1; }
        else if (src[i] === ']') { inClass = false; i += 1; }
        else if (src[i] === '/' && !inClass) { i += 1; break; }
        else if (src[i] === '\n') break; // not a regex after all
        else i += 1;
      }
      while (i < src.length && /[a-z]/.test(src[i])) i += 1; // flags
      lastSignificant = '/';
      continue;
    }
    if (!/\s/.test(ch)) lastSignificant = ch;
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i += 1;
      while (i < src.length && src[i] !== quote) i += src[i] === '\\' ? 2 : 1;
      i += 1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2);
      i = i === -1 ? src.length : i + 2;
      continue;
    }
    if (pendingName === null) {
      const rest = src.slice(i, i + 60);
      const declM = fnDeclRe.exec(rest);
      const exprM = fnExprRe.exec(rest);
      if (declM && declM.index === 0) pendingName = declM[1];
      else if (exprM && exprM.index === 0) pendingName = exprM[1];
    }
    if (ch === '{') {
      depth += 1;
      if (pendingName !== null) {
        stack.push({ name: pendingName, depth });
        breakpoints.push({ at: i, name: pendingName });
        pendingName = null;
      }
    } else if (ch === '}') {
      if (stack.length && stack[stack.length - 1].depth === depth) {
        stack.pop();
        breakpoints.push({ at: i, name: stack.length ? stack[stack.length - 1].name : null });
      }
      depth -= 1;
    }
    i += 1;
  }
  return {
    at(index) {
      let name = null;
      for (const bp of breakpoints) {
        if (bp.at > index) break;
        name = bp.name;
      }
      return name;
    }
  };
}

/** Source text of the object literal whose `{` is at (or just after) `from`. */
function objectLiteralAt(src, from) {
  const open = src.indexOf('{', from);
  if (open === -1) return null;
  let depth = 0;
  let i = open;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "'" || ch === '"') {
      const q = ch;
      i += 1;
      while (i < src.length && src[i] !== q) i += src[i] === '\\' ? 2 : 1;
    } else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(open, i + 1);
    }
    i += 1;
  }
  return null;
}

/** Top-level `key: <rest>` pairs of an object literal, values kept as source. */
function topLevelEntries(objSrc) {
  const body = objSrc.slice(1, -1);
  const entries = [];
  let depth = 0;
  let buf = '';
  const flush = () => {
    const t = buf.trim();
    buf = '';
    if (!t) return;
    const c = t.indexOf(':');
    if (c === -1) return;
    entries.push([t.slice(0, c).trim().replace(/^["']|["']$/g, ''), t.slice(c + 1).trim()]);
  };
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === "'" || ch === '"') {
      const q = ch;
      buf += ch;
      i += 1;
      while (i < body.length && body[i] !== q) {
        buf += body[i];
        i += body[i] === '\\' ? 2 : 1;
      }
      buf += body[i] ?? '';
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth += 1;
    if (ch === '}' || ch === ']' || ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) flush();
    else buf += ch;
  }
  flush();
  return entries;
}

const strOf = (src, key) => {
  const m = new RegExp(`\\b${key}\\s*:\\s*'([^']*)'|\\b${key}\\s*:\\s*"([^"]*)"`).exec(src);
  return m ? (m[1] ?? m[2]) : null;
};

/**
 * The export's route-meta table, if it has one: an object whose keys are screen
 * ids and whose values describe the screen's chrome (`title`, `sub`, `back`,
 * `tab`). This is the single highest-value structure in a prototype's script —
 * it gives every screen's real header text and its true parent with no
 * guessing at all.
 *
 * Matched structurally (keys overlap the screen ids, values are objects) rather
 * than by variable name, because the name differs per export tool.
 */
export function parsePageMetaTable(behaviorSrc, screenIds) {
  const ids = new Set(screenIds);
  const record = (v) => ({
    title: strOf(v, 'title'),
    subtitle: strOf(v, 'sub') ?? strOf(v, 'subtitle'),
    back: strOf(v, 'back'),
    tab: strOf(v, 'tab'),
    raw: v.length > 300 ? `${v.slice(0, 300)}…` : v
  });

  let best = null;
  for (const m of behaviorSrc.matchAll(/(?:var|const|let)\s+(\w+)\s*=\s*\{/g)) {
    const objSrc = objectLiteralAt(behaviorSrc, m.index);
    if (!objSrc) continue;
    const entries = topLevelEntries(objSrc).filter(([, v]) => v.startsWith('{'));
    const hits = entries.filter(([k]) => ids.has(k));
    if (hits.length < 2) continue;
    if (best && hits.length <= best.hits) continue;
    best = { name: m[1], hits: hits.length, meta: Object.fromEntries(hits.map(([k, v]) => [k, record(v)])) };
  }
  if (!best) return null;

  // A prototype that grew by accretion declares the table once and then keeps
  // extending it — `META.customers = {...}` further down the file, often
  // hundreds of lines later and often for the majority of the screens. Reading
  // only the initial literal found 11 of this design's 92 screens; folding the
  // later assignments in finds the rest.
  const assignRe = new RegExp(`\\b${best.name}\\s*(?:\\.(\\w+)|\\[\\s*['"]([\\w-]+)['"]\\s*\\])\\s*=\\s*\\{`, 'g');
  for (const m of behaviorSrc.matchAll(assignRe)) {
    const key = m[1] ?? m[2];
    if (!ids.has(key)) continue;
    const objSrc = objectLiteralAt(behaviorSrc, m.index + m[0].length - 1);
    if (!objSrc) continue;
    // Later assignment wins, same as at runtime.
    best.meta[key] = record(objSrc);
    best.extended = (best.extended ?? 0) + 1;
  }

  // `Object.assign(META, { … })` — the bulk form of the same accretion, and
  // the one this design actually uses for most of its screens.
  const mergeRe = new RegExp(`Object\\.assign\\(\\s*${best.name}\\s*,`, 'g');
  for (const m of behaviorSrc.matchAll(mergeRe)) {
    const objSrc = objectLiteralAt(behaviorSrc, m.index + m[0].length);
    if (!objSrc) continue;
    for (const [k, v] of topLevelEntries(objSrc)) {
      if (!ids.has(k) || !v.startsWith('{')) continue;
      best.meta[k] = record(v);
      best.extended = (best.extended ?? 0) + 1;
    }
  }
  best.hits = Object.keys(best.meta).length;
  return best;
}

/**
 * Linear multi-step flows — an onboarding wizard, a checkout. The giveaway is
 * an array of screen ids indexed by a step number inside a function that
 * navigates (`var ids=['signin','setpw','plan'…]; showPage(ids[n])`). These
 * screens have no parent and never will; calling them "unlinked" hides that
 * they are a sequence, which is exactly what phase 3 needs to know to build
 * them as one flow rather than six unrelated screens.
 */
export function parseFlows(behaviorSrc, screenIds) {
  const ids = new Set(screenIds);
  const scope = buildScopeIndex(behaviorSrc);
  const flows = [];
  const seen = new Set();
  for (const m of behaviorSrc.matchAll(/(\w+)\s*=\s*\[((?:\s*['"][\w-]+['"]\s*,){2,}\s*['"][\w-]+['"]\s*)\]/g)) {
    const [, varName] = m;
    const steps = m[2].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    if (!steps.every((s) => ids.has(s))) continue;
    const fn = scope.at(m.index) ?? '(top level)';
    const after = behaviorSrc.slice(m.index, m.index + 400);
    if (!/showPage|go\(|navigate/.test(after)) continue;
    // A flow is *indexed* by a step number. Without this check a nav-stack
    // seed (`hist = ['joblist','job','workorders','wodetail']` — a breadcrumb,
    // not a wizard) reads as a four-step flow.
    if (!new RegExp(`\\b${varName}\\s*\\[\\s*[a-z_$]`, 'i').test(after)) continue;
    const key = steps.join('>');
    if (seen.has(key)) continue;
    seen.add(key);
    flows.push({ fn, steps, varName });
  }
  return flows;
}

/**
 * A flat `{ id: 'Label' }` table — the usual shape of a tab-title map. Used as
 * a second signal for which ids are top-level destinations, and for their labels.
 */
export function parseLabelTable(behaviorSrc, screenIds) {
  const ids = new Set(screenIds);
  let best = null;
  for (const m of behaviorSrc.matchAll(/(?:var|const|let)\s+(\w+)\s*=\s*\{/g)) {
    const objSrc = objectLiteralAt(behaviorSrc, m.index);
    if (!objSrc) continue;
    const entries = topLevelEntries(objSrc);
    if (!entries.length || !entries.every(([, v]) => /^['"]/.test(v))) continue;
    const hits = entries.filter(([k]) => ids.has(k));
    if (hits.length < 2 || hits.length !== entries.length) continue;
    if (best && hits.length <= best.hits) continue;
    best = {
      name: m[1],
      hits: hits.length,
      labels: Object.fromEntries(hits.map(([k, v]) => [k, v.replace(/^['"]|['"]$/g, '')]))
    };
  }
  return best;
}

/**
 * Tab-bar destinations, from the markup rather than from a naming convention:
 * a `data-tab` attribute, or a click handler in a `<nav>`/`.tabbar`-ish
 * container calling a one-string-argument router function.
 */
export function parseTabBar(html, screenIds) {
  const ids = new Set(screenIds);
  const navM = /<(nav|footer)\b[^>]*>[\s\S]*?<\/\1>/i.exec(html)
    ?? /<[a-z]+\b[^>]*class="[^"]*\b(?:tabbar|tab-bar|bottom-nav|navbar)\b[^"]*"[\s\S]*?<\/[a-z]+>/i.exec(html);
  const scope = navM ? navM[0] : '';
  const tabs = [];
  const seen = new Set();
  const push = (id, label, action) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    tabs.push({ id, label: label?.trim() || null, action });
  };
  for (const m of scope.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>|<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1] ?? m[3] ?? '';
    const inner = m[2] ?? m[4] ?? '';
    const label = inner.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const dataTab = /data-tab\s*=\s*"([^"]*)"/.exec(attrs)?.[1];
    const call = /on\w+\s*=\s*"(\w+)\('([\w-]+)'\)/.exec(attrs);
    const id = dataTab ?? (call && ids.has(call[2]) ? call[2] : null);
    if (id) push(id, label, call ? `${call[1]}('${call[2]}')` : null);
    else if (call) push(`(${call[1]}:${call[2]})`, label, `${call[1]}('${call[2]}')`); // e.g. a Create button opening a sheet
  }
  return { scopeFound: Boolean(navM), tabs };
}

/**
 * Which function pushes which screen onto the nav stack, and which screens
 * navigate directly. Two signals:
 *  - `hist.push('x')` / `hist=[...,'x']` — an explicit stack push.
 *  - `showPage('x')` / `go('x')` — a direct navigation, recorded with the
 *    enclosing function so a flow's steps stay attributable.
 */
export function parseNavTriggers(behaviorSrc) {
  const scope = buildScopeIndex(behaviorSrc);
  const pushFns = new Map(); // fn -> Set(childId)
  const navFns = new Map(); // screenId -> Set(fn)
  const add = (map, k, v) => {
    if (!k || !v) return;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k).add(v);
  };
  for (const m of behaviorSrc.matchAll(/hist\.push\(\s*'([\w-]+)'\s*\)/g)) add(pushFns, scope.at(m.index), m[1]);
  for (const m of behaviorSrc.matchAll(/hist\s*=\s*\[([^\]]+)\]/g)) {
    const ids = m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    if (ids.length > 1) add(pushFns, scope.at(m.index), ids[ids.length - 1]);
  }
  for (const m of behaviorSrc.matchAll(/\b(?:showPage|go|navigate|openPage)\(\s*'([\w-]+)'\s*\)/g)) {
    add(navFns, m[1], scope.at(m.index) ?? '(top level)');
  }
  return { pushFns, navFns };
}

/**
 * Which screens can trigger `fn`.
 *
 * Two paths, because most screens in a prototype are runtime-rendered: their
 * static markup is an empty shell, so a grep over `screens/*.html` alone finds
 * a parent for only the handful of statically-authored screens. The second
 * path walks the behaviour script instead — find the functions whose bodies
 * call `fn` (including inside the HTML string literals they build), then map
 * those back to the screen each one renders, following one call level at a
 * time so a helper between the renderer and the trigger doesn't break the
 * chain.
 */
function callersOf(fn, screenHtml, ctx) {
  const re = new RegExp(`\\b${fn}\\(`);
  const found = new Set([...screenHtml.entries()].filter(([, html]) => re.test(html)).map(([id]) => id));
  if (!ctx) return [...found];

  const { behaviorSrc, scope, screensByRenderFn } = ctx;
  let frontier = new Set([fn]);
  const seenFns = new Set([fn]);
  for (let level = 0; level < 3 && frontier.size; level += 1) {
    const next = new Set();
    for (const target of frontier) {
      for (const m of behaviorSrc.matchAll(new RegExp(`\\b${target}\\(`, 'g'))) {
        const enclosing = scope.at(m.index);
        if (!enclosing || seenFns.has(enclosing)) continue;
        const screens = screensByRenderFn.get(enclosing);
        if (screens) for (const id of screens) found.add(id);
        else {
          seenFns.add(enclosing);
          next.add(enclosing);
        }
      }
    }
    frontier = next;
  }
  return [...found];
}

/**
 * Fold everything into one tree. Returns per-screen `{ role, parent, children,
 * tab, title, subtitle, depth }` plus a navigation summary.
 *
 * Parent resolution, most trustworthy first:
 *   1. the route-meta table's own `back` field,
 *   2. a single screen whose markup calls the function that pushes this one,
 *   3. nothing — reported as unresolved, never guessed.
 */
export function buildNavModel({ screens, behaviorSrc, indexHtml, screenHtml }) {
  const shortId = (s) => s.id.replace(/^p-/, '');
  const ids = screens.map(shortId);
  const byShort = new Map(screens.map((s) => [shortId(s), s]));

  const metaTable = behaviorSrc ? parsePageMetaTable(behaviorSrc, ids) : null;
  const labelTable = behaviorSrc ? parseLabelTable(behaviorSrc, ids) : null;
  const flows = behaviorSrc ? parseFlows(behaviorSrc, ids) : [];
  const flowOf = new Map();
  flows.forEach((f, i) => f.steps.forEach((id, step) => {
    if (!flowOf.has(id)) flowOf.set(id, { flow: f.fn || `flow-${i}`, step, steps: f.steps });
  }));
  const tabBar = parseTabBar(indexHtml, ids);
  const { pushFns, navFns } = behaviorSrc ? parseNavTriggers(behaviorSrc) : { pushFns: new Map(), navFns: new Map() };

  const tabIds = new Set([
    ...tabBar.tabs.map((t) => t.id).filter((id) => byShort.has(id)),
    ...Object.keys(labelTable?.labels ?? {})
  ]);

  // child -> candidate parents, from trigger functions.
  const screensByRenderFn = new Map();
  for (const s of screens) {
    for (const fn of s.renderFns ?? []) {
      if (!screensByRenderFn.has(fn)) screensByRenderFn.set(fn, new Set());
      screensByRenderFn.get(fn).add(shortId(s));
    }
  }
  const ctx = behaviorSrc
    ? { behaviorSrc, scope: buildScopeIndex(behaviorSrc), screensByRenderFn }
    : null;

  const candidates = new Map();
  for (const [fn, children] of pushFns) {
    if (!fn) continue;
    const parents = callersOf(fn, screenHtml, ctx).filter((p) => !children.has(p));
    for (const child of children) {
      if (!byShort.has(child)) continue;
      if (!candidates.has(child)) candidates.set(child, new Set());
      for (const p of parents) candidates.get(child).add(p);
    }
  }

  const meta = metaTable?.meta ?? {};
  const result = new Map();
  for (const id of ids) {
    const m = meta[id] ?? {};
    const cands = [...(candidates.get(id) ?? [])];
    let parent = null;
    let parentSource = null;
    if (tabIds.has(id)) {
      parentSource = 'tab-bar';
    } else if (m.back && byShort.has(m.back)) {
      parent = m.back;
      parentSource = 'route-meta';
    } else if (cands.length === 1) {
      [parent] = cands;
      parentSource = 'nav-trigger';
    } else if (cands.length > 1) {
      parentSource = 'ambiguous';
    }
    result.set(id, {
      parent,
      parentSource,
      parentCandidates: cands,
      title: m.title ?? labelTable?.labels?.[id] ?? null,
      subtitle: m.subtitle ?? null,
      tab: m.tab ?? (tabIds.has(id) ? id : null),
      reachedBy: [...(navFns.get(id) ?? [])].sort(),
      flow: flowOf.get(id) ?? null,
      role: tabIds.has(id) ? 'tab' : parent ? 'child' : flowOf.has(id) ? 'flow' : 'unlinked'
    });
  }

  // Children, depth, and the owning tab, walked up the resolved parents.
  for (const [id, node] of result) {
    if (!node.parent) continue;
    const p = result.get(node.parent);
    if (p) (p.children ??= []).push(id);
  }
  const depthOf = (id, seen = new Set()) => {
    const node = result.get(id);
    if (!node || !node.parent || seen.has(id)) return 0;
    return 1 + depthOf(node.parent, new Set(seen).add(id));
  };
  for (const [id, node] of result) {
    node.children ??= [];
    node.depth = depthOf(id);
    if (!node.tab) {
      let cur = node.parent;
      const seen = new Set([id]);
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        const c = result.get(cur);
        if (c?.tab) {
          node.tab = c.tab;
          break;
        }
        cur = c?.parent ?? null;
      }
    }
  }

  const roles = { tab: [], child: [], flow: [], unlinked: [] };
  for (const [id, n] of result) roles[n.role].push(id);

  return {
    perScreen: result,
    summary: {
      total: ids.length,
      tabs: tabBar.tabs,
      tabScreens: roles.tab,
      childScreens: roles.child.length,
      flows: flows.map((f) => ({ fn: f.fn, steps: f.steps, varName: f.varName })),
      flowScreens: roles.flow,
      unlinkedScreens: roles.unlinked,
      ambiguous: [...result].filter(([, n]) => n.parentSource === 'ambiguous').map(([id, n]) => ({ id, candidates: n.parentCandidates })),
      routeMetaTable: metaTable ? { name: metaTable.name, entries: metaTable.hits } : null,
      labelTable: labelTable ? { name: labelTable.name, entries: labelTable.hits } : null
    }
  };
}

/** A human-readable tree — written to `screens/INDEX.md`, read instead of `ls`. */
export function renderTree(nav, screensById) {
  const lines = [];
  const line = (id, indent) => {
    const n = nav.perScreen.get(id);
    const s = screensById.get(id);
    const bits = [n.title ? `"${n.title}"` : null, s?.renderFns?.length ? `render:${s.renderFns.join('/')}()` : null, s?.dynamic ? 'runtime-rendered' : null]
      .filter(Boolean)
      .join(' · ');
    lines.push(`${'  '.repeat(indent)}- **${id}** — \`${s?.file ?? '?'}\`${bits ? ` — ${bits}` : ''}`);
    for (const c of n.children.slice().sort()) line(c, indent + 1);
  };
  lines.push('# Screen tree', '');
  lines.push(`${nav.summary.total} page elements — ${nav.summary.tabScreens.length} tab destinations, ` +
    `${nav.summary.childScreens} pushed detail screens, ${nav.summary.flowScreens.length} flow steps, ` +
    `${nav.summary.unlinkedScreens.length} unlinked.`, '');
  lines.push('## Tab destinations', '');
  for (const t of nav.summary.tabs) {
    if (nav.perScreen.has(t.id)) line(t.id, 0);
    else lines.push(`- _${t.label ?? t.id}_ — not a page (${t.action ?? 'no handler'})`);
  }
  for (const f of nav.summary.flows) {
    lines.push('', `## Flow: \`${f.fn}\` — ${f.steps.length} steps in order`, '');
    f.steps.forEach((id, i) => {
      if (nav.perScreen.has(id)) {
        const before = lines.length;
        line(id, 0);
        lines[before] = lines[before].replace('- **', `- ${i + 1}. **`);
      }
    });
  }
  const orphans = nav.summary.unlinkedScreens;
  if (orphans.length) {
    lines.push('', '## Not reachable from a tab or flow (deep-linked, or no detected trigger)', '');
    for (const id of orphans) line(id, 0);
  }
  if (nav.summary.ambiguous.length) {
    lines.push('', '## Ambiguous parent — left flat, never guessed', '');
    for (const a of nav.summary.ambiguous) lines.push(`- **${a.id}** — candidates: ${a.candidates.join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}

/** `goStep` -> `Go Step`; too short to be a real word (`n`, `ids`) reads as noise, not a name. */
function humanize(name) {
  if (!name) return null;
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
  if (words.length < 3) return null;
  return words.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Group the nav tree `buildNavModel` already computed into modules — a unit
 * bigger than one screen, smaller than the whole app: a tab's module is
 * itself plus its entire pushed subtree; a flow's module is its ordered
 * steps. A screen with neither (`role: 'unlinked'`) is never forced into a
 * module — it is reported in `unassigned` instead.
 *
 * Every `name` is a SUGGESTION, never a decision — see `nameSource` and
 * `nameConfirmed`. A flow's enclosing function names a mechanism, not a
 * business concept (`goStep`, `advance`), so a flow's `nameConfirmed` is
 * always `false`: the same "ask, don't guess" rule `parentSource: 'ambiguous'`
 * already enforces per screen, applied here per module.
 */
export function inferModules(nav) {
  const subtree = (rootId) => {
    const ids = [];
    const walk = (id) => {
      ids.push(id);
      for (const c of nav.perScreen.get(id)?.children ?? []) walk(c);
    };
    walk(rootId);
    return ids;
  };

  const modules = [];
  for (const t of nav.summary.tabs) {
    if (!nav.perScreen.has(t.id)) continue; // a sheet-opening tab-bar button, not a screen
    const node = nav.perScreen.get(t.id);
    modules.push({
      id: t.id,
      kind: 'tab',
      name: node.title ?? t.label ?? t.id,
      nameSource: node.title ? 'tab-title' : t.label ? 'tab-bar-label' : 'tab-id',
      nameConfirmed: Boolean(node.title || t.label),
      screens: subtree(t.id)
    });
  }
  nav.summary.flows.forEach((f, i) => {
    const firstTitle = nav.perScreen.get(f.steps[0])?.title;
    const humanVar = humanize(f.varName);
    const suggested = humanVar ?? firstTitle ?? humanize(f.fn) ?? f.steps.join(' → ');
    modules.push({
      id: `flow-${f.varName ?? f.fn ?? i}`,
      kind: 'flow',
      name: suggested,
      nameSource: humanVar ? 'flow-array-name' : firstTitle ? 'first-step-title' : 'enclosing-function',
      nameConfirmed: false,
      screens: f.steps
    });
  });

  const assigned = new Set(modules.flatMap((m) => m.screens));
  const unassigned = [...nav.perScreen.keys()].filter(
    (id) => !assigned.has(id) && nav.perScreen.get(id).role === 'unlinked'
  );
  return { modules, unassigned };
}
