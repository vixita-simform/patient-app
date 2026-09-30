import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { detectFormat, readBundle } from './extract-design.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(here, '__fixtures__', name), 'utf8');

test('detectFormat recognises a bundler payload', () => {
  assert.equal(detectFormat(fixture('bundle.html')), 'bundler-v1');
});

test('detectFormat falls back to inline-style for plain HTML', () => {
  assert.equal(detectFormat(fixture('plain.html')), 'inline-style');
});

test('detectFormat recognises linked stylesheets', () => {
  const html = '<html><head><link rel="stylesheet" href="a.css"></head></html>';
  assert.equal(detectFormat(html), 'linked-css');
});

test('readBundle returns the decoded template, manifest and ext resources', () => {
  const { template, manifest, extResources } = readBundle(fixture('bundle.html'));
  assert.match(template, /^<!DOCTYPE html>/);
  assert.match(template, /data-theme="dark"/);
  assert.equal(Object.keys(manifest).length, 2);
  assert.equal(manifest['aaaaaaaa-0000-0000-0000-000000000001'].mime, 'application/javascript');
  assert.deepEqual(extResources, [
    { id: 'logo', uuid: 'bbbbbbbb-0000-0000-0000-000000000002' }
  ]);
});

test('readBundle throws a named error when the manifest is absent', () => {
  assert.throws(() => readBundle(fixture('plain.html')), /no __bundler\/manifest/i);
});

import {
  decodeEntry, babelOrder, declaredComponents, primaryName, splitStyles
} from './extract-design.mjs';
import { gzipSync } from 'node:zlib';

test('decodeEntry base64-decodes an uncompressed entry', () => {
  const out = decodeEntry({ data: Buffer.from('hello').toString('base64'), compressed: false });
  assert.equal(out.toString('utf8'), 'hello');
});

test('decodeEntry gunzips a compressed entry', () => {
  const data = gzipSync(Buffer.from('hello')).toString('base64');
  assert.equal(decodeEntry({ data, compressed: true }).toString('utf8'), 'hello');
});

test('babelOrder lists text/babel script uuids in document order', () => {
  const { template } = readBundle(fixture('bundle.html'));
  assert.deepEqual(babelOrder(template), ['aaaaaaaa-0000-0000-0000-000000000001']);
});

test('declaredComponents finds PascalCase top-level declarations only', () => {
  const src = [
    'function Bell() {}',
    'const TABS = [];',
    'function HomeScreen() {}',
    '  function NotTopLevel() {}',
    'let helper = 1;'
  ].join('\n');
  assert.deepEqual(declaredComponents(src), ['Bell', 'TABS', 'HomeScreen']);
});

test('primaryName prefers a Flow, then a Module, then the last Screen', () => {
  assert.equal(primaryName(['BuyTopbar', 'OrderSummaryScreen', 'BuyGoldFlow']), 'BuyGoldFlow');
  assert.equal(primaryName(['TxIcon', 'TransactionHistoryScreen', 'HistoryModule']), 'HistoryModule');
  assert.equal(primaryName(['Field', 'LoginScreen', 'ProfileSetupScreen']), 'ProfileSetupScreen');
  assert.equal(primaryName(['Bell', 'Sparkle', 'Logo']), 'Bell');
});

test('primaryName skips SCREAMING_CASE data constants when falling back', () => {
  // declaredComponents returns data constants too, so a naive decls[0] fallback
  // names a file of date pickers C_MONTHS.jsx.
  assert.equal(primaryName(['C_MONTHS', 'C_DOW', 'CalGrid', 'DateField']), 'CalGrid');
  assert.equal(primaryName(['NOTIF_ICONS', 'NOTIFS_SEED', 'NotificationCenter']), 'NotificationCenter');
});

test('splitStyles separates the token block from the rest of the CSS', () => {
  const { template } = readBundle(fixture('bundle.html'));
  const { tokensCss, appCss } = splitStyles(template);
  assert.match(tokensCss, /\[data-theme="dark"\]/);
  assert.match(tokensCss, /:root/);
  assert.doesNotMatch(tokensCss, /auth-h1/);
  assert.match(appCss, /\.auth-h1/);
  assert.doesNotMatch(appCss, /data-theme="dark"/);
});

import { parseTokens, classifyValue, classifyToken } from './extract-design.mjs';

test('parseTokens separates root, light and dark declarations', () => {
  const { tokensCss } = splitStyles(readBundle(fixture('bundle.html')).template);
  const t = parseTokens(tokensCss);
  assert.equal(t.root['--font-display'], "'Kanit', sans-serif");
  assert.equal(t.dark['--bg'], '#0c0c0d');
  assert.equal(t.light['--bg'], '#fffaf0');
  assert.equal(t.light['--text'], '#1c1812');
});

test('classifyValue distinguishes the six real value shapes', () => {
  assert.equal(classifyValue('#0c0c0d'), 'color');
  assert.equal(classifyValue('rgba(255,216,142,0.10)'), 'color');
  assert.equal(
    classifyValue('linear-gradient(103deg, #d99a28 0%, #ffc636 48%, #c87914 100%)'),
    'gradient'
  );
  assert.equal(
    classifyValue('radial-gradient(120% 95% at 0% 0%, rgba(58,44,18,0.26) 0%, rgba(30,24,12,0) 40%), linear-gradient(150deg, #15130d 0%, #07080e 100%)'),
    'gradient'
  );
  assert.equal(
    classifyValue('inset 0 1px 0 rgba(255,216,142,0.10), 0 22px 48px -20px rgba(0,0,0,0.95)'),
    'shadow'
  );
  assert.equal(classifyValue('drop-shadow(0 0 20px rgba(255,176,40,0.42))'), 'filter');
  assert.equal(classifyValue('url("951b919e-bb79-429a-9e8b-6fafc64066b1")'), 'asset');
  assert.equal(classifyValue('0.55'), 'scalar');
  assert.equal(classifyValue("'Kanit', system-ui, sans-serif"), 'font');
  assert.equal(classifyValue('none'), 'none');
});

test('classifyToken camelCases the CSS variable name', () => {
  const t = classifyToken('--gc-card-grad', 'linear-gradient(156deg, #fff3d2 0%, #fffdf7 100%)',
    'linear-gradient(150deg, #15130d 0%, #07080e 100%)');
  assert.equal(t.key, 'gcCardGrad');
  assert.equal(t.kind, 'gradient');
});

test('classifyToken lets the defined theme decide the kind when the other is none', () => {
  // --grams-glow is a drop-shadow filter in dark and literally `none` in light.
  const t = classifyToken('--grams-glow', 'none', 'drop-shadow(0 0 20px rgba(255,176,40,0.42))');
  assert.equal(t.kind, 'filter');
  assert.equal(t.light, 'none');
});

test('classifyToken keeps per-theme asset values distinct', () => {
  const t = classifyToken(
    '--pattern-url',
    'url("1c6ee787-754a-423d-8d9b-7daea9a2cb0f")',
    'url("951b919e-bb79-429a-9e8b-6fafc64066b1")'
  );
  assert.equal(t.kind, 'asset');
  assert.notEqual(t.light, t.dark);
});

test('classifyToken refuses to guess at an unrecognised value', () => {
  assert.throws(() => classifyToken('--mystery', 'wat(1)', 'wat(1)'), /unclassifiable/i);
});

import { detectCapabilities, extract } from './extract-design.mjs';
import { mkdtempSync, existsSync, readFileSync as rf, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

test('detectCapabilities reports only what the sources actually use', () => {
  const caps = detectCapabilities(
    '.a{background:linear-gradient(90deg,#000,#fff);} .b{transition:opacity .2s;}',
    ['const Icon = () => <svg viewBox="0 0 24 24"/>;']
  );
  assert.equal(caps.gradients, true);
  assert.equal(caps.svg, true);
  assert.equal(caps.animation, true);
  assert.equal(caps.blur, false);
  assert.equal(caps.bottomSheet, false);
});

test('detectCapabilities spots backdrop blur and sheet markup', () => {
  const caps = detectCapabilities(
    '.scrim{backdrop-filter:blur(8px);} .sheet{border-radius:24px 24px 0 0;position:fixed;bottom:0;}',
    []
  );
  assert.equal(caps.blur, true);
  assert.equal(caps.bottomSheet, true);
});

test('detectCapabilities finds sheets that animate in rather than sitting at bottom:0', () => {
  // The real design's nine Sheet components use translateY, not position:fixed
  // with bottom:0, and were missed when both signals had to co-occur in one rule.
  const caps = detectCapabilities(
    '.offer-sheet-inner{background:#111;border-radius:26px 26px 0 0;transform:translateY(100%);}',
    ['function OfferDetailSheet() { return null; }']
  );
  assert.equal(caps.bottomSheet, true);
});

test('detectCapabilities does not call a plain rounded card a sheet', () => {
  const caps = detectCapabilities('.card{border-radius:12px;background:#fff;}', ['const Card = () => null;']);
  assert.equal(caps.bottomSheet, false);
});

test('extract writes the full tree and a usable inventory', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-'));
  const inv = await extract(join(here, '__fixtures__', 'bundle.html'), out);

  assert.ok(existsSync(join(out, 'index.html')));
  assert.ok(existsSync(join(out, 'styles/tokens.css')));
  assert.ok(existsSync(join(out, 'styles/app.css')));
  assert.ok(existsSync(join(out, 'maps')));
  assert.ok(existsSync(join(out, 'screens/00-Hi.jsx')));
  assert.ok(existsSync(join(out, 'assets/logo.svg')));

  assert.equal(inv.source.format, 'bundler-v1');
  assert.equal(inv.tokens.dark['--bg'], '#0c0c0d');
  assert.equal(inv.tokens.light['--bg'], '#fffaf0');
  assert.equal(inv.assets.find((a) => a.id === 'logo').file, 'assets/logo.svg');

  // A token declared only in :root (no per-theme override — here, --font-display)
  // must still show up classified, not silently dropped.
  assert.ok(inv.tokens.classified.find((t) => t.name === '--font-display'));

  // The template's uuid references are rewritten to the local paths.
  const html = rf(join(out, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /aaaaaaaa-0000-0000-0000-000000000001/);
  assert.match(html, /screens\/00-Hi\.jsx/);

  // The inventory is the contract for later phases; it must round-trip as JSON.
  assert.deepEqual(JSON.parse(rf(join(out, 'inventory.json'), 'utf8')), inv);
});

/* ============================================================ inline-style */

import {
  resolveVarRefs, classifyAllTokens, detectScreenSelector, extractScreenSections,
  extractBalancedElement, extractInlineScripts, parseAttrs, detectComponentCandidates
} from './extract-design.mjs';

test('resolveVarRefs resolves a multi-tier var() chain to its literal value', () => {
  const table = {
    '--color-green-500': '#1F5634',
    '--color-brand': 'var(--color-green-500)',
    '--button-background': 'var(--color-brand)'
  };
  const out = resolveVarRefs(table);
  assert.equal(out['--button-background'], '#1F5634');
  assert.equal(out['--color-brand'], '#1F5634');
  assert.equal(out['--color-green-500'], '#1F5634');
});

test('resolveVarRefs leaves a literal value untouched', () => {
  assert.equal(resolveVarRefs({ '--x': '#fff' })['--x'], '#fff');
});

test('resolveVarRefs throws a named error on a circular reference', () => {
  assert.throws(
    () => resolveVarRefs({ '--a': 'var(--b)', '--b': 'var(--a)' }),
    /circular/i
  );
});

test('resolveVarRefs throws a named error on a reference to nothing', () => {
  assert.throws(() => resolveVarRefs({ '--a': 'var(--ghost)' }), /unresolved/i);
});

test('classifyAllTokens classifies a root-only 3-tier token system with no per-theme blocks', () => {
  const tokens = {
    root: {
      '--color-green-500': '#1F5634',
      '--color-brand': 'var(--color-green-500)',
      '--button-background': 'var(--color-brand)'
    },
    light: {},
    dark: {}
  };
  const classified = classifyAllTokens(tokens);
  const byName = Object.fromEntries(classified.map((t) => [t.name, t]));
  assert.equal(byName['--button-background'].kind, 'color');
  assert.equal(byName['--button-background'].light, '#1F5634');
  assert.equal(byName['--button-background'].key, 'buttonBackground');
  assert.equal(classified.length, 3);
});

test('parseAttrs reads class and id regardless of attribute order', () => {
  const attrs = parseAttrs('id="p-signin" style="color:red" class="page active"');
  assert.equal(attrs.id, 'p-signin');
  assert.equal(attrs.class, 'page active');
});

test('detectScreenSelector finds the repeated screen class among siblings with distinct ids', () => {
  const html = fixture('inline-app.html');
  assert.deepEqual(detectScreenSelector(html), { tag: 'section', className: 'page' });
});

test('detectScreenSelector honours an explicit override without guessing', () => {
  assert.deepEqual(detectScreenSelector('<html></html>', 'div.screen-panel'), {
    tag: 'div', className: 'screen-panel'
  });
});

test('detectScreenSelector throws a named, actionable error when nothing repeats', () => {
  assert.throws(
    () => detectScreenSelector('<html><body><div id="only-one" class="page"></div></body></html>'),
    /screenSelector/i
  );
});

test('extractScreenSections splits every screen in document order, self-closing shells included', () => {
  const html = fixture('inline-app.html');
  const screens = extractScreenSections(html, { tag: 'section', className: 'page' });
  assert.deepEqual(screens.map((s) => s.id), ['p-signin', 'p-plan', 'p-dashboard', 'p-jobs']);
  assert.match(screens[0].outerHTML, /Welcome back/);
  assert.match(screens[2].outerHTML, /<section class="page" id="p-dashboard">\s*<\/section>/);
});

test('extractBalancedElement matches same-tag nesting by depth, not the next close tag', () => {
  const html = '<section id="a"><section id="b">x</section>y</section>z';
  const out = extractBalancedElement(html, 0, 'section');
  assert.equal(out, '<section id="a"><section id="b">x</section>y</section>');
});

test('extractInlineScripts concatenates literal scripts and skips bundler payloads and external src', () => {
  const html = fixture('inline-app.html');
  const src = extractInlineScripts(html);
  assert.match(src, /function goStep/);
  assert.match(src, /function back/);
});

test('extractInlineScripts skips a __bundler payload block and an external src script', () => {
  const html =
    '<script type="__bundler/manifest">{}</script>' +
    '<script src="https://cdn.example/react.js"></script>' +
    '<script>var real = 1;</script>';
  assert.equal(extractInlineScripts(html), 'var real = 1;');
});

test('extract handles an inline-style export end to end', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-inline-'));
  const inv = await extract(join(here, '__fixtures__', 'inline-app.html'), out);

  assert.equal(inv.source.format, 'inline-style');
  assert.equal(inv.screenSelector, 'section.page');
  assert.equal(inv.screens.length, 4);

  // Static screens carry real markup; the two trailing shells are near-empty
  // and flagged dynamic rather than silently treated as "just empty".
  assert.equal(inv.screens.find((s) => s.id === 'p-signin').dynamic, false);
  assert.equal(inv.screens.find((s) => s.id === 'p-dashboard').dynamic, true);
  // Handler names are planning detail, so they live in the screen's facts file
  // rather than bloating the index every phase reads.
  const signinFacts = JSON.parse(rf(join(out, inv.screens.find((s) => s.id === 'p-signin').factsFile), 'utf8'));
  assert.deepEqual(signinFacts.handlers, ['goStep']);

  assert.ok(existsSync(join(out, 'screens/00-Signin.html')));
  assert.ok(existsSync(join(out, 'scripts/app.js')));
  assert.equal(inv.behavior.file, 'scripts/app.js');
  assert.match(rf(join(out, 'scripts/app.js'), 'utf8'), /function goStep/);

  // 3-tier var() chain resolves rather than throwing "unclassifiable". The
  // full table lives in styles/tokens.json; the inventory keeps only its shape.
  const tokens = JSON.parse(rf(join(out, inv.tokens.file), 'utf8'));
  const button = tokens.classified.find((t) => t.name === '--button-background');
  assert.equal(button.kind, 'color');
  assert.equal(button.light, '#1F5634');
  assert.equal(inv.tokens.count, tokens.classified.length);

  // Every screen's CSS arrives pre-translated, so phase 3 never re-derives a value.
  const signin = inv.screens.find((s) => s.id === 'p-signin');
  assert.ok(existsSync(join(out, signin.styleFile)));
  assert.ok(existsSync(join(out, signin.factsFile)));

  // The nav model classifies rather than flattening: every screen gets a role.
  assert.ok(inv.navigation.total === inv.screens.length);
  assert.ok(inv.screens.every((s) => ['tab', 'child', 'flow', 'unlinked'].includes(s.role)));
  assert.ok(existsSync(join(out, 'screens/INDEX.md')));

  // Capabilities read off the joined screen HTML + app.css, same contract as bundler-v1.
  assert.equal(inv.capabilities.gradients, true);
  assert.equal(inv.capabilities.animation, true);

  // .card appears (with real visual style) on both p-signin and p-plan, so it
  // is a mined component candidate; .btn only appears once and is correctly
  // left out — a candidate has to repeat to be worth building.
  const candidates = JSON.parse(rf(join(out, inv.componentCandidates.file), 'utf8')).candidates;
  const card = candidates.find((c) => c.signature === 'div.card');
  assert.ok(card, 'expected div.card to be mined as a component candidate');
  assert.equal(card.screenCount, 2);
  assert.ok(!candidates.some((c) => c.baseClasses.includes('btn')), '.btn used once should not qualify');
  assert.equal(inv.componentCandidates.count, candidates.length);

  assert.deepEqual(JSON.parse(rf(join(out, 'inventory.json'), 'utf8')), inv);
});

test('extract respects an explicit screenSelector override for an inline-style export', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-inline-override-'));
  const inv = await extract(
    join(here, '__fixtures__', 'inline-app.html'), out, { screenSelector: 'section.page' }
  );
  assert.equal(inv.screens.length, 4);
});

test('extract flags markup a render function overwrites, however much of it there is', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-inline-stale-'));
  const inv = await extract(join(here, '__fixtures__', 'inline-stale.html'), out);

  // The regression this guards: p-signin ships a full, plausible sign-in form
  // — heading, two labelled inputs, a button — that renderSignin() replaces at
  // load. The old test was `inner.length < 30`, so a screen like this read as
  // authoritative and every downstream artifact described a screen that never
  // renders. Size cannot distinguish it; only "a render function targets this
  // id" can.
  const signin = inv.screens.find((s) => s.id === 'p-signin');
  assert.ok(signin.bytes > 200, 'fixture must ship substantial markup, or it is testing the empty-shell path');
  assert.equal(signin.dynamic, true);
  assert.equal(signin.staticMarkup, 'stale-overwritten');
  assert.equal(signin.overwritten, true);
  assert.deepEqual(signin.renderFns, ['renderSignin']);

  // An empty shell is still dynamic, but it is the other, obvious kind.
  const dashboard = inv.screens.find((s) => s.id === 'p-dashboard');
  assert.equal(dashboard.dynamic, true);
  assert.equal(dashboard.staticMarkup, 'empty-shell');
  assert.equal(dashboard.overwritten, false);

  // A screen no render function touches keeps its markup's authority.
  const plan = inv.screens.find((s) => s.id === 'p-plan');
  assert.equal(plan.dynamic, false);
  assert.equal(plan.staticMarkup, 'authoritative');
  assert.equal(plan.overwritten, false);
});

/* ======================================================= dynamic regions */

test('extract writes dynamic-regions.json and folds owned regions into facts.json / chrome[]', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-dynamic-regions-'));
  const inv = await extract(join(here, '__fixtures__', 'inline-dynamic-regions.html'), out);

  assert.ok(existsSync(join(out, 'dynamic-regions.json')));
  assert.equal(inv.dynamicRegions.file, 'dynamic-regions.json');
  assert.deepEqual(inv.dynamicRegions.byOwnerKind, {
    unresolved: 1, chrome: 1, screen: 1, container: 1, ambiguous: 1
  });

  // jobActivity is repainted inside p-job by an in-screen tab switch — until
  // this feature, invisible everywhere: not a screen id, not a chrome region.
  const job = inv.screens.find((s) => s.id === 'p-job');
  const jobFacts = JSON.parse(rf(join(out, job.factsFile), 'utf8'));
  assert.deepEqual(jobFacts.dynamicRegions, [
    { id: 'jobActivity', renderFns: ['renderJobActivity'], calledBy: ['openJobTab'] }
  ]);

  // hdrTitle belongs to the header chrome region, not a new gap — folded into
  // inventory.chrome[] rather than left only in the detail file.
  const header = inv.chrome.find((c) => c.role === 'header');
  assert.deepEqual(header.dynamicRegions, [
    { id: 'hdrTitle', renderFns: ['setHeaderTitle'], calledBy: ['showPage'] }
  ]);

  const regions = JSON.parse(rf(join(out, 'dynamic-regions.json'), 'utf8')).regions;
  assert.equal(regions.find((r) => r.id === 'ghostRegion').ownerKind, 'unresolved');
  assert.equal(regions.find((r) => r.id === 'scroll').ownerKind, 'container');
  assert.equal(regions.find((r) => r.id === 'sharedWidget').ownerKind, 'ambiguous');
});

/* ==================================================================== modules */

test('extract infers a tab subtree and a flow as modules, leaving an orphan unassigned', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-nav-modules-'));
  const inv = await extract(join(here, '__fixtures__', 'inline-nav-modules.html'), out);

  const jobsModule = inv.modules.modules.find((m) => m.id === 'jobs');
  assert.deepEqual(jobsModule.screens.sort(), ['job', 'jobs'].sort());
  assert.equal(jobsModule.kind, 'tab');
  assert.equal(jobsModule.nameConfirmed, true);

  const flow = inv.modules.modules.find((m) => m.kind === 'flow');
  assert.deepEqual(flow.screens, ['signin', 'setpw', 'done']);
  assert.equal(flow.nameConfirmed, false);

  assert.deepEqual(inv.modules.unassigned, ['orphan']);
});

/* ======================================================= component mining */

test('detectComponentCandidates groups by tag + non-state classes, ignoring bare state toggles', () => {
  const byClass = new Map([
    ['card', [{ classes: ['card'], style: { backgroundColor: '#fff', borderRadius: 12 } }]]
  ]);
  const screenPairs = [
    { file: 'screens/00-A.html', outerHTML: '<section class="page" id="p-a"><div class="card"><p>x</p></div></section>' },
    { file: 'screens/01-B.html', outerHTML: '<section class="page" id="p-b"><div class="card active"><p>y</p></div></section>' }
  ];
  const candidates = detectComponentCandidates(screenPairs, byClass);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].signature, 'div.card');
  assert.equal(candidates[0].screenCount, 2);
  assert.equal(candidates[0].totalUsages, 2);
  assert.deepEqual(candidates[0].variants, ['active card', 'card']);
  assert.deepEqual(candidates[0].foundIn, ['screens/00-A.html', 'screens/01-B.html']);
});

test('detectComponentCandidates drops a structural wrapper with no visual RN style', () => {
  const byClass = new Map([
    ['row', [{ classes: ['row'], style: { flexDirection: 'row', gap: 8 } }]]
  ]);
  const screenPairs = [
    { file: 'screens/00-A.html', outerHTML: '<section class="page" id="p-a"><div class="row"><p>x</p></div></section>' },
    { file: 'screens/01-B.html', outerHTML: '<section class="page" id="p-b"><div class="row"><p>y</p></div></section>' }
  ];
  assert.deepEqual(detectComponentCandidates(screenPairs, byClass), []);
});

test('detectComponentCandidates respects the minScreens threshold', () => {
  const byClass = new Map([
    ['badge', [{ classes: ['badge'], style: { backgroundColor: 'red' } }]]
  ]);
  const screenPairs = [
    { file: 'screens/00-A.html', outerHTML: '<section class="page" id="p-a"><span class="badge">new</span></section>' }
  ];
  assert.deepEqual(detectComponentCandidates(screenPairs, byClass), [], 'one screen should not clear the default minScreens:2');
  assert.equal(detectComponentCandidates(screenPairs, byClass, { minScreens: 1 }).length, 1);
});

test('detectComponentCandidates never proposes the screen container itself', () => {
  const byClass = new Map([
    ['page', [{ classes: ['page'], style: { backgroundColor: '#fff' } }]]
  ]);
  const screenPairs = [
    { file: 'screens/00-A.html', outerHTML: '<section class="page" id="p-a"></section>' },
    { file: 'screens/01-B.html', outerHTML: '<section class="page" id="p-b"></section>' }
  ];
  assert.deepEqual(detectComponentCandidates(screenPairs, byClass), []);
});

/* ============================================================ incremental */

test('re-extracting an unchanged inline-style export reuses every screen\'s files and preserves live-render state', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-incremental-'));
  const first = await extract(join(here, '__fixtures__', 'inline-app.html'), out);

  // Simulate what render-dynamic-screens.mjs would have done to p-dashboard —
  // the exact state a naive re-extraction must not discard.
  const dashboard = first.screens.find((s) => s.id === 'p-dashboard');
  const renderedHTML = '<section class="page active" id="p-dashboard"><div class="card">Live dashboard content</div></section>';
  writeFileSync(join(out, dashboard.file), renderedHTML);
  const renderedFacts = { ...JSON.parse(rf(join(out, dashboard.factsFile), 'utf8')), texts: ['Live dashboard content'] };
  writeFileSync(join(out, dashboard.factsFile), JSON.stringify(renderedFacts, null, 2));
  const invPath = join(out, 'inventory.json');
  const invBefore = JSON.parse(rf(invPath, 'utf8'));
  const dashInv = invBefore.screens.find((s) => s.id === 'p-dashboard');
  dashInv.renderStatus = 'rendered';
  dashInv.renderFn = 'renderDashboard';
  dashInv.screenshot = 'screens/02-Dashboard.png';
  writeFileSync(invPath, JSON.stringify(invBefore, null, 2));

  const second = await extract(join(here, '__fixtures__', 'inline-app.html'), out);

  const dashAfter = second.screens.find((s) => s.id === 'p-dashboard');
  assert.equal(dashAfter.renderStatus, 'rendered', 're-extraction must not wipe render-dynamic-screens.mjs state off an unchanged screen');
  assert.equal(dashAfter.renderFn, 'renderDashboard');
  assert.equal(dashAfter.screenshot, 'screens/02-Dashboard.png');
  assert.equal(rf(join(out, dashAfter.file), 'utf8'), renderedHTML, 'the live-rendered markup on disk must survive untouched');
  assert.deepEqual(JSON.parse(rf(join(out, dashAfter.factsFile), 'utf8')).texts, ['Live dashboard content']);

  // Every screen carries a stable content hash either way.
  for (const s of second.screens) assert.ok(s.sourceHash, `${s.id} is missing sourceHash`);
  const signinBefore = first.screens.find((s) => s.id === 'p-signin').sourceHash;
  const signinAfter = second.screens.find((s) => s.id === 'p-signin').sourceHash;
  assert.equal(signinAfter, signinBefore);

  const changelog = rf(join(out, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /Initial extraction — 4 screens/);
  assert.match(changelog, /0 added, 0 removed, 0 changed, 4 unchanged/);
});

test('re-extracting after one screen\'s markup changes only touches that screen, and CHANGELOG.md names it', async () => {
  const out = mkdtempSync(join(tmpdir(), 'extract-incremental-changed-'));
  await extract(join(here, '__fixtures__', 'inline-app.html'), out);

  const original = fixture('inline-app.html');
  const edited = original.replace('<p>Choose a plan</p>', '<p>Choose a plan</p><p>Now with annual billing</p>');
  assert.notEqual(edited, original, 'the fixture text this test edits must still be present verbatim');
  const editedPath = join(out, '__edited-inline-app.html');
  writeFileSync(editedPath, edited);

  const before = JSON.parse(rf(join(out, 'inventory.json'), 'utf8'));
  const signinHashBefore = before.screens.find((s) => s.id === 'p-signin').sourceHash;
  const signinBytesOnDiskBefore = rf(join(out, before.screens.find((s) => s.id === 'p-signin').file), 'utf8');

  const after = await extract(editedPath, out);

  const plan = after.screens.find((s) => s.id === 'p-plan');
  assert.match(rf(join(out, plan.file), 'utf8'), /Now with annual billing/);

  const signin = after.screens.find((s) => s.id === 'p-signin');
  assert.equal(signin.sourceHash, signinHashBefore, 'an untouched screen\'s hash must not change just because a sibling did');
  assert.equal(rf(join(out, signin.file), 'utf8'), signinBytesOnDiskBefore, 'an untouched screen\'s file must not be rewritten');

  const changelog = rf(join(out, 'CHANGELOG.md'), 'utf8');
  const newestEntry = changelog.split(/^## /m)[1];
  assert.match(newestEntry, /0 added, 0 removed, 1 changed, 3 unchanged/);
  assert.match(newestEntry, /### Screens changed\n- p-plan/);
});
