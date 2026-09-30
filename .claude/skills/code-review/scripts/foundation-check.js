#!/usr/bin/env node
/**
 * foundation-check.js — checks the project foundation that conventions.md depends on.
 * Meant for a NEW project / first full review, but safe to run anytime. Read-only.
 *
 * Usage: node .claude/skills/code-review/scripts/foundation-check.js
 *
 * Output (same line format as code-reviewer findings, so the orchestrator can merge it):
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

// ---- 1. Core files the conventions rely on --------------------------------------------
const core = [
  // [display name, exact path or null, basename to search, why]
  ['useRedux.ts', 'app/redux/useRedux.ts', null, 'useAppDispatch / useAppSelector'],
  ['APIConfig.ts', 'app/configs/APIConfig.ts', null, 'createAsyncThunkWithCancelToken, authorizedAPI, unauthorizedAPI'],
  ['APIConst.ts', 'app/constants/APIConst.ts', null, 'API endpoint strings'],
  ['ToolkitAction.ts', 'app/constants/ToolkitAction.ts', null, 'thunk action names'],
  ['Strings.ts', 'app/constants/Strings.ts', null, 'user-facing strings'],
  ['NavigationRoutes.ts', 'app/constants/NavigationRoutes.ts', null, 'ROUTES enum'],
  ['NavigatorUtils.ts', null, 'NavigatorUtils.ts', 'imperative navigation + deep links'],
  ['AppNavigation.tsx', null, 'AppNavigation.tsx', 'RootStackParamList'],
  ['Store.ts', null, 'Store.ts', 'combineReducers + persistConfig'],
  ['en.json', null, 'en.json', 'i18n keys'],
  ['Metrics', null, /^Metrics\.(ts|tsx|js)$/, 'scale()'],
  ['Colors', null, /^Colors\.(ts|tsx|js)$/, 'Colors[theme]'],
  ['ApplicationStyles', null, /^ApplicationStyles\.(ts|tsx|js)$/, 'shared styles'],
  ['jest/Wrapper.tsx', 'jest/Wrapper.tsx', null, 'RenderWrapper / RenderWrapperForHooks'],
];
for (const [name, exact, search, why] of core) {
  let found = false;
  if (exact && fs.existsSync(exact)) found = true;
  else if (search) found = all.some((p) => (search instanceof RegExp ? search.test(path.basename(p)) : path.basename(p) === search));
  if (!found) {
    missingCore.push(name);
    f('STANDARD', 'structure', exact || name, `Core file missing — conventions need it for ${why}`,
      `Create ${exact || name} before building features on top of it`);
  }
}
if (!fs.existsSync('jest/__tests__')) f('STANDARD', 'tests', 'jest/__tests__/', 'Test folder missing', 'Create jest/__tests__/ and add a first snapshot test');
if (!fs.existsSync('jest/__mock__')) f('MINOR', 'tests', 'jest/__mock__/', 'Mock folder missing', 'Create jest/__mock__/ for native module mocks');

// ---- 2. tsconfig flags the conventions assume -----------------------------------------
const ts = read('tsconfig.json');
if (!ts) f('CRITICAL', 'typescript', 'tsconfig.json', 'tsconfig.json missing', 'Add tsconfig.json with strict mode');
else {
  const hasExtends = /"extends"\s*:/.test(ts);
  for (const flagName of ['strict', 'noUnusedLocals', 'noUnusedParameters']) {
    if (!new RegExp(`"${flagName}"\\s*:\\s*true`).test(ts)) {
      f(hasExtends && flagName === 'strict' ? 'MINOR' : 'STANDARD', 'typescript', 'tsconfig.json',
        `"${flagName}": true not set${hasExtends ? ' here (may come from "extends" — verify)' : ''}`,
        `Add "${flagName}": true to compilerOptions`);
    }
  }
}

// ---- 3. ESLint rules the conventions call ERROR -----------------------------------------
const eslintFiles = ['.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc', '.eslintrc.yml', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs'];
const eslintFile = eslintFiles.find((p) => fs.existsSync(p));
let eslintText = eslintFile ? read(eslintFile) : null;
if (!eslintText) {
  const pkg = read('package.json');
  if (pkg && /"eslintConfig"\s*:/.test(pkg)) eslintText = pkg;
}
if (!eslintText) f('STANDARD', 'structure', '.eslintrc.js', 'No ESLint config — lint rules in conventions are not enforced automatically', 'Add ESLint with eslint-plugin-react-native and @typescript-eslint');
else {
  const rules = [
    'react-native/no-inline-styles', 'react-native/no-color-literals', 'react-native/no-unused-styles',
    'react-native/no-raw-text', '@typescript-eslint/consistent-type-definitions', 'react/jsx-sort-props',
  ];
  const missing = rules.filter((r) => !eslintText.includes(r));
  if (missing.length) f('STANDARD', 'structure', eslintFile || 'package.json',
    `ESLint rules not configured: ${missing.join(', ')}`, 'Add them as "error" so tooling catches them before review');
}

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
process.stdout.write([
  'FINDINGS',
  ...(findings.length ? findings : ['none']),
  '',
  'MISSING_CORE',
  ...(missingCore.length ? missingCore : ['none']),
  '',
].join('\n'));
