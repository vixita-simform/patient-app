---
name: html-design-to-rn
description: "Use when implementing a React Native UI from an offline HTML design file — a self-contained bundle or plain HTML carrying the app's screens, CSS custom-property tokens and both themes. Runs five gated phases: extract, design system, base components, per-screen implementation, and a two-gate verification. Replaces the Figma MCP workflow."
argument-hint: "[phase] — extract | system | components | module [<name>] | screen <Name> | verify [<Name>|all]"
---

# HTML Design → React Native

The design source is code, not pixels. An offline HTML design carries exact hex
values, exact pixel values and an exact element tree, so fidelity here is a
deterministic extraction problem. Never transcribe a value by eye when you can
read it.

## The one rule that makes this work

**Never read the design HTML into context.** The file is megabytes of base64.
Run the extractor once, then read `inventory.json` and the scoped slices it
points to. A phase that opens the original HTML has already failed.

A `design-guard` PreToolUse hook enforces this and the reading budget in
`references/reading-budget.md`. If it blocks you, it names the cheap
alternative — take that, do not work around it.

## Reading budget

Cost here is invisible: reading too much still "works", it just spends ten times
the tokens and crowds out the context you need to be accurate. The one rule that
matters most: never read `inventory.json` for anything but the index, never read
`app.css` or a `screens/*.jsx` file whole, never read `CLAUDE.md` past its
`## The Golden Rules` section. Full table, rationale and grep recipes are in
`references/reading-budget.md` — read it once per session, not once per screen.

## Config contract

Two files, in **this project's own repo** at
`${CLAUDE_PROJECT_DIR}/.claude/html-design-to-rn/` — not inside this plugin's
own install directory. A plugin's files live in a shared cache that gets
replaced on every update and isn't specific to any one project; facts about
*this* repo have to live in *this* repo instead, or the second project that
installs this plugin would inherit the first project's answers.

They answer two different questions, and only one of them is safe to share.

**`config.json`** (committed) — durable, auto-detectable facts about *this repo*:

| Key | Meaning |
| --- | --- |
| `source.extractDir` | Where phase 0 unpacks the design (gitignored) |
| `project.*` | Paths and idioms of the target repo — router, dirs, theme files, `scaleFn`, `themeHook`, `formLibrary`, an optional `legacyColors` map for a pre-existing placeholder palette |
| `verify.*` | Viewport, pixel threshold, themes, platform |

If `${CLAUDE_PROJECT_DIR}/.claude/html-design-to-rn/config.json` is missing,
detect these values from the repo, write the file, show it to the user, and
**wait for confirmation** before running any phase. A config nobody has
confirmed is a guess about where to write code.

**`config.local.json`** (gitignored — add
`.claude/html-design-to-rn/config.local.json` to `.gitignore` if it isn't
already) — the one fact that is *not* a repo-wide constant: `source.designFile`,
the path to the HTML design source. It differs per teammate and per design drop,
so it is asked once, written here, and never asked again — but never committed,
and never baked into this plugin's own files. This is what makes this plugin
installable unchanged into any repo: the only things that differ per repo are
these two small project-local files, one of which nobody shares, and neither of
which ships with the plugin itself.

If `config.local.json` or its `source.designFile` key is missing, **ask the user
where the HTML design file is**, write the answer here, and proceed — do not
guess a path and do not re-ask once it's recorded.

An optional `source.screenSelector` (`"tag.class"`, e.g. `"section.page"`) in
`config.json` overrides phase 0's guess at which repeated element is a screen
in an `inline-style` export — durable per repo like the rest of `config.json`,
since it describes the export tool's convention, not a per-drop fact.

Two more optional `source.*` maps in `config.json`, read by
`render-dynamic-screens.mjs` (`--config <config.json>`) rather than phase 0:
`renderOverrides` and `regionRenderOverrides`, each `{ "<screen-or-region-id>":
{ "fn": "...", "prepare": "..." } }` for the screens/regions whose render
function needs a selected record or prior navigation state to render
meaningfully — see that script's own section below for the shape and a worked
example. Durable per repo, same reasoning as `screenSelector`: which detail
screen needs which call is a fact about the export's own code, not a per-drop
one.

### A note on `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PLUGIN_ROOT}`

This file uses `${CLAUDE_SKILL_DIR}` for its own bundled scripts — that's the
variable Claude Code documents for a skill referencing its own sibling files,
and it resolves correctly whether this skill is installed standalone or inside
a plugin. The agents and commands that ship alongside this skill instead use
`${CLAUDE_PLUGIN_ROOT}/skills/html-design-to-rn/...`, because they're separate
plugin components reaching into this skill's directory from outside it. If you
ever see either variable name appear **literally, unsubstituted**, in a command
you're about to run, don't run it as-is — resolve the real path first (`/plugin`
or `claude plugin list` shows the install directory) and substitute it by hand.

## Phase 0 — extract

```bash
node ${CLAUDE_SKILL_DIR}/scripts/extract-design.mjs \
  "<config.local.json source.designFile>" --out "<config.json source.extractDir>" \
  [--screen-selector "tag.class"] [--scale-fn <config.json project.scaleFn>]
```

Detection is by content, never by filename, and produces one of two shapes:

- **`bundler-v1`** (a `__bundler/manifest` payload) — `index.html`,
  `styles/tokens.css`, `styles/app.css`, `screens/*.jsx`, `assets/`, `maps/`.
  Screens carry `components` (the file's top-level PascalCase declarations).
- **`inline-style`** (a plain HTML export — one or more `<style>` blocks,
  repeated sibling elements sharing a class as the screens) — the same
  `index.html`/`styles/*`/`maps/`, plus `screens/*.html` (each screen's own
  markup, not JSX) and, when the export carries one, `scripts/app.js` — the
  shared navigation/state script, written whole because splitting it per
  screen needs real JS analysis this extractor doesn't attempt.

### What phase 0 writes, and which phase reads it

`inventory.json` is an **index**: counts, roles, and pointers. The bulk lives
in the files it points at, so a phase pays only for what it uses.

| File | Read by | Holds |
| --- | --- | --- |
| `inventory.json` | every phase | screen index (role/parent/title/counts), chrome index, fonts, `navigation`, `capabilities`, pointers |
| `screens/INDEX.md` | planning | the screen tree as prose — read this instead of `ls screens/` |
| `styles/tokens.json` | phase 1 | every token classified, the companion tier map, and the typography scale |
| `styles/rn/<NN-Screen>.json` | phase 3 | **the screen's CSS already translated to RN** |
| `styles/rn/_global.json` | phase 1/2 | element-level resets every screen inherits |
| `styles/rn/chrome-<role>.json` | phase 2 | one shell region's translated CSS |
| `screens/<NN-Screen>.facts.json` | phase 3 | that screen's texts, sections, inputs, actions, inline styles |
| `chrome/<role>.html` | phase 2 | the shell region's markup |
| `CHANGELOG.md` | planning, after a re-extraction | what changed since the previous run — see "Incremental extraction" below |

**Never open `styles/app.css` or a `screens/*.html` to read values.** The
translation is done; re-deriving it by hand is how a port drifts.

### Screen roles — the count that matters

A flat "92 screens" is a lie about the design. Phase 0 recovers the export's
own navigation model — its route-meta table (including later `META.x = {…}` and
`Object.assign(META, {…})` extensions), its tab-bar markup, its history-stack
calls — and gives every screen a `role`:

| `role` | Meaning | How to plan it |
| --- | --- | --- |
| `tab` | A tab-bar destination | A route in the tab navigator |
| `child` | Pushed on top of a parent (`parent`, `depth`, `tab` all set) | A stack route under its parent's tab |
| `flow` | A step in a linear sequence (`flow.steps`, `flow.step`) | One flow, built together — not N unrelated screens |
| `unlinked` | Deep-linked or no trigger found | Ask before assuming it is dead |

`parentSource` says how each parent was established (`route-meta` >
`nav-trigger` > `tab-bar`). A screen with more than one candidate parent is
reported in `navigation.ambiguous` and left flat — never guessed into a tree.

Screens also carry `title`/`subtitle` (the design's own header text, straight
from the route-meta table — do not re-invent copy) and `renderFns` (the
behaviour-script function that fills a runtime-rendered screen).

### `dynamic` means "the HTML is not what renders"

`dynamic: true` whenever a render function assigns to the screen's id, however
much markup the export ships for it. `staticMarkup` says which kind:

| `staticMarkup` | The extracted HTML is | Danger |
| --- | --- | --- |
| `authoritative` | what renders | none |
| `empty-shell` | `<section id="p-x"></section>` | obvious |
| `stale-overwritten` | a complete, plausible, **superseded** screen | silent |

The third case is why the old "under ~30 characters of inner content" test was
not enough. `p-signin` shipped a full sign-in form that `renderSignin()`
replaced at load with a different screen entirely; `p-dashboard` and
`p-joblist` — two of four tab destinations — were the same. Facts, compiled
styles and texts are all derived from that same stale file, so they agree with
each other and are wrong together. Phase 0 prints every `stale-overwritten`
screen by name; **never describe, plan, or identify a screen from a file whose
`renderStatus` is not `rendered`.**

### Chrome is not screens

The app shell around the screens — status bar, header, tab bar, bottom sheet,
scrim, drawer, toast — is found positionally (siblings of the screen container),
not by name, and written to `chrome/`. These are **phase 2 components**, and
building them first is what makes every screen after that cheap.

### Dynamic regions — sub-views a screen or chrome repaints, not a screen itself

Not every `getElementById(id).innerHTML=` in `scripts/app.js` targets a whole
screen — some target a sub-region *inside* an already-known screen or chrome
region: a tab body, a list refresh, a stage pill. These are invisible to both
`extractScreenSections` (not a `.page`) and `extractChrome` (not a positional
sibling of the screen container), so phase 0 scans for them separately and
records the result in `inventory.dynamicRegions` (index) and
`dynamic-regions.json` (detail): each target's `renderFns`, a best-effort
`calledBy` (analogous to `reachedBy` — never resolved down to the exact tap),
and its `owner` — the screen or chrome region whose own static markup contains
an element with that id, found positionally like `extractChrome` itself.

Phase 0 itself is **detect + report only** — `ownerKind` here is resolved
against the still-*unrendered* markup this phase just wrote, so a region owned
by a `dynamic: true` screen routinely reads `unresolved` at this point even
though the screen's real, rendered markup plainly contains it (the container
simply didn't exist yet in the empty shell phase 0 scanned). `ownerKind` is one
of `screen` (folded into that screen's own `facts.json`), `chrome` (folded into
`inventory.chrome[]` — already covered, not a new gap), `container` (belongs to
the shared wrapper every screen sits in, e.g. a scroll reset — rarely worth
planning around), `unresolved` (the id appears in no extracted markup at all —
yet; see below), or `ambiguous` (the id repeats across more than one screen —
never guessed at which one owns it).

`render-dynamic-screens.mjs` (below) re-resolves this ownership against each
screen's real, rendered markup, and then **live-renders** whichever
`ownerKind: "screen"` region is still an empty container — the actual gap this
closes: a screen that is itself `dynamic: false` (its own markup already
authoritative — nothing in `render-dynamic-screens.mjs`'s screen sweep ever
touches it) can still ship one or more empty sub-containers that only a
behaviour-script function fills at runtime (`p-job`'s `modGrid`/`msgPreview`/
`recentPhotos`/`jobNotes`/`jobActivity`, on the first real sample — none of
them the screen itself, all invisible until this pass). `ownerKind: "chrome"`
stays report-only permanently — already covered by `inventory.chrome`, and a
region like a shared bottom-sheet body with twenty-plus mutually exclusive
render paths has no single "default" state worth rendering cold.

  ### Populating `dynamic: true` screens

  A near-empty shell is a poor planning source — `render-dynamic-screens.mjs`
  replaces it with the screen's real, live-rendered markup **and** a
  screenshot, driving an already-running Chromium (CDP) target the same way
  `capture-design.mjs` does for Gate B:

  ```bash
  node ${CLAUDE_SKILL_DIR}/scripts/render-dynamic-screens.mjs \
    --extract <config.json source.extractDir> --cdp-port <port> [--config <config.json>] \
    [--screen <id>] [--fn <name-or-call>] [--prepare <js>] \
    [--region <id>] [--region-fn <name-or-call>] [--region-prepare <js>] \
    [--no-screens] [--no-regions] [--all] [--force]
  ```

  It also **regenerates that screen's `facts.json` and `styles/rn/<screen>.json`**
  from the populated markup. Phase 0 derived both from the empty shell, so a
  dynamic screen otherwise carries one `.page` rule and zero texts however much
  markup its render call produces — and phase 3 reads those two files as the
  CSS already translated.

  Two flags for a screen the bare sweep cannot reach:

  - `--fn` overrides the grep and accepts a **call expression**, not just a
    name — `--fn "openCustomer(0)"` for a detail screen whose render function
    takes an index, so it renders with a real record selected.
  - `--prepare` runs arbitrary JS first, for state a prior navigation step
    would have set: `--prepare "renderWODetail(0)" --fn "renderWOShare()"`.

  Both also accept `--config <config.json>` and a `source.renderOverrides` map
  (`{ "p-wodetail": { "fn": "renderWODetail(0)" }, "p-woshare": { "fn":
  "renderWOShare()", "prepare": "renderWODetail(0)" } }`) so the handful of
  screens that need one survive a re-extract instead of being rediscovered by
  hand every time — durable per repo like the rest of `config.json`, not
  `config.local.json`.

  A screen still empty after both is usually **dead in the shipped design**
  rather than un-renderable: check `scripts/app.js` for a later
  `fnName = function(){ … }` reassignment redirecting it elsewhere (SOFIA's
  `p-invoicepreview` — its render function was reassigned to call `openInvoiceDoc()`
  instead, so it always fills `p-invoicedoc` and never its own container, no
  matter what argument it's called with), and for zero references to its id
  anywhere in `scripts/app.js` (SOFIA's `p-staffcal` — a reserved id with no
  render function, no nav trigger, nothing). A third shape a `--fn` override
  can't fix at all: the fill target is computed at runtime through a helper
  (SOFIA's `p-jobform` resolves its container via `_fCont(){ return
  document.getElementById(window._fmode==='page'?'p-jobform':'sheetBody'); }`
  — there is no literal `getElementById('p-jobform')` anywhere in the script
  for the grep to find). Report all three shapes as dead; do not force them.

  It finds each screen's render function by grepping `scripts/app.js` for
  `getElementById('<id>')...innerHTML=` — directly, or through a local
  variable one guard-clause removed (`var el=document.getElementById(id);
  if(!el)return; el.innerHTML=...`), scoped to the same enclosing function so
  a name as common as `el` is never credited to the wrong one — not by
  guessing a function-name convention, those vary. It calls the resolved
  function and overwrites `screens/<file>` with the populated markup plus a
  cropped `screens/<file>.png`. Every screen gets one of four outcomes,
  printed and written to `inventory.json`'s `renderStatus`: `rendered` (done),
  `unresolved` (no matching assignment found at all — rare), `empty-after-render`
  (the function ran but needs state a prior navigation step would have set —
  usually a detail screen with no item selected), `error` (the function threw,
  typically the same reason). Report all four counts — a screen sitting at
  anything but `rendered` still needs the manual `scripts/app.js` read this
  section describes, same as before this script existed.

  **Re-running it only touches what still needs it.** By default the screen
  sweep skips any screen whose `renderStatus` is already `rendered` — the
  common case once a design has been rendered once, since `extract-design.mjs`'s
  incremental mode (below) carries that field forward for any screen whose
  markup didn't change. `--all` forces every `dynamic: true` screen regardless
  of status; `--screen <id>` (as before) always targets one screen explicitly
  regardless of status, since an explicit ask should always run.

  **Requires a live Chromium target** — see `references/verification.md`'s
  Gate B steps 1–3 for serving the extract and launching one; launch the
  browser binary directly rather than via `open -na` (macOS's `open` reuses
  an already-running instance of the same app and silently ignores the new
  flags, including a fresh `--user-data-dir`).

  Does **not** cover animations (the CSS rule driving one is already in
  `styles/app.css`; there's no static file for the animation itself) or a
  screen's interactive edge-case states beyond its default render — those
  need their own `--navigate` call per state, authored per screen.

  ### Populating a screen's still-empty dynamic regions

  After the screen sweep, the same run re-resolves every dynamic region's
  `ownerKind` against the screens it just (or previously) rendered — fixing
  the phase-0-time `unresolved` result described above — and then live-renders
  whichever `ownerKind: "screen"` region's container is still empty, the same
  way it renders a whole screen: call the region's render function (preferring
  one whose name looks like `render*` over a filter/toggle helper that happens
  to share the id), capture the element's real `outerHTML`, splice it into the
  owning screen's file in place, and **regenerate that screen's `facts.json`
  and `styles/rn/<screen>.json`** from the patched result — same reason as for
  a whole screen: phase 0 derived both from the container's empty state.

  A region whose container already has content is left alone by default — most
  commonly because its owning screen's own render pass already painted it (a
  screen-owned region whose `renderFns` is a subset of the screen's own
  `renderFn` was filled for free the moment the screen rendered; SOFIA's
  `dashJobs`/`jobsWrap`/`stageChips` this way). `--force` re-renders it anyway.
  `--region <id>` scopes to one region and accepts `--region-fn`/`--region-prepare`
  overrides the same shape as a screen's `--fn`/`--prepare` (and a
  `source.regionRenderOverrides` map in `config.json`, alongside
  `renderOverrides`, for the durable per-repo case). Naming a region explicitly
  this way that isn't `ownerKind: "screen"` reports an `error` rather than
  silently doing nothing.

  Not every unresolved/empty region is a bug to chase further, and the same
  three dead shapes above apply here too, one level down: SOFIA's `dashJobs`
  reads `unresolved` even after the refresh because the render function that
  built it belongs to an earlier, reassignment-shadowed `renderDashboard`
  definition, never the live one; `jobMaterials`/`jobStagePill` are
  guard-clause-protected references (`if(el) …`) to a container nothing in the
  script ever actually creates; `peJobList`/`seCustList`-shaped regions can be
  nested *inside* another dynamic region's own output (a dropdown built as part
  of a form sheet, not a screen) and only resolve once that outer piece has
  rendered too — running the sweep again after more screens resolve is the fix,
  not a `--region-fn` guess. `--no-regions` skips this pass entirely (e.g. to
  re-render one screen quickly without touching the region graph); `--no-screens`
  runs only this pass, against whatever's already on disk from a prior sweep.

  The screen-container class is a guess — whichever `tag.class` combination
  repeats across the most siblings that each carry their own `id`. When it
  guesses wrong (or there are two candidate conventions in one export), set
  `source.screenSelector` in `config.json` to `"tag.class"` and re-run; the
  extractor reports the selector it used either way, in
  `inventory.screenSelector`.

A `linked-css` export (external `<link rel="stylesheet">`) is recognised but
not yet unpackable — no real sample exists to build against. Inline the
stylesheet into a `<style>` block by hand, or treat it as a hard stop and ask.

Read only `inventory.json` and `screens/INDEX.md`.

Then report, in this order:

1. The screen breakdown by role, and the chrome regions found.
2. `inventory.fonts` — every typeface the design names. A family with
   `source: "referenced"` is **named but not shipped**: the design assumes it
   exists on the device. Say so, list the weights and sizes it is used at, and
   ask whether to source the real files into `project.assetsDir`/fonts or fall
   back to the system font with numeric weights. Do not silently pick one.
3. `inventory.capabilities` against `package.json`, the exact `npx expo install`
   command for whatever is missing, and whether a native rebuild follows.

**Stop and wait.** This phase installs nothing.

### Incremental extraction and `CHANGELOG.md`

Re-running phase 0 against an updated design source (the same file, edited —
not a different file) does not start from zero. Before writing anything, it
reads the *previous* run's `inventory.json`, `styles/app.css` and behaviour
script, and for every screen/chrome region compares a content hash of that
region's own markup (`sourceHash`, carried in `inventory.json`) against last
time:

- **Unchanged** (and `styles/app.css`/`scripts/app.js` are *also* both
  byte-identical to last run — see why below): its three files
  (`screens/<file>.html`, its `styleFile`, its `factsFile`) are **not
  rewritten** — whatever is on disk survives untouched, `renderStatus`/
  `renderFn`/`screenshot` included. This is what makes a small design tweak
  cheap: without it, every re-extraction resets every `dynamic: true` screen
  back to an empty shell, discarding an entire prior `render-dynamic-screens.mjs`
  pass over screens nobody touched.
- **Changed** (or new): written fresh, exactly as a first-ever extraction
  would — it goes back to being an empty shell if `dynamic`, and needs
  `render-dynamic-screens.mjs` run again for that screen (its `renderStatus`
  from before is gone, correctly — the old rendered content described the old
  markup).
- **Removed** (present last run, absent now): its files are deleted (the
  extract dir is gitignored scratch — nothing else will ever clean them up)
  and it's named in the changelog rather than left as a dangling reference.

**Why per-screen skipping requires the two global files to be stable too:**
`styles/rn/<screen>.json` is compiled against the *whole* `app.css`'s compiled
class table — a shared class's value can change a screen's real RN styles even
when that screen's own markup never moved a byte. Likewise a screen's
`renderFns` (whether it's `dynamic` at all) is read off the *whole*
`scripts/app.js`. So when either file changed since last run, **every** screen
is re-derived from scratch regardless of its own hash — the per-screen skip
above only ever applies when both are stable — and the changelog says so
explicitly rather than silently under-refreshing.

Every run appends one entry to `CHANGELOG.md` (newest first): added/removed/
changed/unchanged counts for screens and chrome, which ids changed and a
one-line summary of what (`texts 120→144, bytes 9200→11340`) — never a full
diff of the markup itself, which would just relocate the "megabytes of base64
in context" problem the reading budget rule exists to avoid. Read it whole
before re-planning a screen after a design update; it's the cheap way to know
which screens actually need another look instead of re-reading all of them.

### Companion files

A `design-tokens.json`, `theme.ts` or token-preview HTML sitting next to the
design source is **not** an alternative input — the HTML remains the only
source of truth, and nothing in a companion ever overrides a value extracted
from the CSS.

What a W3C DTCG `design-tokens.json` does add is the **tier structure** the
flat `:root` block throws away: which tokens are foundation, which are
semantic, and which are component-scoped (`component.button.height`). Phase 0
reads it for exactly that, cross-checks every literal against the CSS-derived
token of the same value, and records the result in `styles/tokens.json`'s
`tiers` (with `unmatchedFoundation` naming any companion value with no CSS
equivalent — report those; they mean the two files disagree). `theme.ts` and a
preview HTML are noted as present and otherwise unused.

## Modules

`inventory.modules` groups the nav tree's tabs and flows into a planning unit
larger than one screen but smaller than the whole app: a tab's module is
itself plus its entire pushed subtree; a flow's module is its ordered steps.
A screen with neither (`role: 'unlinked'`) is never forced into a module — it
is listed in `modules.unassigned` instead. Inferred only for an `inline-style`
export — a `bundler-v1` export has no nav tree to derive this from.

Every module's `name` is a suggestion, never a decision: `nameSource` says
where it came from (`tab-title`, `tab-bar-label`, `tab-id`, `flow-array-name`,
`first-step-title`, `enclosing-function`), and `nameConfirmed` is `false`
whenever that source is not real design copy — a flow's enclosing function
often names its *mechanism* (`goStep`), not its purpose, so a flow's name is
**always** unconfirmed until a human says otherwise.

Run `/design-module` to see the full breakdown and confirm/rename before
grouping `design-screen` invocations by module — it never scaffolds a
module's screens itself, same "report, then stop" gate as phase 0.

## Phase 1 — design system

Read `styles/tokens.json` (not `inventory.json` — the inventory only carries
the counts) and group `classified` by `file`. Tokens are split by the shape of
their value, because they cannot all live in one map:

| Kind | Destination | Why not `Colors.ts` |
| --- | --- | --- |
| `color` | `project.colorsFile` | — |
| `gradient` | `project.gradientsFile` as `{ colors[], start, end }` | `backgroundColor` cannot hold a gradient |
| `shadow`, `filter` | `project.shadowsFile` | CSS `box-shadow` needs iOS `shadow*` **and** Android `elevation` |
| `asset` | `project.assetsDir` | It is a file, not a style value |
| `scalar`, `font` | `project.metricsFile`, `Fonts` | Not a colour |

Names convert kebab → camel (`--gc-card-grad` → `gcCardGrad`), mechanically and
reversibly, so the auditor can map a style key back to its CSS variable.

**Gate: print the full token table — name, key, kind, light, dark, destination —
and wait for approval before writing anything.** This is the highest-leverage
review point in the flow; every later phase inherits these names.

On approval: write the three theme files, export them from the theme barrel,
install and register the typeface, rewrite the fonts barrel, and reconcile the
type scale in `project.textStylesFile`. Report any token key that renamed an
existing one.

### The type scale is given, not derived

`styles/tokens.json`'s `typography` is the design system's own semantic scale,
each entry carrying the RN name **the design itself wrote** next to the class
as a trailing comment (`.typography-body-lg{…} /* bodyLg */`), plus the style
already translated (absolute `lineHeight` in px, `letterSpacing` in px, numeric
`fontWeight`). Reconcile `project.textStylesFile` against these names. Do not
invent a name from a class name when the design supplied one, and do not
recompute a ratio line-height by hand — it is already absolute.

### Fonts

`inventory.fonts` distinguishes `embedded` (the export ships a `@font-face`,
so write the file into the fonts dir and register it) from `referenced` (named
only — the family must be sourced separately, or the port falls back to the
system font with numeric weights). Whichever way the phase-0 gate settled it,
record the decision in `config.json`'s `project.fontStrategy` so no later
screen re-litigates it. Every screen built afterward must still check its
rendered font family/weight/style against this decision and against
`project.textStylesFile`'s variants — see `docs/claude/theme.md`'s "Font Check
Against the HTML Design" section; this is not a one-time phase-1 concern.

## Phase 2 — base components

Build the **chrome regions first** — `inventory.chrome` names each one, its
markup is in `chrome/<role>.html`, and its translated CSS in
`styles/rn/chrome-<role>.json`. A header, tab bar, bottom sheet and toast that
already exist are what make every screen after them cheap.

Then read `styles/component-candidates.json` (an `inline-style` export only,
today) — phase 0 already mined it: every repeated, visually-styled element
shape across 2+ screens, with a real `screenCount`/`totalUsages`, the class
`variants` seen, and the RN `styleKeys` it reaches. This is mechanical
cross-screen counting, which is exactly what `html-design-analyzer` is *not*
scoped for — its reading budget is one screen, five files, by design (see
`references/reading-budget.md`), so asking it to "mine all the screens" has no
data source and no output shape to return. Check `renderStatus` on the screens
first: if most are still `dynamic: true` and unrendered, the candidate counts
only reflect the few static ones — run `render-dynamic-screens.mjs` and re-run
phase 0 before trusting the numbers.

Then dispatch **`html-design-analyzer`** with that candidate list (its actual
job): classify each `reuse` / `extend` / `create` against the existing
components barrel, and merge candidates whose `variants` show they're one
component (`button.btn.primary` / `button.btn.secondary`) rather than two.

**Gate: print the full mined inventory and ask the user which components to
design first — never scaffold the whole list.** Let the user pick from the
printed candidates; don't pre-select "whatever the next screen would consume"
on their behalf — that inferred scope is exactly what has produced badly-scoped
components before.

Then dispatch **`html-design-builder`** per selected component only. Shared
components go in `project.componentsDir`, never inside a module. Every
component built here is classified against `docs/claude/atomic-design.md`
(Atom/Molecule/Organism) before it's written, and — if it wraps an SVG —
follows `docs/claude/assets.md`'s "SVG Wrapper Components" section
(`width`/`height` through `scale()`, `...rest` spread onto the SVG).

## Phase 3 — screen

**One screen per invocation.** This is what lets a large port survive context
limits and lets a failed screen be retried without redoing the others.

1. Resolve the name via `inventory.screens[].components` (`bundler-v1`) or
   `inventory.screens[].id` (`inline-style`).
2. Analyzer plans from five scoped files, and nothing else:
   - `screens/<NN-Name>.png` — **open this first**; the design's own rendering,
     and the only source that is not derived from the extracted HTML,
   - `screens/<NN-Name>.html` — the markup,
   - `screens/<NN-Name>.facts.json` — texts, sections, inputs, actions,
   - `styles/rn/<NN-Name>.json` — **the CSS, already translated**: each rule's
     `style` gives the RN property, the `expr` to paste, the `css` it came from
     and the theme `token` it references; `drift` names what could not port
     (with the reason string to reuse verbatim); `unmapped` names what was
     dropped and why (a `safe-area inset` entry means `useSafeAreaInsets()`),
   - the screen's `role`/`parent`/`title`/`flow` from `inventory.json`, which
     decide where the route file goes.

   For a screen flagged `dynamic: true`, the extracted HTML is a near-empty
   shell; `renderFns` already names the function in `scripts/app.js` that fills
   it — read that function rather than grepping the id, and prefer running
   `render-dynamic-screens.mjs` first so the markup is real.
3. Builder writes the module, the route file, and `maps/<Screen>.json`:
   `{ screen, styleFile, map: [{ styleKey, selector }] }`. The `selector`
   values come straight from the compiled style file's `selector` field, so
   Gate A resolves them without hand-authoring.
4. The structural audit runs inline so a mistake surfaces on the screen that
   caused it.
5. Before reporting the screen done, walk `CLAUDE.md`'s `## Post-Implementation
   Checklist` — SVGs, accessibility, theming/brand colors, fonts vs. the
   design, naming convention, JSDoc, keyboard-controller + focus chaining (if
   the screen has inputs — see `docs/claude/forms.md`), and Atomic Design
   boundaries. Fix anything unchecked; don't just note it.

Behaviour ported here is local state and mock data — step machines, tab locking,
gate state machines. No Redux, no thunks, no endpoints. For an `inline-style`
export this behaviour usually lives in `scripts/app.js` as plain functions
keyed by DOM id rather than as JSX component state — read the relevant
functions (via `screens[].handlers`, or by grepping the screen's id) and
re-express them as RN local state, don't transliterate the DOM manipulation.

## Phase 4 — verify

Both gates, per `references/verification.md`. Gate A (structural) must pass
before Gate B (pixel) is worth running — a screen with wrong values does not
need a screenshot to tell it so.

**Gate A passing is not fidelity.** It diffs the style keys you chose to map
against the CSS those keys claim to come from, so it verifies *value*
correctness and nothing else. It cannot see layout, ordering, vertical rhythm,
a missing element, or a screen built from the wrong source — a port of stale
markup passes it with zero failures, because the values genuinely match the
stale rules. Never report a screen as done on Gate A alone: either run Gate B,
or compare the running screen against `screens/<NN-Name>.png` by eye and report
what differs. If neither happened, say `Gate B: not run` rather than letting a
green Gate A imply a fidelity it never measured.

## Drift annotations

Where React Native genuinely cannot reproduce a CSS declaration, annotate the
style key it approximates. The bracket format, the "excuses exactly one
property" rule, and why `unresolved` rows can never be annotated away all live
in `references/css-to-rn.md`'s "Drift annotation rules" section — read that,
not a paraphrase of it. Reason text for each lossy case is in the same file's
property table; use it verbatim.

## References

| File | Read it |
| --- | --- |
| `references/reading-budget.md` | Once per session — the full table and grep recipes behind the summary above. |
| `references/known-traps.md` | **Before phase 2, and before writing any style file.** Every entry cost a real debugging cycle on the first port. |
| `references/css-to-rn.md` | While translating rules — the property table and the exact annotation strings. |
| `references/verification.md` | Phase 4, both gate procedures. |

## Maintenance

The CSS→RN property table lives in `scripts/lib/css-model.mjs`, is documented
in `references/css-to-rn.md`, and is checked by `audit-styles.mjs`. Those three
must agree. When a design uses a property none of them handles, it shows up as
an `unmapped` entry in the compiled style files — fix the table once and re-run
phase 0, rather than working around it in one screen.

Tests: `node --test scripts/extract-design.test.mjs scripts/lib.test.mjs`.

## Hard stops

Stop and ask rather than deciding:

- A required dependency is missing — report the install command and whether a
  native rebuild follows.
- A token will not classify — its value shape is unrecognised; do not guess a
  destination file.
- The design implies an overlay and the `bottom-sheet-modal` skill's two
  mandatory questions are unanswered.
- `config.json` was auto-detected and not yet confirmed.
- `config.local.json`'s `source.designFile` is missing — ask, do not guess.
- An `inline-style` export has no repeated element that looks like a screen
  container (no `tag.class` shared by 2+ siblings each with their own `id`) —
  report what phase 0 found and ask for `source.screenSelector` rather than
  guessing at the export's convention.
