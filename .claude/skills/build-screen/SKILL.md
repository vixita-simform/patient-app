---
name: build-screen
description: Convert one extracted HTML design screen into a production-ready React Native module + route, orchestrated across three subagents so the heavy design sources are read once, off the main thread.
argument-hint: "<screen> — an id or name from design/.extracted/inventory.json screens[] (e.g. p-twofa, Twofa, twofa)"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
  - Skill
user-invocable: true
disable-model-invocation: true
---

Build the React Native screen for `$ARGUMENTS` from the extracted design.

**You are the orchestrator, not the builder.** The work is split across three
subagents so that the expensive reads happen once, in a context that is thrown
away afterwards.

| Stage | Agent                   | Model         | Reads (expensive)                                          | Returns to you (cheap)                    |
| ----- | ----------------------- | ------------- | ---------------------------------------------------------- | ----------------------------------------- |
| 1     | `design-screen-spec`    | opus/high     | screenshot + markup + facts + compiled RN styles (~130 KB) | a ≤40-line Digest + a spec file on disk   |
| 1′    | `design-reuse-scout`    | sonnet/medium | `src/components`, `src/theme`, routes, strings             | a path + counts (cached; usually skipped) |
| 2     | _you_                   | —             | the Digest only                                            | the plan                                  |
| 3     | `design-screen-builder` | sonnet/medium | the spec file + inventory + screenshot                     | files written, reuse decisions            |
| 4     | _you_                   | —             | filtered audit + tsc output                                | the verdict + handoff                     |

The models are set in each agent's frontmatter. Opus reads the design; Sonnet
writes the code from an already-verbatim spec.

**Two verification stages were removed on purpose.** There is no
`design-fidelity-review` agent and no simulator Gate B — the user runs the app
and judges fidelity themselves. Stage 4 is a single in-thread check over tool
output only; it never re-reads the codebase or the design. Do not reintroduce
either stage, do not launch a simulator, and do not open `argent`. If a screen
needs a deep fidelity review, the user asks for it explicitly.

Because nothing automated looks at the rendered screen, **Stage 4's handoff is
load-bearing**: the user can only check what you tell them to look at.

## Hard budget rules — these are what make the split worth anything

- **You never read** `screens/*.html`, `*.facts.json`, `styles/rn/*.json`,
  `inventory.json` whole, `styles/app.css`, or
  `design/sofia-mobile-app-v2-standalone.html`. Delegating a file and then
  reading it yourself costs more than not delegating at all.
- From the spec file you read **section 0 (Digest) only**:
  `sed -n '/^## 0\. Digest/,/^## 1\./p' design/.extracted/.build/<Name>.spec.md`.
  The spec is capped at 250 lines; a Digest ending in `over cap:` means the spec
  agent judged the screen too dense to fit. Pass that line through to the user —
  it is the earliest signal that a screen is bigger than the pipeline assumes.
- Never read a `docs/claude/*.md` or `src/theme/*` file "for context". The
  agents open the one rule they need.
- Don't ask an agent to paste back what it wrote to disk. Pass paths, not
  contents — that is the whole mechanism.
- Do not restate these rules to the user. Report decisions, diffs and findings.

## Stage 1 — resolve, then dispatch spec + scout in parallel

Resolve the target (cheap, in-thread):

```bash
python3 -c "
import json
q='$ARGUMENTS'.strip().lower().removeprefix('p-')
d=json.load(open('design/.extracted/inventory.json'))
m=[s for s in d['screens'] if q in (s['id'].lower(), s['name'].lower())] \
  or [s for s in d['screens'] if q in s['id'].lower()]
print(json.dumps([{k:s.get(k) for k in ('id','name','file','factsFile','styleFile',
  'screenshot','role','parent','tab','flow','title','subtitle','dynamic',
  'staticMarkup','renderStatus','renderFns')} for s in m], indent=1))"
mkdir -p design/.extracted/.build design/.extracted/maps
```

No match → _Screen not in the extract_, below.

Then run **both** staleness checks. Each one can delete an entire agent run, and
the second is the more valuable of the two on any screen you have touched before.

**Is the spec already current?** A spec is a pure function of three files on
disk. If none of them has changed since it was written, regenerating it buys
nothing and costs the most expensive agent in the pipeline:

```bash
SPEC=design/.extracted/.build/<Name>.spec.md
[ -f "$SPEC" ] && find <file> <factsFile> <styleFile> -newer "$SPEC" -print -quit \
  || echo STALE
```

Silent output → **skip Stage 1's spec agent entirely.** Read the Digest off disk
with the `sed` command in the budget rules and go straight to planning. This is
the normal case for a rebuild, a repair, or a second pass at a screen, and it
saves roughly 13k tokens of reads plus the spec's own Opus output.

Prints a path, or `STALE`, or the screen was re-extracted → dispatch the spec
agent as usual. Never patch an out-of-date spec by hand; regenerate it.

**Is the project inventory stale?**

```bash
INV=design/.extracted/.build/project-inventory.md
[ -f "$INV" ] && { find src/components -mindepth 1 -maxdepth 1 -type d -newer "$INV" -print -quit; \
  find src/app src/constants/NavigationRoutes.ts src/theme -newer "$INV" -print -quit; } \
  || echo STALE
```

That deliberately ignores edits _inside_ an existing component: the inventory
records what exists and what props it takes, so only a new component, a new
route, or a theme change can invalidate it. Rebuilding it because someone
reformatted a file is the single easiest way to waste a whole agent run.

Then dispatch whatever survived the two checks, **in one message** so they run
concurrently, and do not narrate while you wait:

- `design-screen-spec` — only if the spec check said so. Pass every resolved
  field verbatim plus the output path
  `design/.extracted/.build/<Name>.spec.md`.
- `design-reuse-scout` — only if the inventory check printed something. An
  unchanged design system means the cached inventory is still correct, and this
  is the stage you skip on most screens.

Both cached is the cheapest possible run: no Stage 1 at all. Say which caches
you reused in one line, so the user can invalidate one if they know better.

### Gate 0 — build the real screen

Gate 0 lives on the Digest's first line, whether the spec was just written or
read from cache. If it says `BLOCKED`, the extracted markup is a complete,
plausible, superseded
screen — stop and either render it:

```bash
node .claude/skills/html-design-to-rn/scripts/render-dynamic-screens.mjs \
  --extract design/.extracted --cdp-port <port> --config .claude/html-design-to-rn/config.json
```

This has three prerequisites, and it fails in confusing ways without them.
Check them before running, not after:

1. **node 22** — the script needs it; a default `node` on this machine may be
   older. Use the nvm bin directory directly rather than assuming `PATH`.
2. **An unsandboxed Chrome** with `--remote-debugging-port=<port>`. A sandboxed
   launch connects and then renders nothing.
3. **The first CDP page target must be navigated to the design** yourself — the
   script attaches to it, it does not open the file.

If any of the three cannot be met, stop and say which one. Do not retry the
command hoping for a different result.

With no Chromium target available, tell the user, and proceed only after
they accept a source you name explicitly (the `renderFns` body in
`design/.extracted/scripts/app.js`, grepped — never read whole). Never let a
built screen imply a fidelity its source could not support.

## Stage 2 — plan (you, from the Digest)

Post a short plan: layout tree in one block, which existing components/tokens
cover it, what genuinely must be created, where the route lands, and every open
question. Take the reuse candidates from the inventory file — grep it, don't
read it whole.

**An unanswered BLOCKING question is a hard stop.** Ask every open question
together, in one round trip — never one at a time.

An overlay does **not** raise a library question. This project ships
`@lodev09/react-native-true-sheet`, wrapped by `src/components/custom-bottom-sheet/`
(`CustomBottomSheet`) and `src/components/side-panel/` (`SidePanel`); the
`true-sheet` skill covers the library itself. Reuse those. The only overlay
question worth a round trip is **project-level or module-level** — a sheet used
by one screen lives in that module's `components/`, one used by several is
promoted to `src/components/`. If the answer is obvious from the plan, decide it
and say which you chose.

## Stage 3 — build

Dispatch `design-screen-builder` with: the spec path, the screenshot path, the
inventory path, your plan, the answers to every question, and the target module
group + route. It writes the module, the route, the registrations, the strings,
and `design/.extracted/maps/<Name>.json`.

## Stage 4 — check, then hand off

Both tools print far more than you need. **Filter at the shell, never in your
context** — write the raw output to a file, pull out the counts and the lines
that survive the known-structural filter, and read only those.

```bash
N=<Name>
node .claude/skills/html-design-to-rn/scripts/audit-styles.mjs \
  --map design/.extracted/maps/$N.json --extract design/.extracted \
  --theme light --colors src/theme/Colors.ts > /tmp/audit-$N.txt 2>&1
echo "TOTAL: $(grep -c '  ✗' /tmp/audit-$N.txt) failures"
grep '  ✗' /tmp/audit-$N.txt \
  | grep -vE 'fontWeight: expected .*got undefined|got (undefined|0)$|borderRadius: expected 50%, got 9999' \
  | head -40
```

That `grep -v` is the structural filter, and each pattern has a reason:

- `fontWeight … got undefined` — weight lives in `fontFamily`
  (`SFProText-Bold`) via `TextStyles.ts`, so the key never exists.
- `got undefined` / `got 0` — one CSS rule split across a shared component plus
  a local style; the audit cannot see composed styles.
- `borderRadius: expected 50%, got 9999` — `Radius.radiusFull` is the project's
  documented fully-rounded sentinel.

Typecheck the same way — the repo has pre-existing errors, so scope the report
to what this build touched and count the rest:

```bash
npx tsc --noEmit > /tmp/tsc-$N.txt 2>&1
echo "TSC: $(grep -c 'error TS' /tmp/tsc-$N.txt) total"
grep 'error TS' /tmp/tsc-$N.txt | grep -E 'modules/<module>|app/.*<route>' || echo "none in new files"
```

A `TS2345` in `src/app/(protected)/(tabs)/_layout.tsx` right after adding a
`ROUTES` value is the known Metro `router.d.ts` lag, not a defect — name it as
such and move on.

Fix anything that survives if it is a small edit; dispatch
`design-screen-builder` in repair mode if it is not. **One repair pass**, then
hand what is left to the user with what was tried.

Then walk `CLAUDE.md`'s Post-Implementation Checklist against the builder's file
list yourself.

### The handoff — the last thing you write

The user verifies fidelity by running the app. Nothing automated has looked at
the rendered screen, so close with exactly this, and nothing longer:

1. **`AUDIT: <n> failures, <k> structural, <n-k> real`** and **`TSC: <n> errors,
<j> in new files`** — the numbers, verbatim, failures included. Never
   compress a failing audit into "mostly fine".
2. **The route to open**, as a path.
3. **What to look at** — max 5 bullets, and only things the audit structurally
   cannot see: layout order, spacing rhythm, a missing element, an interaction,
   anything the spec left ambiguous or you decided by judgement.
4. **Accepted deviations**, if any, each with its one-line reason.

No file-by-file narration, no restating the plan, no summary of what the
subagents said. The diff is on disk; the user reads code faster than prose.

## Accuracy rules that outrank the budget

Cheaper is not the goal; cheaper _at the same fidelity_ is. Three rules exist to
keep the compression honest, and none of them may be traded away:

1. **Verbatim, not paraphrased.** The spec copies `style.*.expr` strings and
   `texts` character-for-character. A value the spec agent "cleaned up" is a
   value the builder will get wrong with no way to notice.
2. **The screenshot outranks every text source**, at every stage. Markup, facts
   and compiled styles derive from the same file and are wrong together when it
   is stale. Both the spec agent and the builder open the PNG.
3. **Never report fidelity you did not measure.** With no reviewer and no
   simulator gate, the builder's own account is the only narrative you have —
   and it is not evidence. Claim only what the audit and `tsc` actually showed;
   everything else is for the user to see on device.

If a stage cannot be run, say so. A skipped stage reported as passed is worse
than the token cost it saved.

## Screen not in the extract

Some screens exist only inside the root HTML — reachable through a flow, an
opener function, or a dynamic region the extractor never captured as its own
`screens[]` entry. When the resolver returns nothing:

1. **Check the invocation for a route to the screen.** If the user described how
   to reach it ("the sheet from the Job detail's Share button", "step 3 of
   onboarding", "the filter panel on Customers"), that path is the spec.
2. **Grep `app.js` inline — do not delegate this to `design-screen-spec`.**
   That agent is designed for per-screen extracted files; its design-guard hook
   blocks the 908 KB root HTML. Instead, run in-thread:

   ```bash
   # find the entry-point id and its opener handler
   grep -n '<entry-id>' design/.extracted/scripts/app.js | head -20
   # follow the handler to the markup it emits
   grep -n '<handler-fn>' design/.extracted/scripts/app.js | head -40
   ```

   Cross-check `design/.extracted/dynamic-regions.json` and
   `design/.extracted/styles/rn/_global.json` / `styles/tokens.json` for compiled
   token values. Collect the markup, class names, and resolved tokens inline; then
   dispatch `design-screen-spec` with that extracted content as `staticMarkup`
   (and `styleFile` pointing at `styles/rn/_global.json`) so Stage 1 processes
   pre-grepped data rather than re-opening the root HTML.

3. **If the user gave no path**, do not hunt. Report the resolver's near misses,
   name what was searched, and ask how the screen is reached. That one question
   is cheaper than a wrong screen.

Everything downstream is unchanged, except that the map file's selectors come
from rules resolved by hand and there is no screenshot. Say so in the handoff —
`no design screenshot; built from <the source you named>` — so the user knows
their own check is against the HTML in a browser, not a reference image.

## Missing design

When the extracted screen exists but is not enough, the spec agent resolves it
in this order and records which source it used — stop at the first answer, never
guess while a source is unread:

1. Another extracted screen with the same pattern (grep the class across
   `design/.extracted/screens/*.facts.json`).
2. The matched region of the root HTML (grep, never read).
3. An existing RN implementation in `src/components/` or `src/modules/`.
4. Only then decide — and say what was decided and why.

## Fallback

If subagent dispatch is unavailable, run the same four stages inline in this
thread, in order, honouring every budget rule above. The stages are the method;
the agents are only where the reading happens.
