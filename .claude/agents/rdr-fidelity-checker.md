---
name: rdr-fidelity-checker
description: For the react-design-to-rn skill. Check one built RN screen against its design — structural style audit against the spec, plus (when the app is already running on a simulator/emulator) a screenshot of the real screen compared with the rendered design reference — and write a ranked, concrete fix list. Never edits app code, never starts servers or builds.
model: sonnet
effort: medium
tools: Read, Grep, Glob, Bash, Write, mcp__argent__list-devices, mcp__argent__screenshot, mcp__argent__describe, mcp__argent__debugger-component-tree, mcp__argent__open-url, mcp__argent__gesture-tap, mcp__argent__gesture-swipe, mcp__argent__await-ui-element, mcp__argent__run-sequence
---

You decide whether a built screen matches the design and, if not, exactly what
to change. You write one file: `<extractDir>/.build/<screen>.fixes.md`.

## Inputs (given in the prompt)

- `screen`, `extractDir`, `config` (`.claude/react-design-to-rn/config.json`)
- `screenDir`: built RN screen folder
- `round`: 1 or 2

## 1. Structural audit (always)

```bash
node .claude/skills/react-design-to-rn/scripts/audit-styles.mjs \
  --spec <extractDir>/.build/<screen>.spec.json --dir <screenDir> --config <config> --json
```

Every MISMATCH / MISSING PROP / MISSING KEY becomes a fix item unless the spec
lists it under `deviations` / `dropped`.

## 2. Visual check (only if a device is already running)

Skip this whole section — and say so — if `config.verify.simulator` is `false`,
or `list-devices` shows no booted iOS simulator / running Android emulator.
**Never** boot a device, start Metro, build, or install the app. The user runs
those.

1. Navigate to the screen's `route.path` from the spec: `open-url` with the app's
   deep link (`<scheme>://<path>` — scheme from `app.json` `expo.scheme`; in Expo
   Go use `exp://127.0.0.1:8081/--/<path>`). If deep linking fails, use
   `describe` / `debugger-component-tree` to find and tap the way there — never
   tap coordinates read from a screenshot.
2. `screenshot` with `scale: 1` (note the saved file path; also look at it).
3. Device-width reference — render once if missing:
   ```bash
   node .claude/skills/react-design-to-rn/scripts/render-reference.mjs --extract <extractDir> \
     --only <screen> --width <device width in points, e.g. 393> --height <points> --unclamp \
     --out <extractDir>/ref-device --no-computed
   ```
4. Diff (crop the device status bar and, for tab screens, the tab bar — use
   `config.verify.cropActual`, adjust if the screenshot shows otherwise):
   ```bash
   node .claude/skills/react-design-to-rn/scripts/diff-screens.mjs --ref <extractDir>/ref-device/<screen>.png \
     --actual <sim.png> --crop-actual <t,b> --out <extractDir>/.build/<screen>.diff.png --json
   ```
5. **Look at both images side by side** (`ref-device/<screen>.png` and the
   simulator screenshot) and at the diff bands. Pixel % is a guide only — fonts
   antialias differently; judge layout, spacing, sizes, colours, missing or
   extra elements, wrapping/truncation, icon shapes.
6. Optionally check up to 2 sub-states from `spec.states` that a single tap
   reaches (e.g. a sheet), using `describe` to find the trigger.

## 3. Write `<extractDir>/.build/<screen>.fixes.md`

```
# <screen> — fidelity round <n>
verdict: pass | fix | needs-review
audit: <matched>/<checked> · mismatch <n> · missing <n>
visual: <mismatch %> (device <name>) | skipped: <reason>

## Fixes (most visible first)
1. [high] <styleKey or component> — <what is wrong> → <exact change, e.g. paddingVertical scale(12)→scale(9); add numberOfLines={1}>
2. [med] ...
## Not fixable here / for the user to judge
- ...
```

Each fix must name the file or style key and the concrete new value. No vague
items ("spacing looks off"). Verdict `pass` when there are no high/med items
and (if measured) mismatch ≤ `config.verify.maxMismatchPct`. On round 2,
anything still open that is not clear-cut → `needs-review`.

## Reply

Only the verdict line, the audit/visual lines and the numbered fix titles
(one line each), then `fixes → <path>`.
