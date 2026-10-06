# Common Review Rules

Rules that apply to every workspace in the monorepo. Every reviewer reads this file, plus the
workspace file its batch is tagged with:

| Batch workspace | Rule files |
|---|---|
| `mobile` (`apps/mobile/`) | this file + `mobile.md` + `apps/mobile/CLAUDE.md` |
| `backend` (`apps/backend/`) | this file + `backend.md` |
| `shared` (`packages/*`) | this file (section 4 applies) |
| `root` (anything else) | this file |

Edit a rule in one place only. A rule that applies to one workspace goes in that workspace's
file, not here.

## Contents
1. Naming
2. TypeScript
3. Imports Across Workspaces
4. Shared Packages
5. Testing
6. Correctness, Security & Performance
7. Leftovers
8. Severity Guide
9. Finding Categories

---

## 1. Naming

- PascalCase: React components, types, interfaces, enums, and component/screen files (`HomeScreen.tsx`).
- camelCase: functions, variables, hooks (`useAuth.ts`), util files (`formatDate.ts`).
- kebab-case: folder names (`custom-button/`, `lab-report-detail/`).
- Hooks always start with `use`.
- Constant objects of fixed values are `UPPER_SNAKE_CASE` (`BUTTON_VARIANT`, `STACK_ROUTES`).
- Names describe what the thing is, not how it is used: `appointments`, not `data2` or `list`.

## 2. TypeScript

- `strict`, `noUnusedLocals` and `noUnusedParameters` are on (root `tsconfig.base.json`). No implicit `any`.
- Use `interface` for object shapes and `type` for unions, intersections and aliases (`@typescript-eslint/consistent-type-definitions` is an error in mobile).
- No explicit `any`. Use `unknown` and narrow it.
- No `@ts-ignore` / `@ts-expect-error` without a comment saying why.
- No non-null assertion (`!`) on values that can really be missing (API data, route params, storage reads). Handle the missing case.
- Exported functions have explicit return types.
- Use `import type` for type-only imports.

## 3. Imports Across Workspaces

- Import another workspace only by its package name (`@patient-app/shared-types`). Never use a relative path that leaves the workspace (`../../../packages/...`).
- Apps never import from other apps. `apps/mobile` must not import from `apps/backend`, and the other way round. Code both need goes in a shared package.
- A new dependency goes in the `package.json` of the workspace that uses it, not the root one. The root only holds workspace config, scripts and `overrides`.
- Only one version of `react`, `react-dom` and `react-native` may exist. A change that adds a second one (a different version in a workspace `package.json`) is CRITICAL.

## 4. Shared Packages (`packages/*`)

- A shared package must not import from any app, `react-native`, `expo-*` or `next`. It has to work in mobile, backend and the future web app.
- `@patient-app/shared-types` holds only types: no runtime code, no constants, no default exports.
- Types that cross the network (request bodies, response shapes, domain models) live in `packages/shared-types/src/api/` and are exported from its `index.ts` barrel.
- UI-only types (badge tones, tints, layout variants) do not belong here; they stay in the app.
- Changing or removing an exported shared type is a breaking change for every app. Every caller must be updated in the same change (see `CHANGED_EXPORT` in the reviewer output).
- A new shared package must be added to `transpilePackages` in `apps/backend/next.config.ts`.

## 5. Testing

- New logic needs a test: hooks with logic need success, error and loading cases; pure utils need input/output cases; backend handlers need success and failure cases.
- Assertions must check behaviour. A snapshot on its own is not enough for logic.
- Tests must not depend on the current date, network, or test order. Mock time and I/O.
- Never weaken or delete an existing assertion just to make a test pass.

## 6. Correctness, Security & Performance

- **Correctness**: logic bugs; wrong types; missing null/undefined checks at system boundaries (API responses, request input, route params, storage reads); unhandled promise rejections; `async` functions called without `await` or `.catch`; off-by-one and time-zone errors in date code (dates cross the network as ISO 8601 strings).
- **Security**: secrets, API keys or tokens hardcoded in source; tokens or patient data (name, phone, medical records) in logs; unvalidated input used in a query, file path, redirect or navigation; auth checks missing or skipped; error messages that leak internals (stack traces, SQL) to the client.
- **Performance**: work repeated in a loop that could run once; unbounded lists or queries with no limit; requests made one after another that could run in parallel; listeners, timers or subscriptions that are never cleaned up.
- **Health data**: this is a patient app. Treat every medical record, vital, prescription and contact detail as sensitive. Flag anything that exposes it to someone other than the patient.

## 7. Leftovers

Flag these when added in the change: `console.log`, `debugger`, commented-out code blocks,
new `TODO` / `FIXME` without a ticket or reason, unused files, unused exports.

## 8. Severity Guide

| Severity | Use for | Report section |
|---|---|---|
| `CRITICAL` | Will cause a bug, crash, data loss, security or privacy problem, or a broken build / type error | Critical Issues |
| `STANDARD` | Breaks a rule in this file or the workspace rule files (naming, structure, pattern, missing test) | Standards Violations |
| `MINOR` | Non-blocking improvement: readability, small performance win | Minor Issues |

When unsure between two levels, pick the lower one and say why in the finding.

## 9. Finding Categories

Use exactly one of: `correctness`, `security`, `performance`, `structure`, `naming`,
`typescript`, `styling`, `strings`, `api`, `validation`, `navigation`, `hooks`, `tests`,
`accessibility`, `shared`, `leftover`.
