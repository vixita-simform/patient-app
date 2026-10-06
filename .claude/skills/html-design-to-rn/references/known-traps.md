# Known traps

Every entry here cost a real debugging cycle during the first port. Read this
before phase 2, and again before writing any style file. The tooling already
handles most of them; the ones marked **YOURS** are decisions no script can make.

## Reading the design

**Never read the packed `.html`.** It is megabytes of base64 on ~180 lines. A
`design-guard` hook blocks it. Extract once, then read `inventory.json`.

**Never read `styles/app.css` whole.** ~900 rules. Grep the selectors your screen
uses, then read that window. The guard blocks an unwindowed read.

**Never read a `screens/*.jsx` whole** when it is large. Several declare 20-30
components; `inventory.json` `screens[].components` tells you which file holds
what, and `grep -n 'const <Name>'` gives you the range.

**The class list you were handed may be wrong.** During the first port, four of
the selectors named as WelcomeScreen's belonged to sibling screens in the same
file. Verify class names against the JSX you are actually porting, not against a
summary — including one written by another agent, or by the user.

**Stale markup is worse than an empty shell, and a size heuristic cannot see
it.** A screen whose extracted HTML is a *complete, plausible* screen can still
be overwritten at load by its render function. `p-signin` shipped ~3 KB of
superseded markup — "Welcome back", a work-email field, a password field, one
button — while the live design renders "Welcome, Alex. Use the temporary
password from your invitation email…", a single temporary-password field, and
two buttons. Nothing about the extracted file looks wrong: its facts, its
compiled styles and its texts are all internally consistent and all describe a
screen that never appears. Two of the four tab destinations (`p-dashboard`,
`p-joblist`) were in the same state. The original `dynamic` test was
`inner.length < 30`, which caught only empty shells and passed every one of
these. **A screen is dynamic if any render function assigns to its id — full
stop, regardless of how much markup it ships.** `inventory.json` now carries
`staticMarkup: 'authoritative' | 'empty-shell' | 'stale-overwritten'` and
`overwritten`; phase 0 prints the stale ones by name. Never answer "which
screen is this?" from a file that is not `rendered`.

**Look at the screenshot before you build.** `render-dynamic-screens.mjs`
writes `screens/<NN-Name>.png` next to the markup, and it is the only input
that is produced by *running* the design rather than parsing it. Every
text-derived source shares the same failure mode — if the extracted HTML is
stale, the facts and compiled styles are stale in exactly the same way, and
they corroborate each other. The PNG is the independent witness. One image
read at the start of a screen is cheaper than a rebuild.

**Gate A cannot see that you built the wrong screen.** It diffs mapped style
keys against the CSS those keys claim to come from — so a screen built entirely
from stale markup passes green, with zero failures, because its values really
do match the (stale) rules they were taken from. Value-correctness and
screen-correctness are different properties; only a visual comparison against
the design's own rendering checks the second one.

**An inline-style screen flagged `dynamic: true` is not just empty.** The first
real inline-style export (SOFIA) came back with 92 screens, 84 of them
self-closed shells (`<section class="page" id="p-x"></section>`) — their actual
content is built by the shared `scripts/app.js` at runtime, not present in the
extracted markup at all. Planning or building from the empty shell produces a
blank screen with no relationship to what ships. Grep the screen's `id` and the
function names in its `handlers` list in `scripts/app.js` first — that script is
the real source for those screens, the extracted HTML is only the mount point.
`render-dynamic-screens.mjs` automates exactly this grep-and-call for the
common case (74/84 on that same sample) and overwrites the shell with the
real markup plus a screenshot — run it before planning a `dynamic: true`
screen, and only fall back to reading `scripts/app.js` by hand for whatever
it reports as `unresolved`/`empty-after-render`/`error`.

**A screenshot taken right after `.page.active` is applied is a half-faded
frame, not a bug in the crop.** The class change starts a CSS animation
(`animation:pfade var(--duration-slow)...` in this design) — a
`Page.captureScreenshot` fired immediately captures mid-transition (looked
like a rendering bug: same layout, everything at ~10% opacity). Wait out the
animation's duration first.

**`Page.captureScreenshot` returns physical pixels; `getBoundingClientRect()`
is in CSS pixels.** On any HiDPI display (`devicePixelRatio` 2 or 3, which is
most laptop screens) a crop computed directly from the rect lands in the
wrong quadrant of the image — it doesn't error, it just silently crops the
wrong region (background/bezel instead of content). Multiply the rect by
`window.devicePixelRatio` before cropping.

**`open -na "<Browser>"` reuses an already-running instance of that app and
silently ignores your new flags** — including a fresh `--remote-debugging-port`
and `--user-data-dir`. It looks like it worked (a window opens) but no new
CDP port is listening. If the user (or anything else) already has that
browser open, launch the binary directly instead:
`"/Applications/<Browser>.app/Contents/MacOS/<Browser>" --remote-debugging-port=... &`.

**"Nearest `function name(` before this position" is not "the enclosing
function."** A behavior script that monkey-patches — `go = function(page)
{...}` reassigning a function declared earlier, common in these designs —
breaks that heuristic: the reassignment's body can lexically follow some
unrelated function whose *declaration* just happens to be the closest
preceding text, even though scope-wise it isn't the enclosing one at all.
Cost a real false edge (the first hierarchy pass attributed two top-level tab
screens as children of an unrelated "messages" screen this way). A real
brace-depth scope tracker — skipping string/comment contents so a stray
`{`/`}` inside a string doesn't miscount depth — is required, not optional,
for anything claiming to find "what function contains this code."
`scripts/lib/nav-model.mjs`'s `buildScopeIndex` is that tracker; use it rather
than writing a second one.

**A JavaScript scanner that skips strings must also skip regex literals.**
`name.replace(/'/g, "")` contains a lone apostrophe. A scanner that treats it
as a string opener swallows everything up to the next `'` — hundreds of lines
— and every scope lookup after that point names the wrong function. The
symptom is subtle and plausible-looking: screens credited their render to
whichever unrelated helper happened to precede the desync (`docFind` instead
of `renderDashboard`), which reads like a bad heuristic rather than a parser
bug. Disambiguate a `/` by the previous non-whitespace character: it starts a
regex only after one of `( , = : [ ! & | ? { } ; + - * % < > ~ ^`.

**An inline `<svg>` is a real asset, not "nothing to externalise."** The
extractor catalogs every inline SVG (and `data:image/*`) into
`inventory.json`'s `assets[]`, written out as real files under `assets/`,
each with `foundIn` — the screen(s) it actually appears in. A logo or icon
referenced by a JS variable (SOFIA's `SOFIALOGO`, captured once from
`#p-signin .ob-logo svg` and re-inserted elsewhere) is *defined* in whichever
screen's markup holds the literal `<svg>...</svg>` — check `assets[].foundIn`
before concluding "no asset exists" just because the screen you're building
doesn't contain it directly. If the design keeps a named icon library behind
a small wrapper (`var ICONS = {name: "<path.../>"}`, a `ic(name, size)`
helper) the extractor matches on it and names the file `icon-<name>.svg`
instead of a counter — a plain `svg-14.svg` for something the design itself
already named is a naming regression, not a neutral default.

## CSS that does not mean what it looks like

| CSS | Trap |
| --- | --- |
| `display: flex` with no `flex-direction` | **row** in CSS, **column** in React Native. Set `flexDirection: 'row'` explicitly or the layout silently transposes. |
| `line-height: 1.3` on a container | CSS cascades it to child text. RN has **no View→Text inheritance**. Resolve it onto each Text: `1.3 × fontSize`. |
| `text-align: center` on a wrapper | Same — set it on each Text, not the View. |
| `color` on a container | Cascades into child SVG in CSS. In RN pass it as a prop to the icon. |
| `min-width: 0` | A flexbox overflow idiom. RN needs `flexShrink: 1` to get the same effect. |
| `.a .b { … }` descendant rules | May never match your element. One rule (`.splash .splash-glow`) was dead in the design itself — the markup had no `.splash` ancestor. Do not "fix" dead CSS; reproduce what renders. |
| `place-items: center` | Degenerate single-child grid → `alignItems` + `justifyContent`. |
| `white-space: nowrap` | → `numberOfLines={1}`, which also adds an ellipsis CSS would not. |
| `position: fixed` | → `position: 'absolute'`. RN has no fixed. |
| `min-height: 100%` on a scroll child | **Not** `flexGrow: 1`. In CSS this resolves against a content-sized scroll area, so a short page stays short and a `margin-top:auto` footer sits directly under the content. Adding `flexGrow: 1` to a ScrollView's `contentContainerStyle` makes the container fill the viewport instead, and that footer slams to the bottom of the screen with a large empty band above it. Port `min-height` literally and add nothing. |

## Values

**Colour alpha is load-bearing.** `rgba(146,113,33,0.12)`, `0.14` and `0.20` are
three different tokens that all collapse to `#927121` if alpha is dropped —
turning a 12% tint into a solid block. `gen-theme.mjs` emits 8-digit
`#rrggbbaa`; if you hand-write a colour, keep the alpha.

**`font-weight` alone selects nothing.** With a family like Kanit the *face*
carries the weight. `fontFamily: Fonts.semiBold` is what makes 600 render; a bare
`fontWeight: '600'` silently falls back.

**A CSS `0` on a box property is RN's default.** Do not write `marginLeft: 0` to
satisfy the auditor — it already treats absence as zero.

**Not every value has a token.** `.primary-btn`'s `box-shadow` and
`.brand-logo`'s `drop-shadow` are literals in the design's own CSS, never CSS
variables, so phase 1 correctly produces no token. Hoist them to a named
constant. **Do not invent a theme token** — that misrepresents the design system.

## Gradients and shadows

**Radial gradients are not `expo-linear-gradient`.** `react-native-svg`'s
`<RadialGradient>` does them faithfully. `Gradients.ts` keeps the CSS head
verbatim in `css` for radial layers precisely so nobody silently approximates.

**Every shadow token in this design is `inset`, and two are inset-only.** RN has
no inset shadow. An inset layer is a 1px inner-edge highlight — reproduce it with
a positioned `View`, not shadow props. The per-layer `inset` flag in
`Shadows.ts` is how you tell.

**iOS and Android both need their own shadow.** `shadowColor/Offset/Opacity/Radius`
render nothing on Android without `elevation`.

**`overflow: 'hidden'` clips your shadow.** If a gradient button needs the
overflow for its radius, put the shadow on the outer Pressable instead.

## React Native structure

**A ScrollView needs `style` *and* `contentContainerStyle`.** Without a bounded
frame (`style={{flex:1}}`) it sizes to its content, so any `flexGrow` spacer has
nothing to grow into and the last element falls below the fold. This has no CSS
counterpart and the structural audit cannot see it.

**Keys must be unique.** Placeholder copy repeats — three benefit rows all read
"Client will provide title here", so `key={title + sub}` collided on all three.
For a static list that never reorders, index is the correct key.

## The gates

**Gate A cannot see what it does not read.** It resolves `Colors[theme]?.key`
from the *generated* `Colors.ts`, not from the CSS inventory — reading the
inventory would compare the design against itself and pass regardless of what
the generator wrote. That blind spot is how the alpha bug survived a green gate.
If you add a token file, teach the auditor to read it.

**Annotations excuse exactly one property.** `// design-drift[box-shadow]: …`
covers `box-shadow` and nothing else. An unbracketed note matches nothing, so its
row still fails — deliberately.

**`unresolved` is never annotatable.** An expression the auditor cannot read is
unverified, not approximated. Rewrite it into `scale(n)`, `Colors[theme]?.key`,
or a literal.

**Never delete a row from the map to make a gate pass.** An unmapped style key is
invisible to the audit. That is the one edit that makes the gate lie.

**A clean Gate A with a failing Gate B means layout, not values.** Gate A already
proved the numbers agree. Look at flex direction, alignment, order, spacers.

## Environment

**Check what is already on your ports.** During the first port, `4173` was served
by a *different project's* directory and `8081` was another project's Metro.
Both produced confusing failures. `lsof -ti:<port>` then check the process's cwd
before assuming a server is yours — and do not kill someone else's.

**The extracted `index.html` must actually run** for Gate B. It needs `vendor/`
(React/ReactDOM/Babel) written and `window.__resources` injected, both of which
`extract-design.mjs` now does. If images render broken, `__resources` is missing.

**The design draws its own phone bezel and a mock status bar.** Diffing a raw
window screenshot compares the bezel. Use `capture-design.mjs`, which strips the
frame and captures beyond the viewport.

**Forcing the design's theme by setting `data-theme` does not stick** — its
ThemeSwitch re-asserts a stored theme. Drive the switch, or set the attribute
after the app has settled and verify it held.

## YOURS — decisions no script should make

**Check for a companion `theme.ts`/`design-tokens.json` before trusting your
own token names and scale.** Some design exports ship a hand-curated
reference implementation alongside the HTML — a `theme.ts` with intended
camelCase names and its OWN `scale()`, a W3C-DTCG `design-tokens.json` with a
foundation/semantic/component tier structure. These are reference material,
never an extraction *source* (phase 0 still reads only the design HTML — see
this skill's "Config contract" section), but they're worth a manual read
before phase 1's gate: they often reveal the design's real canvas width
(distinct from — and sometimes the actual root cause of — the guideline
mismatch in the next entry) and a cleaner semantic naming scheme than
mechanically camel-casing every CSS custom property. Reconciling an
already-shipped `Colors.ts` against one is a deliberate, scoped decision (it
renames keys real components already reference) — surface it and ask, don't
silently rename mid-flight.

**`scale()`'s guideline vs the design's canvas.** `apps/mobile/src/theme/Metrics.tsx` derives
from a **375×812** guideline; this design is authored at **393×852**. A design
pixel is therefore *not* a guideline pixel, and every ported value inflates —
about 4.9% even on a 393×852 device, 7.4% on a 402×874 one. Content overflows on
a device larger than the design.

Pick one, project-wide, before porting more screens:

1. Set the guideline to the design's canvas so `scale(n)` means "n design
   pixels". One line, changes every existing screen.
2. Convert design px by `× 375/393` at port time. Metrics untouched, every port
   carries the arithmetic.
3. Accept the inflation as intended responsive behaviour and drop the pixel
   threshold.

Whichever you choose, record it in `config.json` so the next screen does not
re-litigate it.

**Overlay implementation and placement.** `@gorhom/bottom-sheet` vs core `Modal`,
project-level vs module-level. The `bottom-sheet-modal` skill makes both
mandatory questions. The design does not decide them.

**Pagination, loader shape, empty state.** A static design cannot tell you whether
real data pages. Ask.

## Config

**`source.designFile` lives in `config.local.json`, not `config.json`.**
Looking for it in the committed file and not finding it is expected, not a
regression — it moved there deliberately so this folder stays copy-pasteable
into another repo with nothing repo-specific baked in. If `config.local.json`
is missing or untracked in `.gitignore`, that's the thing to fix, not a reason
to move the value back.

**A hardcoded placeholder palette in `gen-theme.mjs` is a regression.** Any
project-specific "legacy" or boilerplate colour set belongs in `config.json`'s
`project.legacyColors`, read by the script — never written into the script
itself. The script is meant to be identical across every repo it's dropped
into; only the config differs.

## Generated code hygiene

**A style key gets a comment only when it's a real `design-drift[...]`
annotation.** A `/** \`.selector\`. */` note documenting where a style key
came from showed up unprompted on the first run after this rule was added —
`apps/mobile/design/.extracted/maps/<Screen>.json` already carries that fact for the
auditor, so a comment repeating it in source is a second, silently-stale copy.
Delete it on sight rather than treating it as harmless.

**An annotation on an `IGNORED` property is not a finding, it's noise.**
`display`, `font-family`, `white-space`, and the rest of `references/css-to-rn.md`'s
"no RN meaning" list are never read by Gate A. A `design-drift[display]: …`
comment on one of them excuses nothing and reads like a real limitation to the
next person who opens the file. If you catch one in review, that's a signal
the drift-annotation rule was skipped, not that the property is special.
