---
name: react-generate-rn-design
description: Build React Native screens from specs already written by react-generate-spec. Takes one screen, several screens, or all screens that have a spec; builds each screen (screen, styles, hook, types, components, route, strings, icons), checks it against the design and runs the repair pass. Never creates specs — screens without a spec are skipped.
argument-hint: "<Screen> | <Screen1,Screen2 ...> | all   [-- notes]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
user-invocable: true
---

# Generate RN design

Build RN screens for: `$ARGUMENTS`

Works only from existing specs (`X/.build/<S>.spec.json`). Uses the
`react-design-to-rn` toolkit without changing it:

- `SK = .claude/skills/react-design-to-rn` (scripts + references)
- agents `rdr-project-scout`, `rdr-screen-builder`, `rdr-fidelity-checker`
- `CFG = .claude/react-design-to-rn/config.json`, `X = source.extractDir` (default `design/.rdr`)

You are the orchestrator. You do not write screen code and you do not read the
design sources or full specs — only a spec's `## 0. Digest`
(`sed -n '/^## 0\. Digest/,/^## 1\./p' X/.build/<S>.spec.md`). Never start
Metro, boot a device, build or install the app.

## 1. Parse the input

- `all` (or empty) → every screen in `X/status.json` with `spec: "done"`.
- Names separated by commas or spaces, matched case-insensitively with or
  without the `Screen` suffix against `X/inventory.json` screens.
- Text after `--` → notes passed to the builder (e.g. `-- use mock data only`).
- `force` → rebuild screens already built.

## 2. Preconditions

1. `CFG` and `X/inventory.json` must exist. Missing → stop: "run
   `/react-generate-spec <screens>` first".
2. For every requested screen, sort into:
   - **ready** — `X/.build/<S>.spec.json` exists and `specStale` is not true
   - **no spec** — skip; tell the user to run `/react-generate-spec <S>`
   - **stale spec** — the design changed after the spec was written; skip and
     suggest `/react-generate-spec <S>` (build anyway only if the user said `force`)
   - **already built** (`build: "done"`) — skip unless `force`
3. `X/.cache/project-inventory.md` missing → launch `rdr-project-scout` and wait.
4. If `X/status.json` has no `system: "done"` and two or more ready screens use
   the same shared component that does not exist in the project yet (Digest
   "create … scope shared"), run the foundation first: `rdr-screen-builder` in
   `system` mode as described under `system` in `SK/SKILL.md`, then re-run
   `rdr-project-scout`. Record `system: "done"`. Otherwise skip this step.

Show the plan (ready / skipped with reasons, build order) before building.

## 3. Build — one screen at a time

Screens share files (strings, theme, icon barrel, components barrel, routes),
so **never run two builders in parallel**. Order: screens with fewer `create`
items first; auth screens (splash/login/signup) before tabs; tabs before
sub-screens.

For each ready screen:

1. **Build** — `rdr-screen-builder`:
   ```
   mode: build
   screen: <S>
   extractDir: X
   config: CFG
   notes: <notes or none>
   ```
2. **Check** — `rdr-fidelity-checker`:
   ```
   screen: <S>
   extractDir: X
   config: CFG
   screenDir: <from the builder's reply>
   round: 1
   ```
3. **Fix** — verdict `fix` → `rdr-screen-builder` with `mode: repair`,
   `fixes: X/.build/<S>.fixes.md`, then the checker again with `round: 2`.
   Stop after `verify.maxRepairRounds` (default 2).
4. **Record** in `X/status.json` (read-modify-write):
   `screens.<S> += { build: "done", builtAt, rnDir, verify: "pass" | "fix" | "needs-review" | "skipped" }`.
   A builder failure → `build: "failed"` with the reason; continue with the
   next screen.

Between screens print one line: `<S>: built → <rnDir> · verify <verdict>`.

## 4. Final checks

```bash
npx tsc --noEmit
npx expo lint
```

Fix nothing yourself; if errors remain in built files, send them to
`rdr-screen-builder` (`mode: repair`, the error list as fixes) once.

## 5. Report

| Screen | RN folder | Route | Verify | Left for you |
| --- | --- | --- | --- | --- |

Then: shared components / icons / theme keys / strings added, packages
installed, screens skipped and why, and for each screen what the user should
look at in the running app (states, sheets, truncation, gradients,
`needs-review` items from `X/.build/<S>.fixes.md`).
