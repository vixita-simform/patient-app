---
name: react-design-to-rn
description: Convert a React-in-HTML design (JSX compiled in the browser by Babel, inline style objects, screens switched by useState — often wrapped in a device-frame iframe srcdoc) into React Native screens. Extracts the design deterministically, writes per-screen specs, builds RN screens, renders design references and checks the result. Use for designs where the HTML contains React/JSX rather than plain HTML+CSS.
argument-hint: "extract | research | system | spec all | spec <Screen> | build <Screen> | screen <Screen> | render [<Screen>|all] | verify <Screen> | status"
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

# React-in-HTML design → React Native

Run `/react-design-to-rn $ARGUMENTS`.

The design is code: exact colors, px values, texts and data are in the JSX.
Fidelity comes from **extracting** them, never from eyeballing. The pipeline:

```
extract ─► research ─► (system) ─► spec ─► build ─► check ─► fix ─► done
 script     scout        builder    spec     builder  checker  builder
                                    writer                      (repair)
```

**You are the orchestrator.** You run scripts, launch agents, keep
`status.json`, and report. You do not write screen code and you do not read the
heavy files — see `references/reading-budget.md` (read it once per session).

Paths below: `SK = .claude/skills/react-design-to-rn`, `X = <source.extractDir>`
(default `design/.rdr`), `CFG = .claude/react-design-to-rn/config.json`.

## Never

- Read the original design HTML, `X/app.html`, `X/app.jsx`, `X/screens/*`,
  `X/*.json` other than `inventory.json`/`status.json`, or `X/ref/*.computed.json`.
- Read a spec past its `## 0. Digest`:
  `sed -n '/^## 0\. Digest/,/^## 1\./p' X/.build/<S>.spec.md`
- Start Metro, boot a simulator, build or install the app. The user runs the
  app; the checker only uses a device that is already running.
- Paste file contents between agents. Pass paths.

## Config (first run, then never asked again)

1. `CFG` missing → detect from the repo and write it, show it to the user, and
   **wait for confirmation** before any phase:

```json
{
  "source": {
    "extractDir": "design/.rdr",
    "templateVar": null,
    "root": null,
    "screens": null
  },
  "project": {
    "conventions": "CLAUDE.md",
    "srcDir": "src",
    "appDir": "src/app",
    "screensDir": "src/screens",
    "componentsDir": "src/components",
    "iconsDir": "src/assets/icons",
    "assetsDir": "src/assets",
    "themeDir": "src/theme",
    "colorsFile": "src/theme/Colors.ts",
    "fontsFile": "src/theme/Fonts.ts",
    "stringsFile": "src/constants/Strings.ts",
    "scaleFn": "scale",
    "themeHook": "useTheme",
    "textComponent": "AppText",
    "screenWrapper": "Screen",
    "router": "expo-router"
  },
  "verify": {
    "simulator": true,
    "viewportWidth": 320,
    "viewportHeight": 680,
    "dpr": 2,
    "deviceWidth": 393,
    "deviceHeight": 852,
    "cropActual": "7%,4%",
    "threshold": 0.12,
    "maxMismatchPct": 10,
    "maxRepairRounds": 2
  }
}
```

Detect each `project.*` path by looking (`ls`, the project's CLAUDE.md); put
`null` for anything that does not exist. `verify.viewportWidth` = the
design's app column: `frame.maxWidth` in `X/inventory.json` after the first
`extract` (update the config then; keep 390 if there is no frame). 2. `.claude/react-design-to-rn/config.local.json` missing or no
`source.designFile` → **ask the user for the design HTML path**, write
`{ "source": { "designFile": "<path>" } }`, make sure the file and `X/` are
in `.gitignore`. Never guess the path.

## Commands

### `extract`

```bash
node SK/scripts/extract-react-design.mjs --html "<designFile>" --out X \
  [--template-var <source.templateVar>] [--root <source.root>] [--screens <a,b>]
```

Report the printed summary (screens, shared components, todo). If it prints
`todo` items, tell the user which screens need hand-written state steps in
`.claude/react-design-to-rn/states.json`. If CHANGELOG shows changed screens
that already have specs, say they are now stale.

If `@babel/parser` / `pngjs` is missing the script says how to install it
(`npm i --prefix SK/scripts`). Ask before installing.

### `research`

Launch `rdr-project-scout` with `config: CFG, extractDir: X`. Run automatically
before `system`/`spec`/`build` when `X/.cache/project-inventory.md` is missing;
the agent itself skips when its cache hash is unchanged.

### `system` (once per project, recommended before the first screen)

Read `X/inventory.json` counts + `shared` components list. Launch
`rdr-screen-builder` in `system` mode with: the list of shared components
(`components.json` entries with `shared: true`), "theme colours from
`X/tokens.json`", "fonts from `X/typography.json`", "icons from `X/icons.json`
used by ≥1 screen", "assets from `X/assets/`". Then re-run `research` (the
project changed). Record `status.system = "done"`.

### `spec all` — mode 1, step A

For every screen in `inventory.screens` whose status is not `spec: done` (or is
`specStale`), launch `rdr-spec-writer` — **at most 4 at a time**, in the
background, one message per batch. Prompt per agent:
`screen: <S>, extractDir: X, config: CFG, projectInventory: X/.cache/project-inventory.md`
(+ `notes` if the user gave any for that screen). After each returns, record
`status.screens.<S> = { spec: "done", specHash: <inventory hash>, specStale: false, specAt }`
and print its Digest's first 3 lines. Finish with a table: screen → reuse/create
counts → open questions.

Rendering references first (`render all`) gives the spec writers screenshots —
do it before `spec all` when a browser is available.

### `spec <S>`

Same as above for one screen. Print the Digest.

### `build <S>` — mode 1, step B

Requires `X/.build/<S>.spec.json`; if missing or `specStale`, stop and suggest
`spec <S>` or `screen <S>`. Then:

1. `rdr-screen-builder` mode `build`: `screen: <S>, extractDir: X, config: CFG`.
2. `rdr-fidelity-checker`: `screen, extractDir, config, screenDir: <from builder reply>, round: 1`.
3. verdict `fix` → `rdr-screen-builder` mode `repair` with the fixes path, then
   checker round 2. Stop after `verify.maxRepairRounds`.
4. Record `status.screens.<S>.build = "done"`, `.verify = <verdict>`, `.rnDir`.

### `screen <S>` — mode 2 (on demand)

`spec <S>` only if the spec is missing or stale, then `build <S>`. One command,
same agents. Ask nothing in between unless the spec has `openQuestions` that
change the build — then show them and wait.

### `render [<S>|all]`

```bash
node SK/scripts/render-reference.mjs --extract X [--only <S>] \
  --width <verify.viewportWidth> --height <verify.viewportHeight> --dpr <verify.dpr>
```

Launches headless Chrome/Edge itself (or `--cdp-port <port>` to use a running
one). Needs network (the design loads React from a CDN). Report rendered/failed
counts; for failures show the error and suggest a `states.json` override.
Device-width references for checking are rendered by the checker on demand
(`--unclamp --out X/ref-device`).

### `verify <S>`

Only `rdr-fidelity-checker` (round 1); print its summary. No repair.

### `status`

Print a table from `X/status.json` + `X/inventory.json`:
`screen | spec | stale | build | verify | rn folder`. Mention `system` status
and the next suggested command.

## states.json (user overrides for rendering)

`X/states.seed.json` is generated. To fix or add a state, write
`.claude/react-design-to-rn/states.json` with the same shape — user entries win
by key:

```json
{
  "states": {
    "MessagesScreen.thread": {
      "screen": "MessagesScreen",
      "steps": [
        { "set": "App", "name": "splash", "value": false },
        { "set": "App", "name": "loggedIn", "value": true },
        { "set": "App", "name": "screen", "value": "messages" },
        { "waitMs": 300 },
        { "set": "MessagesScreen", "name": "selected", "value": 1 }
      ]
    }
  }
}
```

Step types: `set` (component + useState name, hook index resolved from
`X/hooks.json`), `click` (visible text), `waitMs`, `eval` (JS).

## status.json

`X/status.json`, only you write it (agents run in parallel):

```json
{
  "system": "done",
  "screens": {
    "HomeScreen": {
      "spec": "done",
      "specHash": "…",
      "specStale": false,
      "build": "done",
      "verify": "pass",
      "rnDir": "src/screens/home"
    }
  }
}
```

The extractor flips `specStale` when a screen's source changes.

## Reporting

After each command: what ran, what was written (paths), verdicts, and the
user's next step. For built screens always list what the user should look at
in the running app (states, sheets, truncation, gradients, anything in the
fix list marked `needs-review`). Keep it short.

## References

- `references/react-to-rn.md` — element / style / behavior mapping
- `references/spec-format.md` — the spec contract between agents
- `references/reading-budget.md` — who may read what

## Using this in another project

Copy `SK/` and `.claude/agents/rdr-*.md` into the other repo. Nothing else is
shared; the first run writes that repo's own `CFG`.
