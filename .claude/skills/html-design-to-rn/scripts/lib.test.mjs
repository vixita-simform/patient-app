/**
 * Checks for the three extract-time libraries. Each case here is a bug that
 * either shipped once or would have: a value silently dropped, a scope
 * misattributed, a region miscounted. Run with `node --test`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseDeclarations,
  parseStylesheet,
  splitTopLevel,
  evalCalc,
  resolveValue,
  buildTokenTable,
  declarationsToRN,
  collapseShorthands,
  shadowToRN,
  gradientToRN,
  typographyScale,
  fontInventory
} from './lib/css-model.mjs';
import { buildScopeIndex, parsePageMetaTable, parseFlows, parseTabBar, buildNavModel, inferModules } from './lib/nav-model.mjs';
import {
  scanElements,
  extractChrome,
  extractSections,
  extractInputs,
  extractActions,
  scanInnerHTMLTargets,
  findCallers,
  findRenderFns,
  screenContainer,
  findDynamicRegions
} from './lib/html-model.mjs';

const tokens = buildTokenTable([
  { name: '--space-4', key: 'space4', kind: 'scalar', light: '16px' },
  { name: '--brand', key: 'brand', kind: 'color', light: '#1F5634' },
  { name: '--size-tabbar', key: 'sizeTabbar', kind: 'scalar', light: '62px' },
  { name: '--font-size-16', key: 'fontSize16', kind: 'scalar', light: '16px' },
  { name: '--line-height-normal', key: 'lineHeightNormal', kind: 'scalar', light: '1.45' },
  { name: '--font-family-text', key: 'fontFamilyText', kind: 'font', light: '"SF Pro Text",-apple-system,sans-serif' }
]);

/* ------------------------------------------------------------- css-model */

test('parseDeclarations keeps a semicolon inside url() out of the split', () => {
  const d = parseDeclarations('background:url(data:image/svg+xml;base64,AAA);color:red');
  assert.equal(d.color, 'red');
  assert.match(d.background, /base64,AAA/);
});

test('splitTopLevel does not break a calc() across its spaces', () => {
  assert.deepEqual(splitTopLevel('16px calc(62px + 24px) 8px'), ['16px', 'calc(62px + 24px)', '8px']);
});

test('evalCalc sums a px chain and refuses anything it cannot compute', () => {
  assert.equal(evalCalc('calc(62px + 24px)'), 86);
  assert.equal(evalCalc('calc(100% - 16px)'), null);
  assert.equal(evalCalc('calc(62px + max(env(safe-area-inset-bottom), 20px))'), null);
});

test('resolveValue follows a var() chain and reports one it cannot resolve', () => {
  assert.deepEqual(resolveValue('var(--space-4)', tokens), { literal: '16px', refs: ['--space-4'], unresolved: false });
  assert.equal(resolveValue('var(--nope)', tokens).unresolved, true);
  assert.equal(resolveValue('var(--nope, 4px)', tokens).literal, '4px');
});

test('declarationsToRN scales lengths, names the theme key for a colour, and collapses sides', () => {
  const { style } = declarationsToRN(
    { padding: 'var(--space-4)', 'background-color': 'var(--brand)', height: '44px' },
    { tokenTable: tokens }
  );
  assert.equal(style.padding.expr, 'scale(16)');
  assert.equal(style.padding.token, 'space4');
  assert.equal(style.backgroundColor.expr, 'Colors[theme]?.brand');
  assert.equal(style.height.expr, 'scale(44)');
  assert.equal(style.paddingTop, undefined, 'expanded sides collapse back to the shorthand');
});

test('declarationsToRN turns a unitless line-height into absolute px using the rule’s own font-size', () => {
  const { style } = declarationsToRN(
    { 'font-size': 'var(--font-size-16)', 'line-height': 'var(--line-height-normal)' },
    { tokenTable: tokens }
  );
  assert.equal(style.fontSize.expr, 'scale(16, true)');
  assert.equal(style.lineHeight.expr, 'scale(23, true)'); // 16 × 1.45, rounded
});

test('declarationsToRN reports an em letter-spacing it cannot resolve instead of emitting em', () => {
  const { style, unmapped } = declarationsToRN({ 'letter-spacing': '-0.011em' }, { tokenTable: tokens });
  assert.equal(style.letterSpacing, undefined);
  assert.equal(unmapped[0].prop, 'letter-spacing');
});

test('collapseShorthands folds two-axis padding, not three distinct sides', () => {
  const two = collapseShorthands({
    paddingTop: { expr: '0' }, paddingRight: { expr: 'scale(14)' },
    paddingBottom: { expr: '0' }, paddingLeft: { expr: 'scale(14)' }
  });
  assert.equal(two.paddingVertical.expr, '0');
  assert.equal(two.paddingHorizontal.expr, 'scale(14)');
  const three = collapseShorthands({
    paddingTop: { expr: '0' }, paddingRight: { expr: 'scale(14)' },
    paddingBottom: { expr: 'scale(8)' }, paddingLeft: { expr: 'scale(14)' }
  });
  assert.equal(three.paddingTop.expr, '0', 'no valid shorthand — sides stay expanded');
});

test('shadowToRN keeps the first layer and reports how many there were', () => {
  const s = shadowToRN('0 1px 2px rgba(16,24,40,.05), 0 8px 24px rgba(0,0,0,.2)', (n) => `scale(${n})`);
  assert.equal(s.layers, 2);
  assert.equal(s.style.shadowOpacity.expr, '0.05');
  assert.equal(s.style.shadowRadius.expr, 'scale(2)');
  assert.ok('elevation' in s.style, 'Android needs elevation or the shadow is invisible there');
});

test('gradientToRN maps the angle to LinearGradient start/end and keeps stop order', () => {
  const g = gradientToRN('linear-gradient(180deg,#1B4A2C 0%,#0E1F14 100%)');
  assert.deepEqual(g.colors, ['#1B4A2C', '#0E1F14']);
  assert.deepEqual(g.start, [0, 0]);
  assert.deepEqual(g.end, [0, 1]);
  assert.deepEqual(g.locations, [0, 1]);
});

test('typographyScale takes the RN name from the trailing comment, not the class name', () => {
  const css = '.typography-display-xl{font-size:var(--font-size-16);font-weight:700}   /* displayLg */\n';
  const scale = typographyScale(parseStylesheet(css), tokens);
  assert.equal(scale[0].rnName, 'displayLg');
  assert.equal(scale[0].style.fontSize.expr, 'scale(16, true)');
});

test('fontInventory reports a named-but-not-shipped family as referenced', () => {
  const rules = parseStylesheet('.a{font-family:var(--font-family-text);font-weight:600;font-size:16px}');
  const fonts = fontInventory('<html></html>', rules, tokens);
  const sf = fonts.find((f) => f.family === 'SF Pro Text');
  assert.equal(sf.source, 'referenced');
  assert.equal(sf.token, 'fontFamilyText');
  assert.ok(!fonts.some((f) => /sans-serif|-apple-system/.test(f.family)), 'system fallbacks are not typefaces to install');
});

/* ------------------------------------------------------------- nav-model */

test('buildScopeIndex survives a regex literal containing a quote', () => {
  // `.replace(/'/g,"")` reads as a string opener to a naive scanner, which then
  // swallows the rest of the file and misattributes every later scope.
  const src = `function a(name){ return name.replace(/'/g,""); }\nfunction b(){ target(); }`;
  const idx = buildScopeIndex(src);
  assert.equal(idx.at(src.indexOf('target(')), 'b');
});

test('parsePageMetaTable folds in later .x= and Object.assign extensions', () => {
  const src = [
    "var META={ job:{title:'Job',back:'joblist'}, joblist:{title:'Jobs'} };",
    "META.customers={title:'Customers',back:'more'};",
    "Object.assign(META,{ reports:{title:'Reports',back:'more'} });"
  ].join('\n');
  const t = parsePageMetaTable(src, ['job', 'joblist', 'customers', 'reports', 'more']);
  assert.equal(t.name, 'META');
  assert.equal(Object.keys(t.meta).length, 4);
  assert.equal(t.meta.reports.back, 'more');
  assert.equal(t.meta.customers.title, 'Customers');
});

test('parseFlows finds an indexed step array and ignores a nav-stack seed', () => {
  const src = [
    "function goStep(n){ var ids=['signin','plan','done']; showPage(ids[n]); }",
    "function openWO(){ hist=['joblist','job','wodetail']; showPage('wodetail'); }"
  ].join('\n');
  const flows = parseFlows(src, ['signin', 'plan', 'done', 'joblist', 'job', 'wodetail']);
  assert.equal(flows.length, 1);
  assert.deepEqual(flows[0].steps, ['signin', 'plan', 'done']);
  // The steps array's own variable name is a better module-name signal than
  // the enclosing function (`goStep` names a mechanism, not a concept).
  assert.equal(flows[0].varName, 'ids');
});

test('parseTabBar reads destinations from the nav markup, including a non-screen button', () => {
  const html = '<nav class="tabbar">' +
    '<button data-tab="home" onclick="go(\'home\')">Home</button>' +
    '<button onclick="openSheet(\'create\')">Create</button>' +
    '</nav>';
  const { tabs } = parseTabBar(html, ['home']);
  assert.equal(tabs[0].id, 'home');
  assert.equal(tabs[0].label, 'Home');
  assert.equal(tabs[1].id, '(openSheet:create)', 'a sheet trigger is not a destination');
});

test('buildNavModel prefers the route-meta parent and never nests a tab destination', () => {
  const behaviorSrc = [
    // Two entries minimum — one object keyed by one screen id is not enough
    // evidence that a variable is the route table.
    "var META={ home:{title:'Home'}, detail:{title:'Detail',back:'home'} };",
    "function openDetail(){ hist.push('detail'); showPage('detail'); }",
    "function openHome(){ hist.push('home'); }"
  ].join('\n');
  const indexHtml = '<nav class="tabbar"><button data-tab="home" onclick="go(\'home\')">Home</button></nav>';
  const nav = buildNavModel({
    screens: [{ id: 'p-home', renderFns: [] }, { id: 'p-detail', renderFns: [] }],
    behaviorSrc,
    indexHtml,
    screenHtml: new Map([['home', '<div onclick="openDetail()"></div>'], ['detail', '<div></div>']])
  });
  assert.equal(nav.perScreen.get('home').role, 'tab');
  assert.equal(nav.perScreen.get('detail').parent, 'home');
  assert.equal(nav.perScreen.get('detail').parentSource, 'route-meta');
  assert.deepEqual(nav.perScreen.get('home').children, ['detail']);
  assert.equal(nav.perScreen.get('detail').tab, 'home');
});

/* ------------------------------------------------------------ html-model */

const SHELL = `<html><head><title>T</title></head><body><div class="device"><div class="screen">
<div class="statusbar">9:41</div>
<header class="hdr"><button class="h-ic" onclick="back()">Back</button></header>
<div class="scroll" id="scroll">
  <section class="page" id="p-a"><div class="card">A</div></section>
  <section class="page" id="p-b"></section>
</div>
<nav class="tabbar"><button data-tab="a">A</button></nav>
<div class="toast" id="toast">Saved</div>
</div></div></body></html>`;

test('scanElements pairs open and close tags by tag name, not by the next close', () => {
  const els = scanElements('<div><div>x</div></div>');
  assert.equal(els.length, 2);
  assert.equal(els[0].end, 23);
  assert.equal(els[1].depth, 1);
});

test('extractChrome returns the shell regions only — not <head>, not a button inside one', () => {
  const ranges = [...SHELL.matchAll(/<section class="page" id="p-[ab]">/g)].map((m) => ({
    start: m.index,
    end: SHELL.indexOf('</section>', m.index) + 10
  }));
  const chrome = extractChrome(SHELL, ranges);
  const roles = chrome.map((c) => c.role);
  assert.deepEqual(roles, ['statusBar', 'header', 'tabBar', 'toast']);
  assert.ok(!chrome.some((c) => c.html.includes('<title>')), '<head> is metadata, not chrome');
  assert.ok(!chrome.some((c) => c.class === 'h-ic'), 'a button inside the header is part of it, not a region');
});

test('extractSections lists a screen’s own top-level regions', () => {
  const s = extractSections('<section class="page"><div class="hero">H</div><div class="list">L</div></section>');
  assert.deepEqual(s.map((x) => x.class), ['hero', 'list']);
});

test('extractInputs and extractActions capture what the port has to reproduce', () => {
  const html = '<input type="email" placeholder="Email"><button onclick="submit()">Go</button>';
  assert.equal(extractInputs(html)[0].placeholder, 'Email');
  const a = extractActions(html)[0];
  assert.equal(a.fn, 'submit');
  assert.equal(a.event, 'onclick');
});

/* ---------------------------------------------------------- dynamic regions */

test('scanInnerHTMLTargets finds every getElementById(...).innerHTML= id, screen or not', () => {
  const src = "function a(){ document.getElementById('tabBody').innerHTML='x'; }\n" +
    "function b(){ document.getElementById('p-home').innerHTML='y'; }";
  const targets = scanInnerHTMLTargets(src, buildScopeIndex(src));
  assert.deepEqual([...targets.get('tabBody')], ['a']);
  assert.deepEqual([...targets.get('p-home')], ['b']);
});

test('scanInnerHTMLTargets also finds a fill reached through a local variable, guard clause and all', () => {
  const src = "function renderJobNotes(){ var el=document.getElementById('jobNotes'); if(!el)return;\n" +
    " el.innerHTML='<div>notes</div>'; }";
  const targets = scanInnerHTMLTargets(src, buildScopeIndex(src));
  assert.deepEqual([...targets.get('jobNotes')], ['renderJobNotes']);
});

test('scanInnerHTMLTargets does not credit a fill to an unrelated function that happens to reuse the same local variable name', () => {
  const src = "function renderA(){ var el=document.getElementById('regionA'); if(!el)return; }\n" +
    "function renderB(){ var el=document.getElementById('regionB'); el.innerHTML='y'; }";
  const targets = scanInnerHTMLTargets(src, buildScopeIndex(src));
  assert.equal(targets.has('regionA'), false);
  assert.deepEqual([...targets.get('regionB')], ['renderB']);
});

test('scanInnerHTMLTargets follows a local-variable fill through an anonymous nested callback (still same enclosing named function)', () => {
  const src = "function renderList(){ var el=document.getElementById('list');\n" +
    " items.map(function(x){ return x; });\n" +
    " el.innerHTML=items.join(''); }";
  const targets = scanInnerHTMLTargets(src, buildScopeIndex(src));
  assert.deepEqual([...targets.get('list')], ['renderList']);
});

test('findRenderFns reads from the pre-built target map, direct and local-variable fills alike', () => {
  const src = "function renderHome(){ document.getElementById('p-home').innerHTML='x'; }\n" +
    "function renderJob(){ var el=document.getElementById('p-job'); if(!el)return; el.innerHTML='y'; }";
  const scope = buildScopeIndex(src);
  const targets = scanInnerHTMLTargets(src, scope);
  assert.deepEqual(findRenderFns('p-home', targets), ['renderHome']);
  assert.deepEqual(findRenderFns('p-job', targets), ['renderJob']);
  assert.deepEqual(findRenderFns('p-missing', targets), []);
});

test('findCallers finds functions that call fn(), excluding fn\'s own declaration', () => {
  const src = 'function render(){ paint(); }\nfunction paint(){ console.log(1); }\nfunction repaint(){ paint(); }';
  const scope = buildScopeIndex(src);
  assert.deepEqual(findCallers(src, 'paint', scope), ['render', 'repaint']);
});

test('screenContainer returns the shared container excluded from extractChrome\'s own list', () => {
  const ranges = [...SHELL.matchAll(/<section class="page" id="p-[ab]">/g)].map((m) => ({
    start: m.index,
    end: SHELL.indexOf('</section>', m.index) + 10
  }));
  const container = screenContainer(SHELL, ranges);
  assert.equal(container.id, 'scroll');
  assert.match(container.html, /id="p-a"/);
});

test('findDynamicRegions resolves a screen-owned and a chrome-owned target positionally', () => {
  const behaviorSrc = [
    "function renderTab(){ document.getElementById('tabBody').innerHTML='x'; }",
    "function openTab(){ renderTab(); }",
    "function setTitle(){ document.getElementById('hdrTitle').innerHTML='y'; }"
  ].join('\n');
  const scopeIndex = buildScopeIndex(behaviorSrc);
  const regions = findDynamicRegions({
    behaviorSrc,
    scopeIndex,
    screenIds: ['p-a'],
    screenDocs: [{ key: 'p-a', file: 'screens/00-A.html', html: '<section id="p-a"><div id="tabBody"></div></section>' }],
    chromeDocs: [{ key: 'header', file: 'chrome/header.html', html: '<header><span id="hdrTitle"></span></header>' }],
    containerDoc: null
  });
  const tabBody = regions.find((r) => r.id === 'tabBody');
  assert.equal(tabBody.ownerKind, 'screen');
  assert.equal(tabBody.owner.id, 'p-a');
  assert.deepEqual(tabBody.calledBy, ['openTab']);
  const hdrTitle = regions.find((r) => r.id === 'hdrTitle');
  assert.equal(hdrTitle.ownerKind, 'chrome');
  assert.equal(hdrTitle.owner.name, 'header');
});

test('findDynamicRegions reports unresolved when no markup anywhere carries the id, and ambiguous when it repeats', () => {
  const behaviorSrc = [
    "function renderGhost(){ document.getElementById('ghost').innerHTML='x'; }",
    "function renderShared(){ document.getElementById('shared').innerHTML='y'; }"
  ].join('\n');
  const scopeIndex = buildScopeIndex(behaviorSrc);
  const regions = findDynamicRegions({
    behaviorSrc,
    scopeIndex,
    screenIds: ['p-a', 'p-b'],
    screenDocs: [
      { key: 'p-a', file: 'a.html', html: '<section id="p-a"><div id="shared"></div></section>' },
      { key: 'p-b', file: 'b.html', html: '<section id="p-b"><div id="shared"></div></section>' }
    ],
    chromeDocs: [],
    containerDoc: null
  });
  assert.equal(regions.find((r) => r.id === 'ghost').ownerKind, 'unresolved');
  const shared = regions.find((r) => r.id === 'shared');
  assert.equal(shared.ownerKind, 'ambiguous');
  assert.equal(shared.ownerCandidates.length, 2);
});

/* --------------------------------------------------------------- modules */

test('inferModules groups a tab\'s full pushed subtree and a flow\'s ordered steps', () => {
  const behaviorSrc = [
    "var META={ home:{title:'Home'}, jobs:{title:'Jobs'}, job:{title:'Job',back:'jobs'} };",
    "var steps=['signin','setpw','done'];",
    "function goStep(n){ showPage(steps[n]); }"
  ].join('\n');
  const indexHtml = '<nav class="tabbar">' +
    '<button data-tab="home">Home</button><button data-tab="jobs">Jobs</button></nav>';
  const nav = buildNavModel({
    screens: [
      { id: 'p-home', renderFns: [] }, { id: 'p-jobs', renderFns: [] }, { id: 'p-job', renderFns: [] },
      { id: 'p-signin', renderFns: [] }, { id: 'p-setpw', renderFns: [] }, { id: 'p-done', renderFns: [] },
      { id: 'p-orphan', renderFns: [] }
    ],
    behaviorSrc,
    indexHtml,
    screenHtml: new Map()
  });
  const { modules, unassigned } = inferModules(nav);

  const jobsModule = modules.find((m) => m.id === 'jobs');
  assert.deepEqual(jobsModule.screens.sort(), ['job', 'jobs'].sort());
  assert.equal(jobsModule.nameConfirmed, true);
  assert.equal(jobsModule.nameSource, 'tab-title');

  const flow = modules.find((m) => m.kind === 'flow');
  assert.deepEqual(flow.screens, ['signin', 'setpw', 'done']);
  // A flow's enclosing function/array names a mechanism, not a business
  // concept — never auto-confirmed, same "ask, don't guess" rule as an
  // ambiguous screen parent.
  assert.equal(flow.nameConfirmed, false);

  assert.deepEqual(unassigned, ['orphan']);
});

test('inferModules flags a tab-id fallback (no route-meta title, no tab-bar label text) as unconfirmed', () => {
  // A bare data-tab button with no inner text and no route-meta table: the
  // only name left is the raw id itself, which must never read as confirmed.
  const indexHtml = '<nav class="tabbar"><button data-tab="home"></button></nav>';
  const nav = buildNavModel({
    screens: [{ id: 'p-home', renderFns: [] }],
    behaviorSrc: '',
    indexHtml,
    screenHtml: new Map()
  });
  const { modules } = inferModules(nav);
  const home = modules.find((m) => m.id === 'home');
  assert.equal(home.nameSource, 'tab-id');
  assert.equal(home.name, 'home');
  assert.equal(home.nameConfirmed, false);
});
