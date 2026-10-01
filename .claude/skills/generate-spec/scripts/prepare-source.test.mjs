import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareSource, slugFromLabel } from './prepare-source.mjs';

const frame = (label, attrs = '') =>
  `<div class="frame">\n  <div class="frame-label"><span>1</span>${label}</div>\n  <div class="phone"${attrs}>x</div>\n</div>\n`;

test('slugFromLabel drops the number span and decodes &amp;', () => {
  assert.equal(slugFromLabel('<span>9</span>Billing &amp; payments'), 'billing-and-payments');
  assert.equal(slugFromLabel('<span>7</span>Lab report detail'), 'lab-report-detail');
  assert.equal(slugFromLabel("<span>2</span>Doctor's profile!"), 'doctor-s-profile');
});

test('removes external <link> tags but keeps local ones', () => {
  const html =
    '<head>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Figtree" rel="stylesheet">\n' +
    '<link rel="icon" href="icon.png">\n</head>\n' + frame('Home');
  const { html: out, removedLinks } = prepareSource(html);
  assert.equal(removedLinks.length, 2);
  assert.doesNotMatch(out, /googleapis/);
  assert.match(out, /icon\.png/);
});

test('adds an id slugged from the preceding label, and keeps an existing id', () => {
  const { html, screens } = prepareSource(frame('Home dashboard') + frame('Find a doctor', ' id="custom"'));
  assert.match(html, /<div class="phone" id="home-dashboard">/);
  assert.match(html, /<div class="phone" id="custom">/);
  assert.deepEqual(
    screens.map((s) => [s.id, s.idSource]),
    [['home-dashboard', 'label'], ['custom', 'existing']]
  );
});

test('ignores the escaped &lt;div class="phone"&gt; in prose', () => {
  const { screens } = prepareSource('<p>each is a &lt;div class="phone"&gt; block</p>\n' + frame('Home'));
  assert.equal(screens.length, 1);
});

test('fails on a duplicate id', () => {
  assert.throws(() => prepareSource(frame('Medicines') + frame('Medicines')), /duplicate screen id "medicines"/);
});

test('fails on a phone with no id and no label', () => {
  assert.throws(() => prepareSource('<div class="phone">x</div>'), /no \.frame-label/);
});

test('is idempotent on an already-patched file', () => {
  const once = prepareSource(frame('Home dashboard')).html;
  assert.equal(prepareSource(once).html, once);
});
