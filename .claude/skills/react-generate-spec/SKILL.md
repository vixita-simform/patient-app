---
name: react-generate-spec
description: Generate React Native screen specs from a React-in-HTML design (JSX + inline styles, screens switched by useState). Takes one screen, several screens, or all screens; extracts the design if needed and writes <Screen>.spec.json + .spec.md per screen. Does not write app code — use react-generate-rn-design afterwards.
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

# Generate spec

Write specs for: `$ARGUMENTS`

This skill only produces specs. It uses the scripts, references and agents of
the `react-design-to-rn` toolkit (it does not change them):

- `SK = .claude/skills/react-design-to-rn` (scripts + references)
- agents `rdr-project-scout`, `rdr-spec-writer`
- `CFG = .claude/react-design-to-rn/config.json`, `X = source.extractDir` (default `design/.rdr`)

You are the orchestrator: run scripts, launch agents, update `X/status.json`,
report. Never read the design HTML, `X/app.*`, `X/screens/*`, `X/*.json` other
than `inventory.json` / `status.json`, or a spec past its `## 0. Digest`
(`SK/references/reading-budget.md`).

## 1. Parse the input

- `all` (or empty) → every screen in `X/inventory.json` `screens[]`.
- One or more names separated by commas or spaces. Match each case-insensitively
  against inventory names with or without the `Screen` suffix
  (`home`, `Home`, `HomeScreen` → `HomeScreen`; `data-feeds` → `DataFeedsScreen`).
  Unknown name → list the closest inventory names and stop for that one; keep
  the others.
- Text after `--` is per-run notes passed to every spec writer (e.g.
  `HomeScreen -- skip the client switcher`).

## 2. Preconditions (do only what is missing)

1. **Config** — `CFG` missing → follow the "Config" section of
   `SK/SKILL.md` (detect, write, show, **wait for confirmation**).
   `.claude/react-design-to-rn/config.local.json` missing `source.designFile`
   → ask the user for the design HTML path and record it.
2. **Extract** — run when `X/inventory.json` is missing, or the design file's
   sha1 (first 12 chars) differs from `inventory.source.sha1`:
   ```bash
   node SK/scripts/extract-react-design.mjs --html "<designFile>" --out X \
     [--template-var <source.templateVar>] [--root <source.root>] [--screens <source.screens>]
   ```
   Report the summary line and any `todo` / changed screens. Set
   `verify.viewportWidth` in `CFG` to `inventory.frame.maxWidth` if it differs
   (tell the user).
3. **References** — for the requested screens without `X/ref/<Screen>.png`:
   ```bash
   node SK/scripts/render-reference.mjs --extract X --only <S1,S2,...> \
     --width <verify.viewportWidth> --height <verify.viewportHeight> --dpr <verify.dpr>
   ```
   If no browser is available or it fails, continue without references and say
   so (specs are still written from code).
4. **Project inventory** — `X/.cache/project-inventory.md` missing → launch
   `rdr-project-scout` (`config: CFG, extractDir: X`) and wait.

## 3. Which screens need a spec

For each requested screen, skip it when `X/status.json` has
`spec: "done"`, `specStale: false` and `X/.build/<S>.spec.json` exists — unless
the user said `force`/`regenerate` or gave notes for it. List skipped ones.

## 4. Write specs

Launch `rdr-spec-writer` per screen, **at most 4 at a time**, in the background
(one message per batch; start the next batch as agents finish). Prompt:

```
screen: <S>
extractDir: X
config: CFG
projectInventory: X/.cache/project-inventory.md
notes: <notes or none>
```

After each returns:
- Record in `X/status.json` (read-modify-write; only you write it):
  `screens.<S> = { ...existing, spec: "done", specHash: <inventory screen hash>, specStale: false, specAt: <iso> }`
- Keep its Digest; do not read the spec files.

If an agent fails, record `spec: "failed"` with the reason and continue.

## 5. Report

One table for the run:

| Screen | Route | Reuse | Create | States | Open questions |
| --- | --- | --- | --- | --- | --- |

Then: Digest `over cap:` lines, all open questions (grouped per screen), the
spec paths (`X/.build/<S>.spec.json`), and the next step:
`/react-generate-rn-design <same screens>`.
