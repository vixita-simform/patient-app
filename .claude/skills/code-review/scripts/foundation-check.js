#!/usr/bin/env node
/**
 * foundation-check.js — checks the monorepo foundation the review rules (references/*.md) depend on.
 * Meant for a NEW project / first full review, but safe to run anytime. Read-only.
 *
 * Usage: node .claude/skills/code-review/scripts/foundation-check.js [--out <file>]
 *   --out   Also write the output to this file (e.g. <runDir>/foundation.txt for merge-findings.js).
 *
 * Output (same line format as the review findings, so merge-findings.js can merge it):
 *   FINDINGS
 *   <SEVERITY> | <category> | <path> | <issue> | <fix>
 *   MISSING_CORE
 *   <name>          ← pass this list to reviewers so they don't flag every usage
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const findings = [];
const missingCore = [];
const f = (sev, cat, where, issue, fix) => findings.push(`${sev} | ${cat} | ${where} | ${issue} | ${fix} [foundation]`);
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

// All files in the project (excluding heavy/generated folders)
const all = [];
(function walk(d) {
  let entries = [];
  try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = d === '.' ? e.name : `${d}/${e.name}`;
    if (e.isDirectory()) { if (!/^(\.git|node_modules|Pods|build|dist|coverage|\.gradle|\.claude)$/.test(e.name)) walk(p); }
    else all.push(p);
  }
})('.');
const findByName = (name) => all.filter((p) => path.basename(p) === name);

// ---- 1. Core files the rules rely on, per workspace ------------------------------------
const M = 'apps/mobile/';
const B = 'apps/backend/';
const core = [
  // [workspace, path, why]
  ['mobile', `${M}src/constants/Strings.ts`, 'user-facing strings'],
  ['mobile', `${M}src/constants/Routes.ts`, 'STACK_ROUTES / TAB_ROUTES'],
  ['mobile', `${M}src/constants/Constants.ts`, 'fixed value sets (variants, statuses)'],
  ['mobile', `${M}src/theme/Colors.ts`, 'Colors[theme]'],
  ['mobile', `${M}src/theme/Metrics.tsx`, 'scale()'],
  ['mobile', `${M}src/theme/Fonts.ts`, 'Fonts.size / Fonts.weight'],
  ['mobile', `${M}src/hooks/useTheme.ts`, 'useTheme(styles)'],
  ['mobile', `${M}src/utils/authStorage.ts`, 'secure token storage'],
  ['mobile', `${M}jest/Wrapper.tsx`, 'RenderWrapper / RenderWrapperForHooks'],
  ['backend', `${B}next.config.ts`, 'transpilePackages for shared packages'],
  ['shared', 'packages/shared-types/src/index.ts', 'shared API types barrel'],
];
for (const [ws, p, why] of core) {
  if (!fs.existsSync(path.dirname(p).split('/').slice(0, 2).join('/'))) continue; // workspace not created yet
  if (!fs.existsSync(p)) {
    missingCore.push(`${ws}: ${p}`);
    f('STANDARD', 'structure', p, `Core file missing — ${ws} rules need it for ${why}`, `Create ${p} before building features on top of it`);
  }
}
if (!fs.existsSync(`${M}jest/__tests__`)) f('STANDARD', 'tests', `${M}jest/__tests__/`, 'Test folder missing', `Create ${M}jest/__tests__/ and add a first test`);
if (!fs.existsSync(`${M}jest/__mock__`)) f('MINOR', 'tests', `${M}jest/__mock__/`, 'Mock folder missing', `Create ${M}jest/__mock__/ for native module mocks`);

const nextConfig = read(`${B}next.config.ts`);
const sharedPackages = fs.existsSync('packages')
  ? fs.readdirSync('packages').map((d) => read(`packages/${d}/package.json`)).filter(Boolean).map((t) => JSON.parse(t).name)
  : [];
if (nextConfig) {
  for (const name of sharedPackages) {
    if (!nextConfig.includes(name)) f('STANDARD', 'shared', `${B}next.config.ts`, `${name} not in transpilePackages`, `Add "${name}" to transpilePackages`);
  }
}

// ---- 2. tsconfig flags the rules assume (follows "extends" to the root base) ------------
const stripJsonComments = (t) => t.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/.*$/gm, '$1');
const tsFlags = (file, seen = new Set()) => {
  const text = read(file);
  if (!text || seen.has(file)) return {};
  seen.add(file);
  let cfg;
  try { cfg = JSON.parse(stripJsonComments(text)); } catch { return {}; }
  const parents = [].concat(cfg.extends || []).filter((e) => e.startsWith('.'));
  const inherited = parents.reduce((acc, e) => ({ ...acc, ...tsFlags(path.join(path.dirname(file), e), seen) }), {});
  return { ...inherited, ...(cfg.compilerOptions || {}) };
};
const tsconfigs = ['apps/mobile/tsconfig.json', 'apps/backend/tsconfig.json',
  ...(fs.existsSync('packages') ? fs.readdirSync('packages').map((d) => `packages/${d}/tsconfig.json`) : [])]
  .filter((p) => fs.existsSync(path.dirname(p)));
for (const file of tsconfigs) {
  if (!fs.existsSync(file)) { f('CRITICAL', 'typescript', file, 'tsconfig.json missing', 'Add one that extends ../../tsconfig.base.json'); continue; }
  const flags = tsFlags(file);
  for (const flagName of ['strict', 'noUnusedLocals', 'noUnusedParameters']) {
    if (flags[flagName] !== true) f('STANDARD', 'typescript', file, `"${flagName}": true not set (directly or via extends)`, 'Extend ../../tsconfig.base.json');
  }
}

// ---- 3. ESLint rules the mobile rules call ERROR; backend has a config at all ---------------
const eslintNames = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', '.eslintrc.js', '.eslintrc.json'];
const findEslint = (dir) => eslintNames.map((n) => dir + n).find((p) => fs.existsSync(p));
const mobileEslint = findEslint(M);
if (!mobileEslint) f('STANDARD', 'structure', `${M}eslint.config.js`, 'No ESLint config — mobile lint rules are not enforced automatically', 'Add eslint-config-expo with eslint-plugin-react-native');
else {
  const eslintText = read(mobileEslint);
  const rules = [
    'react-native/no-inline-styles', 'react-native/no-color-literals', 'react-native/no-unused-styles',
    'react-native/no-raw-text', '@typescript-eslint/consistent-type-definitions', 'react/jsx-sort-props',
  ];
  const missing = rules.filter((r) => !eslintText.includes(r));
  if (missing.length) f('STANDARD', 'structure', mobileEslint, `ESLint rules not configured: ${missing.join(', ')}`, 'Add them as "error" so tooling catches them before review');
}
if (fs.existsSync(B) && !findEslint(B)) f('STANDARD', 'structure', `${B}eslint.config.mjs`, 'No ESLint config for backend', 'Add eslint-config-next');

// ---- 4. Secrets / files that must never be pushed ------------------------------------------
let tracked = [];
try {
  tracked = execSync('git ls-files && git ls-files --others --exclude-standard', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n').filter(Boolean);
} catch { tracked = all; /* not a git repo: check everything */ }
const secretPatterns = [
  [/(^|\/)\.env(\.[^/]*)?$/, (p) => !/\.(example|sample|template)$/.test(p)],
  [/\.(jks|keystore|p12|p8|pem|mobileprovision)$/i, (p) => !/debug\.keystore$/.test(p)],
  [/(^|\/)(keystore|signing)\.properties$/i, () => true],
];
for (const p of tracked) {
  for (const [re, ok] of secretPatterns) {
    if (re.test(p) && ok(p)) f('CRITICAL', 'security', p, 'Secret/signing file would be pushed to git', `Add to .gitignore and run: git rm --cached "${p}"`);
  }
  if (/(^|\/)(google-services\.json|GoogleService-Info\.plist)$/.test(p)) {
    f('MINOR', 'security', p, 'Firebase config is in git (API keys are restricted, but many teams keep it out)', 'Decide team policy; if private, add to .gitignore');
  }
}
const gi = read('.gitignore') || '';
if (!/^\s*\.env/m.test(gi)) f('STANDARD', 'security', '.gitignore', '.env files not ignored', 'Add `.env` and `.env.*` (keep `!.env.example`)');
if (!/node_modules/.test(gi)) f('CRITICAL', 'structure', '.gitignore', 'node_modules not ignored', 'Add `node_modules/` to .gitignore');
if (!/\.claude\/reviews/.test(gi)) f('MINOR', 'structure', '.gitignore', 'Review reports folder not ignored', 'Add `.claude/reviews/`');

// ---- Output ------------------------------------------------------------------------------
const output = [
  'FINDINGS',
  ...(findings.length ? findings : ['none']),
  '',
  'MISSING_CORE',
  ...(missingCore.length ? missingCore : ['none']),
  '',
].join('\n');
const outIdx = process.argv.indexOf('--out');
if (outIdx > 0 && process.argv[outIdx + 1]) fs.writeFileSync(process.argv[outIdx + 1], output);
process.stdout.write(output);
