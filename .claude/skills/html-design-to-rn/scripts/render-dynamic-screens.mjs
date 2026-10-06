/**
 * Phase 0 follow-up — populate `dynamic: true` screens with their real,
 * rendered markup instead of leaving the near-empty shell extract-design.mjs
 * wrote, THEN do the same one level down for dynamic *regions*: sub-views a
 * screen repaints at runtime (a tab body, a list refresh, a stage pill) that
 * phase 0 only detects and reports (`dynamic-regions.json`'s `ownerKind`,
 * resolved against markup that hadn't been rendered yet — see that file's
 * own note). Both drive a live Chromium target (same mechanism as
 * capture-design.mjs — raw CDP, no browser-automation dependency): call
 * whichever function fills a container, capture the resulting HTML and a
 * cropped screenshot.
 *
 * The render function per screen is found by grepping `app.js` for
 * `getElementById('<screenId>')...innerHTML=` and taking its nearest
 * enclosing `function name(){...}` — the same thing a human would grep by
 * hand (known-traps.md's "grep the screen's id" guidance), just automated.
 * This is a heuristic that covers most real designs (83/84 on the first
 * sample), not a guarantee — screens it can't resolve are reported as
 * `renderStatus: "unresolved"`, never silently left looking rendered.
 *
 * Usage:
 *   node render-dynamic-screens.mjs --extract <dir> --cdp-port <port> \
 *     [--config <config.json>] [--screen <id>] [--fn <name-or-call>] [--prepare <js>] \
 *     [--region <id>] [--region-fn <name-or-call>] [--region-prepare <js>] \
 *     [--no-screens] [--no-regions] [--force] [--scale-fn <name>] [--no-screenshot]
 *
 * Rewrites apps/mobile/design/.extracted/screens/<file> in place for every screen and
 * region it resolves, adds `renderStatus`/`renderFn`/`screenshot` to that
 * screen's/region's entry in inventory.json / dynamic-regions.json, and
 * leaves everything else untouched. Animations and interactive edge-case
 * states are NOT covered — a single render call captures one static frame of
 * a screen's default state; see the file footer note for what that does and
 * doesn't mean.
 */

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { parseStylesheet, buildTokenTable } from './lib/css-model.mjs';
import { buildScopeIndex } from './lib/nav-model.mjs';
import {
  extractTexts,
  extractInputs,
  extractActions,
  extractSections,
  extractClasses,
  extractInlineStyles,
  scanElements,
  findDynamicRegions
} from './lib/html-model.mjs';
import {
  compileRnStyles,
  styleSliceFor,
  compileInlineStyles,
  screenHandlers
} from './extract-design.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[i + 1];
      if (out[argv[i].slice(2)] !== true) i += 1;
    }
  }
  return out;
}

async function cdpEvaluate(cdpPort, expression) {
  const targets = await (await fetch(`http://localhost:${cdpPort}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error(`No page target on CDP port ${cdpPort}`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', (ev) => reject(new Error(String(ev.message ?? ev))));
  });
  const send = (method, params) =>
    new Promise((resolve, reject) => {
      const id = nextId;
      nextId += 1;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { send, close: () => ws.close() };
}

/** Nearest enclosing `function name(...) {` before `index`.
 *
 * Prefer a declaration at column 0: a render body is often a closure passed to
 * the design's own page opener (`openOverhead(){ openM('overhead', function(){
 * function grp(...){...} ... innerHTML = ... }) }`), and the nearest enclosing
 * function there is a nested helper that does not exist as a global — calling
 * it throws `grp is not defined`. The column-0 declaration is the real entry
 * point. Fall back to any enclosing declaration for a design that indents its
 * top level. */
function enclosingFunctionName(src, index) {
  const topLevel = /^function\s+(\w+)\s*\(/gm;
  let last = null;
  let m;
  while ((m = topLevel.exec(src)) && m.index < index) last = m[1];
  if (last) return last;
  const any = /function\s+(\w+)\s*\(/g;
  while ((m = any.exec(src)) && m.index < index) last = m[1];
  return last;
}

function findRenderFn(behaviorSrc, screenId) {
  const re = new RegExp(`getElementById\\(['"]${screenId}['"]\\)[\\s\\S]{0,80}?innerHTML\\s*=`);
  const m = re.exec(behaviorSrc);
  if (!m) return null;
  return enclosingFunctionName(behaviorSrc, m.index);
}

/**
 * Rebuild the screen's `facts.json` and `styles/rn/<screen>.json` from the
 * markup that just replaced its shell (or, for a region patch, replaced one
 * container inside an otherwise-unchanged screen).
 *
 * Without this the populated screen is a lie by omission: phase 0 derived both
 * files from the near-empty container, so a dynamic screen otherwise ships one
 * `.page` rule and zero texts/inputs/actions no matter how much markup the
 * render call produced. Phase 3 reads those two files as "the CSS, already
 * translated" and would hand-translate from scratch — the exact failure the
 * compile step exists to prevent.
 */
function regenerateArtifacts(extractDir, screen, outerHTML, ctx) {
  const inner = outerHTML.replace(/^<[^>]+>/, '').replace(/<\/\w+>$/, '').trim();
  const classes = extractClasses(outerHTML);
  const inlineStyles = extractInlineStyles(outerHTML);
  const slice = styleSliceFor(classes, ctx.byClass);
  fs.writeFileSync(
    path.join(extractDir, screen.styleFile),
    JSON.stringify(
      {
        screen: screen.id,
        rules: slice,
        inline: compileInlineStyles(inlineStyles, ctx.tokenTable, ctx.scaleFn)
      },
      null,
      2
    )
  );

  const previous = JSON.parse(fs.readFileSync(path.join(extractDir, screen.factsFile), 'utf8'));
  const facts = {
    screen: screen.id,
    handlers: screenHandlers(outerHTML),
    classes,
    sections: extractSections(outerHTML),
    texts: extractTexts(inner),
    inputs: extractInputs(outerHTML),
    actions: extractActions(outerHTML),
    inlineStyles,
    // Written by phase 0's nav pass, which does not run here.
    reachedBy: previous.reachedBy,
    // Refreshed properly by refreshDynamicRegions() right after this screen's
    // own render call, from the CURRENT (now-rendered) markup — kept as a
    // defensive carry-forward here so a facts.json this function writes never
    // silently drops data refreshDynamicRegions hasn't run yet.
    dynamicRegions: previous.dynamicRegions ?? []
  };
  fs.writeFileSync(path.join(extractDir, screen.factsFile), JSON.stringify(facts, null, 2));

  screen.bytes = outerHTML.length;
  screen.counts = {
    classes: classes.length,
    sections: facts.sections.length,
    texts: facts.texts.length,
    inputs: facts.inputs.length,
    actions: facts.actions.length,
    inlineStyles: inlineStyles.length,
    styleRules: slice.length
  };
}

async function renderScreens({ send, extractDir, inventory, behaviorSrc, overrides, args, ctx }) {
  // `renderStatus: 'rendered'` already reflects a previous successful run —
  // extract-design.mjs's incremental mode carries that field forward
  // untouched for any screen whose own markup (and app.css/app.js) didn't
  // change since then, so re-rendering it here would spend a CDP round-trip
  // reproducing exactly what's already on disk. `--screen` (one explicit
  // target) and `--all` (force every dynamic screen regardless of status)
  // both bypass this — an explicit ask always runs.
  const targets = args.screen
    ? inventory.screens.filter((s) => s.id === args.screen)
    : inventory.screens.filter((s) => s.dynamic && (args.all || s.renderStatus !== 'rendered'));
  const skipped = args.screen ? 0 : inventory.screens.filter((s) => s.dynamic).length - targets.length;

  const results = [];
  for (const screen of targets) {
    // `--fn` overrides the grep when a design's entry point isn't the nearest
    // enclosing declaration; `--prepare` runs first, for a detail screen whose
    // render function reads state a prior navigation step would have set.
    // Both fall back to the config's `source.renderOverrides` for this screen.
    const override = overrides[screen.id] ?? {};
    const fnName =
      typeof args.fn === 'string' ? args.fn : (override.fn ?? findRenderFn(behaviorSrc, screen.id));
    if (!fnName) {
      screen.renderStatus = 'unresolved';
      results.push({ id: screen.id, status: 'unresolved', reason: 'no getElementById(...).innerHTML= assignment found for this id in the behavior script' });
      continue;
    }
    const shortId = screen.id.replace(/^p-/, '');
    // Render, then try to make it the active page too — a render call alone
    // populates innerHTML but leaves `.page.active` untouched, so the
    // container stays display:none and its rect reads all-zero. showPage()
    // is this design's own generic router; if a design's equivalent throws
    // (id not recognised, wrong signature) that's caught and ignored — the
    // populated HTML is still captured, just without a non-zero rect/screenshot.
    const prepare = typeof args.prepare === 'string' ? args.prepare : (override.prepare ?? '');
    // A render function that takes an argument (`openCustomer(i)`) can only be
    // driven by naming the whole call, so `--fn` accepts either a bare name or
    // a call expression.
    const call = fnName.includes('(') ? fnName : `${fnName}()`;
    const expr = `(() => { ${prepare ? `try { ${prepare} } catch (e) { return { error: 'prepare: ' + String(e) }; }` : ''} try { ${call} } catch (e) { return { error: String(e) }; } try { showPage(${JSON.stringify(shortId)}); } catch (e) {} const el = document.getElementById(${JSON.stringify(screen.id)}); if (!el) return { error: 'element not found after render call' }; const r = el.getBoundingClientRect(); return { html: el.innerHTML, rect: { x: r.x, y: r.y, width: r.width, height: r.height }, dpr: window.devicePixelRatio || 1 }; })()`;
    const evalResult = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    const value = evalResult?.result?.value;
    if (evalResult?.exceptionDetails || value?.error) {
      screen.renderStatus = 'error';
      results.push({ id: screen.id, status: 'error', renderFn: fnName, reason: evalResult?.exceptionDetails?.text ?? value.error });
      continue;
    }
    if (!value.html || value.html.trim().length < 30) {
      screen.renderStatus = 'empty-after-render';
      results.push({ id: screen.id, status: 'empty-after-render', renderFn: fnName, reason: `${fnName}() ran without error but the screen is still near-empty — it likely needs state set by a prior navigation step` });
      continue;
    }
    const outerHTML = `<section class="page active" id="${screen.id}">${value.html}</section>`;
    fs.writeFileSync(path.join(extractDir, screen.file), outerHTML);
    screen.renderStatus = 'rendered';
    screen.renderFn = fnName;
    regenerateArtifacts(extractDir, screen, outerHTML, ctx);

    if (!args['no-screenshot']) {
      // .page.active runs a fade/slide-in animation (--duration-slow, 240ms
      // in this design) — screenshot too early and it's a half-faded frame.
      await new Promise((r) => setTimeout(r, 400));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const full = PNG.sync.read(Buffer.from(shot.data, 'base64'));
      // Page.captureScreenshot returns physical pixels; getBoundingClientRect
      // is in CSS pixels — scale by devicePixelRatio (2 or 3 on most laptop
      // displays) or the crop lands in the wrong quadrant of the image.
      const dpr = value.dpr || 1;
      const { x, y, width, height } = value.rect;
      const clampedX = Math.max(0, Math.round(x * dpr));
      const clampedY = Math.max(0, Math.round(y * dpr));
      const clampedW = Math.min(Math.round(width * dpr), full.width - clampedX);
      const clampedH = Math.min(Math.round(height * dpr), full.height - clampedY);
      if (clampedW > 0 && clampedH > 0) {
        const cropped = new PNG({ width: clampedW, height: clampedH });
        PNG.bitblt(full, cropped, clampedX, clampedY, clampedW, clampedH, 0, 0);
        const screenshotFile = screen.file.replace(/\.html$/, '.png');
        fs.writeFileSync(path.join(extractDir, screenshotFile), PNG.sync.write(cropped));
        screen.screenshot = screenshotFile;
      }
    }
    results.push({ id: screen.id, status: 'rendered', renderFn: fnName, bytes: value.html.length, screenshot: screen.screenshot ?? null });
  }
  results.skipped = skipped;
  return results;
}

/**
 * Re-detect dynamic regions from the CURRENT on-disk screen/chrome files —
 * not the stale pre-render markup phase 0 saw. A region owned by a
 * `dynamic: true` screen (e.g. a `custList` container p-customers only grows
 * once `renderCustomers()` runs) is invisible to phase 0's positional search
 * — the container simply doesn't exist yet in the empty shell it scanned —
 * and reads `ownerKind: "unresolved"` there even though the screen's *real*
 * markup, sitting right there in `screens/<file>` after `renderScreens()`
 * above, plainly contains it. Re-running the exact same positional search
 * against current files fixes that without guessing at a naming convention.
 *
 * `containerDoc` is passed as `null` — the shared scroll/stage wrapper phase 0
 * derives from one single-page HTML string with all screens as siblings isn't
 * reconstructible from the split-per-screen files this script reads, so a
 * region truly owned by that wrapper (rare — see SKILL.md) still reports
 * `unresolved` here rather than `container`. Not a regression: phase 0's own
 * `dynamic-regions.json` already covers that case correctly; this refresh
 * only ever *adds* resolution phase 0 couldn't have had yet.
 */
function refreshDynamicRegions(extractDir, inventory, behaviorSrc) {
  const scopeIndex = buildScopeIndex(behaviorSrc);
  const screenDocs = inventory.screens.map((s) => ({
    key: s.id,
    file: s.file,
    html: fs.readFileSync(path.join(extractDir, s.file), 'utf8')
  }));
  const chromeDocs = (inventory.chrome ?? []).map((c) => ({
    key: c.name,
    file: c.file,
    html: fs.readFileSync(path.join(extractDir, c.file), 'utf8')
  }));

  const regions = findDynamicRegions({
    behaviorSrc,
    scopeIndex,
    screenIds: inventory.screens.map((s) => s.id),
    screenDocs,
    chromeDocs,
    containerDoc: null
  });

  const byScreen = new Map();
  const byChrome = new Map();
  for (const r of regions) {
    const entry = { id: r.id, renderFns: r.renderFns, calledBy: r.calledBy };
    if (r.ownerKind === 'screen') {
      if (!byScreen.has(r.owner.id)) byScreen.set(r.owner.id, []);
      byScreen.get(r.owner.id).push(entry);
    } else if (r.ownerKind === 'chrome') {
      if (!byChrome.has(r.owner.name)) byChrome.set(r.owner.name, []);
      byChrome.get(r.owner.name).push(entry);
    }
  }
  // Fold into every screen's facts.json — same shape phase 0 writes there —
  // so a screen this script never touched (its regions were already correct)
  // and one it just rendered both end up with the same accurate field.
  for (const screen of inventory.screens) {
    const factsPath = path.join(extractDir, screen.factsFile);
    if (!fs.existsSync(factsPath)) continue;
    const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8'));
    facts.dynamicRegions = byScreen.get(screen.id) ?? [];
    fs.writeFileSync(factsPath, JSON.stringify(facts, null, 2));
  }
  for (const chrome of inventory.chrome ?? []) {
    chrome.dynamicRegions = byChrome.get(chrome.name) ?? [];
  }

  return regions;
}

/** A fn name that reads as a full painter (`render*`) over one that reads as
 * a filter/toggle helper (`custFilter`, `matStatus`) — both get recorded as
 * `renderFns` candidates for a region since both eventually assign its
 * innerHTML, but only the render-shaped one is safe to call cold with no
 * prior interaction. Falls back to the first (alphabetical) candidate when
 * none matches — still better than nothing, and `renderStatus` reports
 * `empty-after-render`/`error` rather than silently mis-rendering either way. */
function pickDefaultFn(renderFns) {
  const renderish = renderFns.filter((f) => /^render/i.test(f));
  return renderish[0] ?? renderFns[0] ?? null;
}

function isEmptyOuterHTML(outerHTML) {
  const inner = outerHTML.replace(/^<[^>]+>/, '').replace(/<\/[a-zA-Z][\w-]*>\s*$/, '').trim();
  return inner.length < 30;
}

function spliceElementById(html, id, newOuterHTML) {
  const el = scanElements(html).find((e) => e.attrs.id === id);
  if (!el) return null;
  return html.slice(0, el.start) + newOuterHTML + html.slice(el.end);
}

/**
 * Live-render whichever screen-owned dynamic region is still empty after
 * `renderScreens()`/`refreshDynamicRegions()` above — this is the actual gap
 * those two only detect and report: a screen that is itself `dynamic: false`
 * (its OWN markup is authoritative — p-job never gets touched by
 * `renderScreens()`) can still ship one or more empty sub-containers
 * (`modGrid`, `msgPreview`, `recentPhotos`, `jobNotes`, …) that only a
 * behaviour-script function fills at runtime. Anything already non-empty
 * (typically a region whose owning screen's own render pass already painted
 * it — `dashJobs` inside `renderDashboard()`, for example) is left alone by
 * default: re-deriving from an isolated call is *less* faithful than what the
 * screen's own render already produced, not more.
 *
 * Only `ownerKind: "screen"` regions are touched automatically. `"chrome"`
 * stays report-only (SKILL.md: already covered by `inventory.chrome`, and
 * `sheetBody`-shaped regions carry dozens of mutually exclusive render paths
 * with no single "default" state to render cold). `"ambiguous"`/`"unresolved"`
 * have no single owning screen to patch. Any of these can still be forced via
 * `--region <id>` naming it directly, which raises an explicit `error` for the
 * cases above rather than silently doing nothing.
 */
async function renderRegions({ send, extractDir, inventory, regions, overrides, args }) {
  const screensById = new Map(inventory.screens.map((s) => [s.id, s]));
  // Rebuilt fresh per region rather than passed in from renderScreens()'s
  // ctx, in case regions belong to screens renderScreens() never touched
  // (an `--screen`-scoped run, or a screen that isn't `dynamic: true` at all).
  const tokens = JSON.parse(fs.readFileSync(path.join(extractDir, 'styles/tokens.json'), 'utf8'));
  const appCss = fs.readFileSync(path.join(extractDir, 'styles/app.css'), 'utf8');
  const scaleFn = typeof args['scale-fn'] === 'string' ? args['scale-fn'] : 'scale';
  const tokenTable = buildTokenTable(tokens.classified);
  const { byClass } = compileRnStyles(parseStylesheet(appCss), tokenTable, scaleFn);
  const ctx = { tokenTable, byClass, scaleFn };

  const results = [];
  for (const region of regions) {
    if (args.region && region.id !== args.region) continue;
    if (region.ownerKind !== 'screen') {
      const status = args.region ? 'error' : 'skipped';
      results.push({ id: region.id, status, reason: `ownerKind is "${region.ownerKind}" — no single owning screen to patch (see SKILL.md's dynamic-regions section)` });
      continue;
    }
    const screen = screensById.get(region.owner.id);
    if (!screen) {
      results.push({ id: region.id, status: 'error', reason: `owner screen ${region.owner.id} not found in inventory.screens` });
      continue;
    }
    const currentHtml = fs.readFileSync(path.join(extractDir, screen.file), 'utf8');
    const existing = scanElements(currentHtml).find((e) => e.attrs.id === region.id);
    if (!existing) {
      results.push({ id: region.id, status: 'error', reason: `id not found in ${screen.file} — dynamic-regions.json may be stale, re-run this script` });
      continue;
    }
    const currentOuter = currentHtml.slice(existing.start, existing.end);
    if (!isEmptyOuterHTML(currentOuter) && !args.force) {
      region.renderStatus = 'already-populated';
      results.push({ id: region.id, status: 'already-populated', reason: "container already has content, most likely painted by its owning screen's own render pass — pass --force to re-render anyway" });
      continue;
    }

    const override = overrides[region.id] ?? {};
    const fnName =
      typeof args['region-fn'] === 'string' && args.region === region.id
        ? args['region-fn']
        : (override.fn ?? pickDefaultFn(region.renderFns));
    if (!fnName) {
      region.renderStatus = 'unresolved';
      results.push({ id: region.id, status: 'unresolved', reason: 'no renderFns recorded for this region' });
      continue;
    }
    const call = fnName.includes('(') ? fnName : `${fnName}()`;
    const prepare =
      typeof args['region-prepare'] === 'string' && args.region === region.id
        ? args['region-prepare']
        : (override.prepare ?? '');
    // The owning screen may not be the active page in a cold-loaded tab —
    // some render functions measure or query relative to visible layout, and
    // a hidden (`display:none`) container always reports a zero rect for the
    // screenshot crop below. Best-effort like the screen loop's own
    // post-render showPage() call: if this design's router throws (id not
    // recognised, wrong signature), the region can still render, just without
    // a guaranteed-correct rect/screenshot.
    const ownerShortId = region.owner.id.replace(/^p-/, '');
    const expr = `(() => { try { showPage(${JSON.stringify(ownerShortId)}); } catch (e) {} ${prepare ? `try { ${prepare} } catch (e) { return { error: 'prepare: ' + String(e) }; }` : ''} try { ${call} } catch (e) { return { error: String(e) }; } const el = document.getElementById(${JSON.stringify(region.id)}); if (!el) return { error: 'element not found after render call' }; const r = el.getBoundingClientRect(); return { html: el.outerHTML, rect: { x: r.x, y: r.y, width: r.width, height: r.height }, dpr: window.devicePixelRatio || 1 }; })()`;
    const evalResult = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    const value = evalResult?.result?.value;
    if (evalResult?.exceptionDetails || value?.error) {
      region.renderStatus = 'error';
      results.push({ id: region.id, status: 'error', renderFn: fnName, reason: evalResult?.exceptionDetails?.text ?? value.error });
      continue;
    }
    if (!value.html || isEmptyOuterHTML(value.html)) {
      region.renderStatus = 'empty-after-render';
      results.push({ id: region.id, status: 'empty-after-render', renderFn: fnName, reason: `${fnName}() ran without error but the region is still empty — it likely needs state a prior step would set (see --region-prepare)` });
      continue;
    }

    const patched = spliceElementById(currentHtml, region.id, value.html);
    fs.writeFileSync(path.join(extractDir, screen.file), patched);
    // Re-derives the owning screen's facts/styles from its now-patched
    // content — the same reason renderScreens() calls this after populating a
    // whole screen. Safe to call once per region even when several regions
    // share one screen: each iteration re-reads currentHtml from disk, so an
    // earlier region's patch in this same run is already reflected.
    regenerateArtifacts(extractDir, screen, patched, ctx);
    region.renderStatus = 'rendered';
    region.renderFn = fnName;

    if (!args['no-screenshot']) {
      await new Promise((r) => setTimeout(r, 150));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const full = PNG.sync.read(Buffer.from(shot.data, 'base64'));
      const dpr = value.dpr || 1;
      const { x, y, width, height } = value.rect;
      const clampedX = Math.max(0, Math.round(x * dpr));
      const clampedY = Math.max(0, Math.round(y * dpr));
      const clampedW = Math.min(Math.round(width * dpr), full.width - clampedX);
      const clampedH = Math.min(Math.round(height * dpr), full.height - clampedY);
      if (clampedW > 0 && clampedH > 0) {
        const cropped = new PNG({ width: clampedW, height: clampedH });
        PNG.bitblt(full, cropped, clampedX, clampedY, clampedW, clampedH, 0, 0);
        fs.mkdirSync(path.join(extractDir, 'regions'), { recursive: true });
        const screenshotFile = `regions/${region.id}.png`;
        fs.writeFileSync(path.join(extractDir, screenshotFile), PNG.sync.write(cropped));
        region.screenshot = screenshotFile;
      }
    }
    results.push({ id: region.id, status: 'rendered', renderFn: fnName, bytes: value.html.length, screenshot: region.screenshot ?? null });
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.extract || !args['cdp-port']) {
    console.error(
      'Usage: render-dynamic-screens.mjs --extract <dir> --cdp-port <port> [--config <config.json>]\n' +
      '  [--screen <id>] [--fn <name-or-call>] [--prepare <js>]\n' +
      '  [--region <id>] [--region-fn <name-or-call>] [--region-prepare <js>]\n' +
      '  [--no-screens] [--no-regions] [--all] [--force] [--scale-fn <name>] [--no-screenshot]'
    );
    process.exit(2);
  }
  const extractDir = path.resolve(args.extract);
  const inventoryPath = path.join(extractDir, 'inventory.json');
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const behaviorSrc = inventory.behavior ? fs.readFileSync(path.join(extractDir, inventory.behavior.file), 'utf8') : '';
  if (!behaviorSrc) {
    console.error('No behavior script in inventory.json — nothing to render from.');
    process.exit(1);
  }

  // Per-screen/per-region `fn`/`prepare` recorded in the project's own
  // config, so the handful that need a selected record or a prior navigation
  // step survive a re-extract instead of being rediscovered by hand every time.
  let overrides = {};
  let regionOverrides = {};
  if (args.config && fs.existsSync(path.resolve(args.config))) {
    const cfg = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8'));
    overrides = cfg.source?.renderOverrides ?? {};
    regionOverrides = cfg.source?.regionRenderOverrides ?? {};
  }

  // The compiled stylesheet, rebuilt once — every regenerated screen slices
  // the same rule set that phase 0 compiled.
  const tokens = JSON.parse(fs.readFileSync(path.join(extractDir, 'styles/tokens.json'), 'utf8'));
  const appCss = fs.readFileSync(path.join(extractDir, 'styles/app.css'), 'utf8');
  const scaleFn = typeof args['scale-fn'] === 'string' ? args['scale-fn'] : 'scale';
  const tokenTable = buildTokenTable(tokens.classified);
  const { byClass } = compileRnStyles(parseStylesheet(appCss), tokenTable, scaleFn);
  const ctx = { tokenTable, byClass, scaleFn };

  const { send, close } = await cdpEvaluate(Number(args['cdp-port']), '');

  const screenResults = args['no-screens']
    ? []
    : await renderScreens({ send, extractDir, inventory, behaviorSrc, overrides, args, ctx });

  let regionResults = [];
  let regions = [];
  if (!args['no-regions']) {
    // Screens first, regions second, in the SAME run — a region belonging to
    // a screen that hadn't been rendered yet would see an empty container and
    // might patch into it, only for renderScreens() to overwrite that whole
    // screen file moments later had the order been reversed.
    regions = refreshDynamicRegions(extractDir, inventory, behaviorSrc);
    regionResults = await renderRegions({ send, extractDir, inventory, regions, overrides: regionOverrides, args });
    inventory.dynamicRegions = {
      file: 'dynamic-regions.json',
      count: regions.length,
      byOwnerKind: regions.reduce((a, r) => ({ ...a, [r.ownerKind]: (a[r.ownerKind] ?? 0) + 1 }), {}),
      note: 'getElementById(...).innerHTML= targets that are not a screen. Ownership here is resolved against CURRENT (post-render) markup. owner.kind === "screen" regions with an empty container were live-rendered by this script by default (renderStatus/renderFn/screenshot on each region); owner.kind === "chrome" stays report-only — already covered by inventory.chrome, not a planning gap (see SKILL.md).'
    };
    fs.writeFileSync(path.join(extractDir, 'dynamic-regions.json'), JSON.stringify({ regions }, null, 2));
  }

  close();

  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));

  if (screenResults.length || screenResults.skipped) {
    const rendered = screenResults.filter((r) => r.status === 'rendered').length;
    console.log('Screens:');
    for (const r of screenResults) console.log(`  [${r.status}] ${r.id}${r.renderFn ? ` via ${r.renderFn.includes('(') ? r.renderFn : `${r.renderFn}()`}` : ''}${r.reason ? ` — ${r.reason}` : ''}`);
    console.log(`  ${rendered}/${screenResults.length} screens rendered this run${screenResults.skipped ? ` (${screenResults.skipped} already-rendered screens skipped — pass --all to force, or --screen <id> for one)` : ''}.`);
  }
  if (regionResults.length) {
    const rendered = regionResults.filter((r) => r.status === 'rendered').length;
    console.log('\nRegions:');
    for (const r of regionResults) console.log(`  [${r.status}] ${r.id}${r.renderFn ? ` via ${r.renderFn.includes('(') ? r.renderFn : `${r.renderFn}()`}` : ''}${r.reason ? ` — ${r.reason}` : ''}`);
    console.log(`  ${rendered}/${regionResults.length} regions rendered this run (see [already-populated]/[skipped] above for the rest).`);
  }
}

main();

/**
 * What this does NOT cover:
 * - Animations (CSS @keyframes/transitions) — already captured as CSS rules
 *   in styles/app.css; there is no way to "extract" a running animation as a
 *   static file, only the rule that drives it (see css-to-rn.md/known-traps.md).
 * - Interactive edge-case states (an expanded row, a validation error shown,
 *   a toggled switch) — this captures ONE frame: the screen's/region's state
 *   right after its own render function runs with no further interaction. A
 *   screen or region with several meaningfully different states needs
 *   separate `--navigate`/`--region-prepare` calls per state (see
 *   capture-design.mjs's `rect`/`diff` for the pattern), authored per screen —
 *   not something a generic script can enumerate.
 * - A region whose `renderFns` are all mutually exclusive alternative states
 *   with no single "default" (`sheetBody`'s 20+ functions, one per bottom-
 *   sheet flavour) — these stay `ownerKind: "chrome"` and report-only by
 *   design; rendering "the" bottom sheet has no single right answer.
 */
