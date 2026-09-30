#!/usr/bin/env node
/**
 * plan-batches.js — lists changed files (diff only) and groups them into review batches.
 *
 * Usage:
 *   node .claude/skills/code-review/scripts/plan-batches.js [--base <ref>] [--working]
 *                                                          [--max-files 12] [--max-lines 800]
 *
 *   --base <ref>   Branch/commit to compare against. Default: upstream of current branch,
 *                  then origin/main, origin/master, origin/develop, main, master, develop.
 *   --working      Also include staged, unstaged and untracked changes (not only commits).
 *   --all          Full-project mode for a NEW project (no base branch / first push): review every
 *                  source file, all lines count as new. Works without commits, or even without git.
 *
 * Output: JSON on stdout. No dependencies, read-only (never modifies the repo).
 */
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const flag = (name) => args.includes(name);

const MAX_FILES = parseInt(opt('--max-files', '12'), 10);
const MAX_LINES = parseInt(opt('--max-lines', '800'), 10);
const WORKING = flag('--working');
const ALL = flag('--all');

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const tryGit = (cmd) => { try { return git(cmd); } catch { return null; } };

function resolveBase() {
  const explicit = opt('--base', null);
  if (explicit) {
    if (tryGit(`rev-parse --verify ${explicit}`)) return explicit;
    fail(`Base ref "${explicit}" not found.`);
  }
  const candidates = [
    tryGit('rev-parse --abbrev-ref --symbolic-full-name @{upstream}'),
    'origin/main', 'origin/master', 'origin/develop', 'main', 'master', 'develop',
  ].filter(Boolean);
  const current = tryGit('rev-parse --abbrev-ref HEAD');
  for (const c of candidates) {
    if (c === current) continue; // don't compare a branch with itself
    if (tryGit(`rev-parse --verify ${c}`)) return c;
  }
  fail('Could not find a base branch. For a new project or first push use --all; otherwise pass --base <ref>.');
}

function fail(msg) {
  process.stdout.write(JSON.stringify({ error: msg }, null, 2) + '\n');
  process.exit(1);
}

// ---- Which files are reviewable -------------------------------------------------------
const REVIEW_EXT = /\.(tsx?|jsx?)$/;
const SKIP = [
  /(^|\/)node_modules\//, /(^|\/)ios\/Pods\//, /(^|\/)android\/(app\/)?build\//,
  /(^|\/)(dist|build|coverage)\//, /\.snap$/, /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Podfile\.lock)$/,
  /\.(png|jpe?g|gif|webp|svg|ttf|otf|mp4|mp3|lottie)$/i, /\.d\.ts$/,
];
const isLocaleJson = (p) => /\.json$/.test(p) && /(^|\/)(locales?|i18n|translations?)\/|(^|\/)en\.json$/.test(p);
const reviewable = (p) => !SKIP.some((r) => r.test(p)) && (REVIEW_EXT.test(p) || isLocaleJson(p));

// ---- Group key: keeps Screen + Styles + Types + hook of one feature together ---------
function groupKey(p) {
  let m;
  if ((m = p.match(/^app\/modules\/([^/]+)\//))) return `modules/${m[1]}`;
  if ((m = p.match(/^app\/components\/([^/]+)\//))) return `components/${m[1]}`;
  if (/^app\/(redux|configs|constants|types)\//.test(p)) return 'core/redux-api-constants';
  if (/^app\/navigation\//.test(p) || /Navigat/.test(p)) return 'core/navigation';
  if ((m = p.match(/^app\/([^/]+)\//))) return `app/${m[1]}`;
  if (/^jest\//.test(p)) return 'tests';
  const parts = p.split('/');
  return parts.length > 1 ? parts[0] : 'root';
}

const fs = require('fs');
const lineCount = (p) => { try { return fs.readFileSync(p, 'utf8').split('\n').length; } catch { return 0; } };
const files = new Map(); // path -> {path, added, deleted, status}
let base = null, mergeBase = null, range = null;

if (ALL) {
  // ---- Full-project mode: every source file, whole file is "new" ----------------------
  // Root-level tool configs (babel/metro/jest/.eslintrc…) are checked by foundation-check.js instead.
  const ROOT_CONFIG = /^(\.[^/]+|[^/]+\.config\.(js|ts|cjs|mjs))$/;
  let list = null;
  if (tryGit('rev-parse --is-inside-work-tree') === 'true') {
    list = ((tryGit('ls-files') || '') + '\n' + (tryGit('ls-files --others --exclude-standard') || '')).split('\n');
  } else {
    list = [];
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = d === '.' ? e.name : `${d}/${e.name}`;
        if (e.isDirectory()) { if (!/^(\.git|node_modules|Pods|build|dist|coverage|\.gradle|\.claude)$/.test(e.name)) walk(p); }
        else list.push(p);
      }
    };
    walk('.');
  }
  for (const path of [...new Set(list.filter(Boolean))]) {
    if (ROOT_CONFIG.test(path) || path.startsWith('.claude/') || !fs.existsSync(path)) continue;
    files.set(path, { path, added: lineCount(path), deleted: 0, status: 'untracked' });
  }
} else {
// ---- Collect diff ---------------------------------------------------------------------
base = resolveBase();
mergeBase = tryGit(`merge-base ${base} HEAD`) || fail(`No common ancestor between ${base} and HEAD. For a new project use --all.`);
range = WORKING ? mergeBase : `${mergeBase} HEAD`;
const numstat = tryGit(`diff --numstat -M --diff-filter=ACMR ${range}`) || '';
for (const line of numstat.split('\n').filter(Boolean)) {
  const [a, d, ...rest] = line.split('\t');
  let path = rest.join('\t');
  if (path.includes(' => ')) { // rename: "dir/{old => new}.ts" or "old => new"
    path = path.replace(/\{[^}]* => ([^}]*)\}/, '$1').replace(/^.* => /, '').replace(/\/\//g, '/');
  }
  files.set(path, { path, added: a === '-' ? 0 : +a, deleted: d === '-' ? 0 : +d, status: 'modified' });
}
const nameStatus = tryGit(`diff --name-status -M --diff-filter=ACMR ${range}`) || '';
for (const line of nameStatus.split('\n').filter(Boolean)) {
  const parts = line.split('\t');
  const st = parts[0][0];
  const path = parts[parts.length - 1];
  if (files.has(path)) files.get(path).status = st === 'A' ? 'added' : st === 'R' ? 'renamed' : 'modified';
}
if (WORKING) {
  const untracked = tryGit('ls-files --others --exclude-standard') || '';
  for (const path of untracked.split('\n').filter(Boolean)) {
    if (files.has(path)) continue;
    files.set(path, { path, added: lineCount(path), deleted: 0, status: 'untracked' });
  }
}
} // end diff mode

const all = [...files.values()];
const review = all.filter((f) => reviewable(f.path)).sort((x, y) => x.path.localeCompare(y.path));
const skipped = all.filter((f) => !reviewable(f.path)).map((f) => f.path);

// ---- Pack groups into batches (locality first, then size limits) ----------------------
const groups = new Map();
for (const f of review) {
  const k = groupKey(f.path);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(f);
}
const size = (f) => f.added + f.deleted;
const batches = [];
let cur = null;
const newBatch = () => { cur = { id: batches.length + 1, groups: [], files: [], changedLines: 0 }; batches.push(cur); };

for (const [key, gFiles] of groups) {
  const gLines = gFiles.reduce((s, f) => s + size(f), 0);
  const fits = cur && cur.files.length + gFiles.length <= MAX_FILES && cur.changedLines + gLines <= MAX_LINES;
  if (!fits && gFiles.length <= MAX_FILES && gLines <= MAX_LINES) newBatch();
  for (const f of gFiles) { // oversized groups are split across consecutive batches
    if (!cur || cur.files.length >= MAX_FILES || (cur.changedLines + size(f) > MAX_LINES && cur.files.length > 0)) newBatch();
    if (!cur.groups.includes(key)) cur.groups.push(key);
    cur.files.push(f.path);
    cur.changedLines += size(f);
  }
}

const totalLines = review.reduce((s, f) => s + size(f), 0);
process.stdout.write(JSON.stringify({
  startedAt: new Date().toISOString(), // pass to usage-report.js --since
  base,
  mergeBase,
  reviewMode: ALL ? 'full-project' : 'diff',
  diffCommand: ALL ? null : WORKING ? `git diff -U5 ${mergeBase} -- <files>` : `git diff -U5 ${mergeBase} HEAD -- <files>`,
  includesUncommitted: WORKING,
  untrackedFiles: review.filter((f) => f.status === 'untracked').map((f) => f.path),
  totals: { reviewFiles: review.length, changedLines: totalLines, batches: batches.length, skippedFiles: skipped.length },
  // In full-project mode every file is listed in untrackedFiles: reviewers read whole files.
  mode: batches.length <= 1 ? 'single' : 'parallel',
  batches,
  skipped,
}, null, 2) + '\n');
