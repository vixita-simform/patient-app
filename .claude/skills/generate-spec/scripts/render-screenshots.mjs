#!/usr/bin/env node
/**
 * Renders a reference PNG per design screen with headless Chrome and records
 * it as `screenshot` in apps/mobile/design/.extracted/inventory.json.
 *
 * The spec agent opens the screenshot before any markup (its Gate 0), so a
 * screen without one gets a weaker spec. The extractor produces no
 * screenshots, and a changed screen loses its `screenshot` field on
 * re-extraction. This script fills both gaps.
 *
 * Each screen is shown alone: the target `#<id>` is pinned at 0,0, everything
 * else is hidden, and the shot is 375×812 at 2× (750×1624).
 * It renders from the patched source (which has the ids) and puts back the
 * original's external <link> tags so the web fonts still load when online.
 *
 * Usage:
 *   node render-screenshots.mjs [--missing]       screens with no screenshot (default)
 *   node render-screenshots.mjs --ids a,b,c       these screens only
 *   node render-screenshots.mjs --all             every screen
 *   [--chrome <path>] [--extract apps/mobile/design/.extracted]
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};
const has = (flag) => process.argv.includes(flag);

const extractDir = arg('--extract', 'apps/mobile/design/.extracted');
const config = {
  ...JSON.parse(readFileSync('.claude/html-design-to-rn/config.json', 'utf8')).source,
  ...(existsSync('.claude/html-design-to-rn/config.local.json')
    ? JSON.parse(readFileSync('.claude/html-design-to-rn/config.local.json', 'utf8')).source
    : {})
};
const { width, height } = JSON.parse(readFileSync('.claude/html-design-to-rn/config.json', 'utf8')).verify?.viewport ?? {
  width: 375,
  height: 812
};

const CHROME_CANDIDATES = [
  arg('--chrome'),
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);
const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error('render-screenshots: no Chrome found — pass --chrome <path> or set CHROME_PATH');
  process.exit(2);
}
if (!config.designFile || !existsSync(config.designFile)) {
  console.error(`render-screenshots: design source not found (${config.designFile}) — run prepare-source.mjs first`);
  process.exit(2);
}

const inventoryPath = join(extractDir, 'inventory.json');
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));

let targets;
if (has('--all')) targets = inventory.screens;
else if (arg('--ids')) {
  const ids = new Set(arg('--ids').split(',').map((s) => s.trim()).filter(Boolean));
  targets = inventory.screens.filter((s) => ids.has(s.id));
  const unknown = [...ids].filter((id) => !targets.some((s) => s.id === id));
  if (unknown.length) console.error(`render-screenshots: not in inventory: ${unknown.join(', ')}`);
} else {
  targets = inventory.screens.filter((s) => !s.screenshot || !existsSync(join(extractDir, s.screenshot)));
}

if (!targets.length) {
  console.log('render-screenshots: nothing to render');
  process.exit(0);
}

const source = readFileSync(config.designFile, 'utf8');
const originalLinks =
  config.originalDesignFile && existsSync(config.originalDesignFile)
    ? (readFileSync(config.originalDesignFile, 'utf8').match(/<link\b[^>]*\bhref\s*=\s*["']https?:\/\/[^>]*>/gi) ?? [])
    : [];

/** PNG IHDR width/height, or null if the file is not a PNG. */
function pngSize(file) {
  const buf = readFileSync(file);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const tmpDir = resolve(extractDir, '.build/.render-tmp');
mkdirSync(tmpDir, { recursive: true });
mkdirSync(join(extractDir, 'screenshots'), { recursive: true });

const rendered = [];
const failed = [];
for (const screen of targets) {
  const isolate =
    `<style>html{background:#fff!important}body{visibility:hidden!important}` +
    `#${screen.id}{visibility:visible!important;position:fixed!important;top:0!important;left:0!important;` +
    `margin:0!important;z-index:2147483647!important}</style>`;
  const page = source.replace(/<\/head>/i, `${originalLinks.join('\n')}\n${isolate}\n</head>`);
  const pagePath = join(tmpDir, `${screen.id}.html`);
  writeFileSync(pagePath, page);

  const rel = `screenshots/${screen.id}.png`;
  const out = resolve(extractDir, rel);
  try {
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        `--window-size=${width},${height}`,
        '--force-device-scale-factor=2',
        '--virtual-time-budget=4000',
        `--screenshot=${out}`,
        `file://${pagePath}`
      ],
      { stdio: 'pipe', timeout: 60000 }
    );
    const size = existsSync(out) ? pngSize(out) : null;
    if (!size) throw new Error('no PNG written');
    screen.screenshot = rel;
    rendered.push(`${screen.id} (${size.w}×${size.h})`);
  } catch (err) {
    failed.push(`${screen.id}: ${String(err.message).split('\n')[0]}`);
  }
}
rmSync(tmpDir, { recursive: true, force: true });

writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
console.log(`rendered ${rendered.length}: ${rendered.join(', ') || '—'}`);
if (failed.length) {
  console.log(`FAILED ${failed.length} (these specs will have no screenshot):`);
  for (const f of failed) console.log(`  ${f}`);
  process.exit(3);
}
