---
name: build-rn-screen
description: Build React Native screens from specs that /generate-spec already wrote, using the design-screen-builder agent. Never generates or edits a spec. Run /generate-spec first.
argument-hint: "<screen-id> [<screen-id> ...] — required; one or more ids or names from design/.extracted/inventory.json (e.g. medicines, billing-and-payments, BillingAndPayments)"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
user-invocable: true
disable-model-invocation: true
---

Build the React Native screen(s) for `$ARGUMENTS` from their existing specs.

**You are the orchestrator, not the builder.** The spec is already on disk,
written by `/generate-spec`. This skill only plans, dispatches
`design-screen-builder`, and checks the result. It **never** dispatches
`design-screen-spec` or `design-reuse-scout`, and never writes or edits a
`*.spec.md` or `project-inventory.md`.

| Stage | Who                     | Reads                                   | Output                       |
| ----- | ----------------------- | --------------------------------------- | ---------------------------- |
| 0–1   | you                     | arguments, `spec-plan.mjs` JSON, Digest | which screens can be built   |
| 2     | you                     | Digest + greps of the inventory         | the plan + answered questions |
| 3     | `design-screen-builder` | spec + screenshot + inventory           | code on disk                 |
| 4     | you                     | filtered audit / tsc / lint output      | the handoff                  |


## Budget rules

- **You never read** `screens/*.html`, `*.facts.json`, `styles/rn/*.json`,
  `styles/app.css`, `inventory.json` whole, `design/*.html`, a whole
  `*.spec.md`, or `project-inventory.md` whole.
- From a spec, read the **Digest only**:
  `sed -n '/^## 0\. Digest/,/^## 1\./p' design/.extracted/.build/<Name>.spec.md`
- Take reuse candidates by **grepping** `design/.extracted/.build/project-inventory.md`.
- Pass paths to the builder, not contents. Never ask it to paste back a file.
- Do not restate these rules to the user.

## Step 0: arguments (required)

`$ARGUMENTS` is one or more screen ids or names, separated by spaces or commas.

**If it is empty**, do not guess. Print the usage line and the screens that have
a current spec, then stop:

```bash
node .claude/skills/generate-spec/scripts/spec-plan.mjs | python3 -c "import json,sys; p=json.load(sys.stdin); print('ready:', ', '.join(p['unchanged']) or 'none'); print('need /generate-spec:', ', '.join(e['id'] for e in p['new']+p['changed']) or 'none')"
```

> Usage: `/build-rn-screen <screen-id> [<screen-id> ...]`

Otherwise resolve every token in one call:

```bash
python3 -c "
import json,sys
d=json.load(open('design/.extracted/inventory.json'))
for q in sys.argv[1:]:
    k=q.strip().lower().removeprefix('p-')
    m=[s for s in d['screens'] if k in (s['id'].lower(), s['name'].lower())] \
      or [s for s in d['screens'] if k in s['id'].lower() or k in s['name'].lower()]
    if len(m)==1: s=m[0]; print('OK', q, s['id'], s['name'], s.get('screenshot'), s.get('role'), s.get('parent'), s.get('tab'))
    elif m: print('AMBIGUOUS', q, '->', ', '.join(s['id'] for s in m))
    else: print('UNKNOWN', q, '| all ids:', ', '.join(s['id'] for s in d['screens']))
" $(echo "$ARGUMENTS" | tr ',' ' ')
```

`UNKNOWN` or `AMBIGUOUS` → stop and show the line. Never pick one yourself.

## Step 1: spec gate

```bash
node .claude/skills/generate-spec/scripts/spec-plan.mjs --only <id,id,…> | python3 -c "
import json,sys; p=json.load(sys.stdin)
for e in p['new']: print('NO-SPEC', e['id'])
for e in p['changed']: print('STALE', e['id'], '|', e['reason'])
print('READY', ' '.join(p['unchanged']))
print('INVENTORY', 'missing' if p.get('inventoryStaleReason')=='missing' else ('stale: '+p['inventoryStaleReason'] if p['inventoryStale'] else 'ok'))"
```

- `NO-SPEC` / `STALE` → **skip that screen**: "spec missing / out of date — run
  `/generate-spec <html>` first". Do not build from a stale spec, and do not
  generate one.
- `INVENTORY missing` → stop the whole run and point to `/generate-spec`.
- `INVENTORY stale: <path>` → continue, and pass that path to the builder (Step 3).
- For each `READY` screen, read its Digest. A Gate 0 line saying `BLOCKED` →
  skip the screen and report it. An `over cap:` line → pass it to the user.

If no screen survives, report the skips and stop.

## Step 2: plan (from the Digest)

For each ready screen, decide where it lands, following this repo's layout:

- Folder: `src/screens/<id>/`, e.g. `src/screens/billing-and-payments/`. A tab
  destination uses the existing tab folder (`home`, `visits`, `records`,
  `profile`).
- Route: a stack screen is a one-line file `src/app/<id>.tsx`
  (`export { <Name>Screen as default } from '../screens';`), plus a
  `STACK_ROUTES` entry in `src/constants/Routes.ts`. The root `Stack` picks it
  up with no `_layout` registration. A tab screen re-exports from
  `src/app/(tabs)/<tab>.tsx`.
- **If the folder already exists**, say so, and ask whether to rebuild over it.

Post a short plan per screen: the layout tree in one block, which existing
components/tokens cover it (grep the inventory), what must be created (screen
component vs shared `src/components/` piece), the route, and every open question.

**Ask every BLOCKING question and every "rebuild over it?" for all screens
together, in one round trip.** An unanswered BLOCKING question stops that
screen only. The others go ahead.

## Step 3: build, one screen at a time

Dispatch `design-screen-builder` **sequentially**: wait for one to return before
starting the next. Screens share `Strings.ts`, `Routes.ts`, `Constants.ts`,
`src/screens/index.ts` and `src/assets/icons/index.ts`, and parallel writes
clobber each other.

Prompt for each builder. Paste the overrides block verbatim, because the agent's
built-in rules table describes a different project:

```
Build <Name> (<id>).
Spec: design/.extracted/.build/<Name>.spec.md
Screenshot: design/.extracted/<screenshot>
Inventory: design/.extracted/.build/project-inventory.md
<if inventory stale:> The inventory predates <path>. `ls` that one path before deciding reuse.
Plan: <the plan for this screen>
Answers: <answers to its questions>

## Project overrides: these WIN over your built-in "Project rules" and "What you write" sections
Read /CLAUDE.md "Screens", "Imports", "Styling rules", "Strings", "Constants", "Icons" once, then follow it. Summary:
- Files: src/screens/<id>/<Name>Screen.tsx (UI only, ≤300 lines), <Name>ScreenStyles.ts
  (`const styles = (theme: ThemeMode) => StyleSheet.create({...}); export default styles;`),
  use<Name>Screen.ts (navigation, handlers, effects; never returns renderItem/JSX),
  <Name>ScreenTypes.ts if needed. Pieces split out go in src/screens/<id>/components/<kebab>/
  (<Name>.tsx, <Name>Styles.ts, <Name>Types.ts) with a components/index.ts barrel; a piece two
  screens need goes in src/components/<kebab>/.
- Screen gets styles via `const { styles } = useTheme(<Name>ScreenStyles)`; wrap in `Screen`; text via `AppText`.
- Export the screen from src/screens/index.ts; route file per the plan; route names only in
  src/constants/Routes.ts (STACK_ROUTES/TAB_ROUTES); navigate with `router` from expo-router inside the hook.
- Relative imports through a folder's index.ts only (`../../theme`, `../../components`).
  NO `@/` alias, NO src/modules, NO NavigatorUtils, NO AppLayout, NO TextStyles, NO react-hook-form unless the plan says so.
- Colors[theme].<key> in style files; scale() for every margin/padding; Fonts.size.<key> / Fonts.weight.<key>.
- All copy in src/constants/Strings.ts as a `freezeStringsObject({...})` block named after the screen,
  added to the default export; reuse existing keys. Fixed value sets in src/constants/Constants.ts
  (`as const` + derived type).
- Icons: react-native-svg components in src/assets/icons/ (size, color, strokeWidth + SvgProps,
  24×24 viewBox, default color from theme.colors), exported from its index.ts. No vector-icons/PNG.
- Never put a function reference in a useCallback/useEffect/useFocusEffect dependency array.
- Still write design/.extracted/maps/<Name>.json, with styleFile = src/screens/<id>/<Name>ScreenStyles.ts.
Do not run tsc, lint or the audit. Report as your instructions say.
```

## Step 4: check, then hand off

Filter at the shell. Read only counts and surviving lines.

```bash
N=<Name>; T=$(mktemp -d)
node .claude/skills/html-design-to-rn/scripts/audit-styles.mjs \
  --map design/.extracted/maps/$N.json --extract design/.extracted \
  --theme light --colors src/theme/Colors.ts > $T/audit.txt 2>&1; echo "AUDIT EXIT: $?"
echo "AUDIT: $(grep -c '  ✗' $T/audit.txt) failures"
grep '  ✗' $T/audit.txt \
  | grep -vE 'fontWeight: expected .*got undefined|got (undefined|0)$|borderRadius: expected 50%, got 9999' | head -40
npx tsc --noEmit > $T/tsc.txt 2>&1; echo "TSC: $(grep -c 'error TS' $T/tsc.txt) total"
grep 'error TS' $T/tsc.txt | grep -E 'screens/<id>/|app/.*<id>|constants/|components/' || echo "none in touched files"
npx expo lint src/screens/<id> src/app > $T/lint.txt 2>&1; echo "LINT EXIT: $?"; grep -E 'error|warning' $T/lint.txt | head -20
```

- **Audit exit 2 means "not run"** (it needs a `jest.config.js` the repo
  doesn't have). Report `AUDIT: not run`, never "0 failures".
- Fix small issues yourself. Otherwise dispatch `design-screen-builder` in
  **repair mode** with the findings list. **One repair pass per screen**, then
  hand over what's left along with what was tried.
- Walk the builder's file list against CLAUDE.md's rules (Strings, scale,
  barrels, the 300-line limit) yourself.

### Handoff: the last thing you write

Per built screen, nothing longer:

1. `AUDIT: <n> failures, <k> structural, <n-k> real | not run`,
   `TSC: <n> errors, <j> in touched files`, `LINT: <n>`: verbatim numbers.
2. The route to open, as a path.
3. What to look at: max 5 bullets, only things no check could see (layout order,
   spacing rhythm, a missing element, an interaction, judgement calls).
4. Accepted deviations, each with a one-line reason.

Then one line per skipped screen: `<id>: <reason>`, plus the `/generate-spec`
command when the spec was missing or stale.

## Accuracy rules

- The spec is the authority for values, and the screenshot for layout. Never
  "fix" a spec value in the plan. If the spec is wrong, it gets regenerated with
  `/generate-spec <html> --only <id> --force`.
- Never report fidelity you did not measure. A skipped check is reported as
  skipped.
- If agent dispatch is unavailable, say so and stop. Do not build inline.
