#!/usr/bin/env node
/**
 * Decides which screen specs need (re)generating after an extraction.
 *
 * A spec is a pure function of three extracted files: the markup, the facts and
 * the compiled RN styles. The manifest (.build/spec-manifest.json) stores a
 * sha256 of each one at the moment the spec was written, so "changed" means
 * the content changed. It cannot use mtime because the extractor rewrites every
 * screen's files whenever app.css or app.js changes, even when most of them
 * come out byte-identical.
 *
 * The screenshot is NOT a change trigger. It is derived from the same markup and
 * CSS, and a re-render can differ by a few bytes (fonts online vs offline)
 * without the design changing. It is only checked for presence.
 *
 * Usage:
 *   node spec-plan.mjs [--only id,...] [--force]   print the plan as JSON
 *   node spec-plan.mjs --record id,...             hash inputs after a spec run
 *   node spec-plan.mjs --archive-removed           move specs of removed screens to .build/_removed/
 *   [--extract design/.extracted]
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SPEC_CAP = 250;
const INPUT_KEYS = ['file', 'factsFile', 'styleFile'];
const SPEC_FIELDS = [
  'id', 'name', 'file', 'factsFile', 'styleFile', 'screenshot', 'role', 'parent', 'tab', 'flow',
  'title', 'subtitle', 'dynamic', 'staticMarkup', 'renderStatus', 'renderFns'
];
// What the project inventory describes. A new entry here (not an edit inside an
// existing component) is what makes the cached inventory wrong.
const INVENTORY_WATCH = {
  componentDirs: ['src/components', 'src/screens'],
  trees: ['src/app', 'src/theme', 'src/assets/icons'],
  files: ['src/constants/Routes.ts', 'src/constants/Constants.ts', 'src/constants/Strings.ts']
};

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};
const has = (flag) => process.argv.includes(flag);
const list = (flag) => (arg(flag) ? arg(flag).split(',').map((s) => s.trim()).filter(Boolean) : null);

const extractDir = arg('--extract', 'design/.extracted');
const buildDir = join(extractDir, '.build');
const manifestPath = join(buildDir, 'spec-manifest.json');
const inventoryMd = join(buildDir, 'project-inventory.md');

const inventory = JSON.parse(readFileSync(join(extractDir, 'inventory.json'), 'utf8'));
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const saveManifest = () => {
  mkdirSync(buildDir, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
};

const sha = (rel) => {
  if (!rel) return null;
  const p = join(extractDir, rel);
  return existsSync(p) ? createHash('sha256').update(readFileSync(p)).digest('hex') : null;
};
const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : 0);
const specPathOf = (screen) => join(buildDir, `${screen.name}.spec.md`);
const lineCount = (p) => readFileSync(p, 'utf8').split('\n').length - 1;
const hashesOf = (screen) => Object.fromEntries([...INPUT_KEYS, 'screenshot'].map((k) => [k, sha(screen[k])]));
const isBlocked = (s) => Boolean(s.dynamic) && s.renderStatus !== 'rendered' && s.staticMarkup !== 'authoritative';
const hasScreenshot = (s) => Boolean(s.screenshot) && existsSync(join(extractDir, s.screenshot));

function newestUnder(dir) {
  if (!existsSync(dir)) return 0;
  let newest = statSync(dir).mtimeMs;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    newest = Math.max(newest, entry.isDirectory() ? newestUnder(p) : statSync(p).mtimeMs);
  }
  return newest;
}

function inventoryStaleness() {
  if (!existsSync(inventoryMd)) return 'missing';
  const since = mtime(inventoryMd);
  for (const dir of INVENTORY_WATCH.componentDirs) {
    if (!existsSync(dir)) continue;
    const added = readdirSync(dir, { withFileTypes: true }).find((e) => e.isDirectory() && mtime(join(dir, e.name)) > since);
    if (added) return `new or renamed folder: ${join(dir, added.name)}`;
  }
  for (const dir of INVENTORY_WATCH.trees) if (newestUnder(dir) > since) return `changed: ${dir}`;
  for (const f of INVENTORY_WATCH.files) if (mtime(f) > since) return `changed: ${f}`;
  return null;
}

function removedScreens() {
  const ids = new Set(inventory.screens.map((s) => s.id));
  const names = new Set(inventory.screens.map((s) => s.name));
  const out = new Map();
  for (const [id, entry] of Object.entries(manifest)) if (!ids.has(id)) out.set(entry.spec, { id, spec: entry.spec });
  if (existsSync(buildDir)) {
    for (const f of readdirSync(buildDir)) {
      const m = f.match(/^(.+)\.spec\.md$/);
      if (m && !names.has(m[1])) {
        const spec = join(buildDir, f);
        if (!out.has(spec)) out.set(spec, { id: null, spec });
      }
    }
  }
  return [...out.values()].filter((r) => existsSync(r.spec));
}

/* ---------------------------------------------------------------- --record */
if (arg('--record')) {
  const ids = list('--record');
  const rows = [];
  for (const id of ids) {
    const screen = inventory.screens.find((s) => s.id === id);
    if (!screen) {
      rows.push(`${id}: not in inventory — not recorded`);
      continue;
    }
    const spec = specPathOf(screen);
    if (!existsSync(spec)) {
      rows.push(`${id}: no spec at ${spec} — not recorded (the agent did not write it)`);
      continue;
    }
    const lines = lineCount(spec);
    manifest[id] = { spec, sha256: hashesOf(screen), lines, generatedAt: new Date().toISOString() };
    rows.push(`${id}: recorded ${spec} (${lines} lines${lines > SPEC_CAP ? `, OVER CAP ${SPEC_CAP}` : ''})`);
  }
  saveManifest();
  console.log(rows.join('\n'));
  process.exit(0);
}

/* ------------------------------------------------------- --archive-removed */
if (has('--archive-removed')) {
  const removed = removedScreens();
  const dest = join(buildDir, '_removed');
  mkdirSync(dest, { recursive: true });
  for (const r of removed) {
    const target = join(dest, r.spec.split('/').pop());
    renameSync(r.spec, target);
    if (r.id) delete manifest[r.id];
    console.log(`archived ${r.spec} → ${target}`);
  }
  for (const [id, entry] of Object.entries(manifest)) if (!existsSync(entry.spec)) delete manifest[id];
  saveManifest();
  if (!removed.length) console.log('nothing to archive');
  process.exit(0);
}

/* -------------------------------------------------------------------- plan */
const only = list('--only');
const force = has('--force');
if (only) {
  const unknown = only.filter((id) => !inventory.screens.some((s) => s.id === id));
  if (unknown.length) {
    console.error(`spec-plan: not in inventory: ${unknown.join(', ')}`);
    process.exit(1);
  }
}

const plan = { new: [], changed: [], unchanged: [], skipped: [], removed: [], seeded: [], notes: [] };
let seeded = false;

for (const screen of inventory.screens) {
  const spec = specPathOf(screen);
  const fields = Object.fromEntries(SPEC_FIELDS.map((k) => [k, screen[k] ?? null]));
  const entry = { ...fields, outPath: spec };
  const flags = [];
  if (isBlocked(screen)) flags.push('blocked: dynamic screen not rendered — the agent will write a Gate 0 BLOCKED spec');
  if (!hasScreenshot(screen)) flags.push('no screenshot');
  if (flags.length) entry.flags = flags;

  if (only && !only.includes(screen.id)) {
    plan.skipped.push(screen.id);
    continue;
  }

  const current = hashesOf(screen);
  let status;
  let reason;
  if (!existsSync(spec)) {
    status = 'new';
    reason = 'no spec yet';
  } else if (manifest[screen.id]) {
    const prev = manifest[screen.id].sha256 ?? {};
    const diff = INPUT_KEYS.filter((k) => prev[k] !== current[k]);
    status = diff.length ? 'changed' : 'unchanged';
    reason = diff.length ? `changed: ${diff.join(', ')}` : null;
  } else {
    // Spec written before the manifest existed: decide once by mtime, then seed.
    const specTime = mtime(spec);
    const newer = INPUT_KEYS.filter((k) => screen[k] && mtime(join(extractDir, screen[k])) > specTime);
    status = newer.length ? 'changed' : 'unchanged';
    reason = newer.length ? `newer than spec (pre-manifest): ${newer.join(', ')}` : null;
    if (!newer.length) {
      manifest[screen.id] = { spec, sha256: current, lines: lineCount(spec), generatedAt: new Date(specTime).toISOString(), seeded: true };
      plan.seeded.push(screen.id);
      seeded = true;
      const header = readFileSync(spec, 'utf8').split('\n').slice(0, 3).join('\n');
      if (!/\.png/i.test(header) && hasScreenshot(screen)) {
        plan.notes.push(`${screen.id}: spec was written without a screenshot; one exists now — regenerate with --only ${screen.id} --force if fidelity matters`);
      }
    }
  }
  if (force && status === 'unchanged') {
    status = 'changed';
    reason = 'forced';
  }

  if (status === 'unchanged') plan.unchanged.push(screen.id);
  else plan[status].push({ ...entry, reason });
}

plan.removed = removedScreens();
const stale = inventoryStaleness();
plan.inventoryStale = Boolean(stale);
if (stale) plan.inventoryStaleReason = stale;
plan.toGenerate = plan.new.length + plan.changed.length;
if (seeded) saveManifest();

console.log(JSON.stringify(plan, null, 1));
