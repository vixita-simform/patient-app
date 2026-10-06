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
 *   --out <dir>    Run folder for plan.json and the per-batch result files.
 *                  Default: .claude/reviews/.runs/<timestamp>/
 *   --resume       Don't plan again: print the summary of the newest unfinished run, with the
 *                  batches that have no batch-<id>.txt result yet.
 *
 * Output: the full plan goes to <runDir>/plan.json; stdout gets a compact JSON summary so a
 * 200-file plan stays out of the review context. No dependencies; only writes inside the run folder.
 */
const { execSync } = require('child_process');
const fs = require('fs');

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
const RUNS_DIR = '.claude/reviews/.runs';

// ---- Summary printed to stdout (plan.json holds the full file lists) -------------------
const pendingOf = (runDir, plan) => plan.batches.map((b) => b.id).filter((id) => !fs.existsSync(`${runDir}/batch-${id}.txt`));
function summary(runDir, plan) {
  return {
    runDir,
    startedAt: plan.startedAt, // pass to usage-report.js --since
    reviewMode: plan.reviewMode,
    base: plan.base,
    includesUncommitted: plan.includesUncommitted,
    size: plan.size,
    workspaces: plan.workspaces,
    totals: plan.totals,
    batches: plan.batches.map((b) => `${b.id} | ${b.workspace} | ${b.files.length} files | ${b.changedLines} lines | ${b.groups.join(', ')}`),
    pendingBatches: pendingOf(runDir, plan),
  };
}

if (flag('--resume')) {
  const runs = fs.existsSync(RUNS_DIR) ? fs.readdirSync(RUNS_DIR).sort().reverse() : [];
  for (const r of runs) {
    const runDir = `${RUNS_DIR}/${r}`;
    let plan;
    try { plan = JSON.parse(fs.readFileSync(`${runDir}/plan.json`, 'utf8')); } catch { continue; }
    if (fs.existsSync(`${runDir}/report.md`)) continue; // finished run
    process.stdout.write(JSON.stringify(summary(runDir, plan), null, 2) + '\n');
    process.exit(0);
  }
  fail('No unfinished review run found. Start a new review.');
}

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

// ---- Workspace: decides which rule files a batch's reviewer reads ---------------------
const RULES_DIR = '.claude/skills/code-review/references';
const RULES = {
  mobile: [`${RULES_DIR}/common.md`, `${RULES_DIR}/mobile.md`, 'apps/mobile/CLAUDE.md'],
  backend: [`${RULES_DIR}/common.md`, `${RULES_DIR}/backend.md`],
  shared: [`${RULES_DIR}/common.md`],
  root: [`${RULES_DIR}/common.md`],
};
function workspaceOf(path) {
  if (path.startsWith('apps/mobile/')) return 'mobile';
  if (path.startsWith('apps/backend/')) return 'backend';
  if (path.startsWith('packages/')) return 'shared';
  return 'root';
}

// ---- Group key: keeps Screen + Styles + Types + hook of one feature together ---------
function groupKey(path) {
  const prefix = path.match(/^(apps|packages)\/[^/]+\//)?.[0] ?? '';
  return prefix + groupKeyInWorkspace(path.slice(prefix.length));
}

function groupKeyInWorkspace(p) {
  let m;
  if ((m = p.match(/^src\/screens\/([^/]+)\//))) return `screens/${m[1]}`;
  if ((m = p.match(/^jest\/__tests__\/screens\/([^/]+)\//))) return `screens/${m[1]}`;
  if ((m = p.match(/^src\/components\/([^/]+)\//))) return `components/${m[1]}`;
  if ((m = p.match(/^src\/app\/api\/([^/]+)\//))) return `api/${m[1]}`;
  if ((m = p.match(/^src\/(services|repositories)\/([^/]+)\//))) return `api/${m[2]}`;
  if (/^src\/(app|navigation)\//.test(p)) return 'routing';
  if (/^src\/(constants|types|theme)\//.test(p)) return 'core';
  if ((m = p.match(/^src\/([^/]+)\//))) return m[1];
  if (/^jest\//.test(p)) return 'tests';
  const parts = p.split('/');
  return parts.length > 1 ? parts[0] : 'root';
}

const lineCount = (p) => { try { return fs.readFileSync(p, 'utf8').split('\n').length; } catch { return 0; } };
const files = new Map(); // path -> {path, added, deleted, status}
let base = null, mergeBase = null, range = null;

if (ALL) {
  // ---- Full-project mode: every source file, whole file is "new" ----------------------
  // Root-level tool configs (babel/metro/jest/.eslintrc…) are checked by foundation-check.js instead.
  const ROOT_CONFIG = /^((apps|packages)\/[^/]+\/)?(\.[^/]+|[^/]+\.config\.(js|ts|cjs|mjs))$/;
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
  if (!files.has(path)) continue;
  files.get(path).status = st === 'A' ? 'added' : st === 'R' ? 'renamed' : 'modified';
  if (st === 'R') files.get(path).oldPath = parts[1]; // keeps the diff a rename, not a whole new file
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
// Pure moves (renamed, 0 lines changed) have nothing to review; they are only counted.
const moveOnly = (f) => f.status === 'renamed' && f.added + f.deleted === 0;
const renamedOnly = all.filter((f) => reviewable(f.path) && moveOnly(f)).map((f) => f.path);
const review = all.filter((f) => reviewable(f.path) && !moveOnly(f)).sort((x, y) => x.path.localeCompare(y.path));
const skipped = all.filter((f) => !reviewable(f.path)).map((f) => f.path);

// ---- Pack groups into batches (locality first, then size limits) ----------------------
const groups = new Map();
for (const f of review) {
  const k = groupKey(f.path);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(f);
}
// A batch never mixes workspaces, so each reviewer reads exactly one set of rules.
const orderedGroups = [...groups].sort(([a, af], [b, bf]) =>
  workspaceOf(af[0].path).localeCompare(workspaceOf(bf[0].path)) || a.localeCompare(b));
const size = (f) => f.added + f.deleted;
const batches = [];
let cur = null;
const newBatch = (workspace) => {
  cur = { id: batches.length + 1, workspace, rules: RULES[workspace], groups: [], files: [], changedLines: 0 };
  batches.push(cur);
};

for (const [key, gFiles] of orderedGroups) {
  const ws = workspaceOf(gFiles[0].path);
  const gLines = gFiles.reduce((s, f) => s + size(f), 0);
  const fits = cur && cur.workspace === ws && cur.files.length + gFiles.length <= MAX_FILES && cur.changedLines + gLines <= MAX_LINES;
  if (!fits && (cur?.workspace !== ws || (gFiles.length <= MAX_FILES && gLines <= MAX_LINES))) newBatch(ws);
  for (const f of gFiles) { // oversized groups are split across consecutive batches
    if (!cur || cur.files.length >= MAX_FILES || (cur.changedLines + size(f) > MAX_LINES && cur.files.length > 0)) newBatch(ws);
    if (!cur.groups.includes(key)) cur.groups.push(key);
    cur.files.push(f.path);
    cur.changedLines += size(f);
  }
}

// ---- Per-batch diff command and untracked files (batch-diff.js runs these) -----------
const untrackedSet = new Set(review.filter((f) => f.status === 'untracked').map((f) => f.path));
const oldPathOf = new Map(review.filter((f) => f.oldPath).map((f) => [f.path, f.oldPath]));
const q = (p) => `'${p.replace(/'/g, `'\\''`)}'`;
for (const b of batches) {
  b.untracked = b.files.filter((p) => untrackedSet.has(p));
  const tracked = b.files.filter((p) => !untrackedSet.has(p));
  b.diffCommand = ALL || !tracked.length ? null
    : `git diff -U3 -M ${WORKING ? mergeBase : `${mergeBase} HEAD`} -- ${tracked.flatMap((p) => (oldPathOf.has(p) ? [oldPathOf.get(p), p] : [p])).map(q).join(' ')}`;
}

const totalLines = review.reduce((s, f) => s + size(f), 0);
// Size tier for the summary only; every size runs the same batch loop with result files.
const sizeTier = review.length <= 10 && totalLines <= 600 ? 'small'
  : review.length <= 60 ? 'medium' : 'large';
const startedAt = new Date().toISOString();
const plan = {
  startedAt,
  base,
  mergeBase,
  reviewMode: ALL ? 'full-project' : 'diff',
  includesUncommitted: WORKING,
  size: sizeTier,
  workspaces: [...new Set(batches.map((b) => b.workspace))],
  totals: { reviewFiles: review.length, changedLines: totalLines, batches: batches.length, skippedFiles: skipped.length, renamedOnly: renamedOnly.length },
  batches,
  skipped,
  renamedOnly,
};
const runDir = opt('--out', `${RUNS_DIR}/${startedAt.replace(/[:.]/g, '-')}`);
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(`${runDir}/plan.json`, JSON.stringify(plan, null, 2) + '\n');
process.stdout.write(JSON.stringify(summary(runDir, plan), null, 2) + '\n');
