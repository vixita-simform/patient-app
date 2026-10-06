# Reading budget

The canonical version of this table. `SKILL.md` and both agents point here
instead of restating it — read it once at the start of a session, not on every
screen.

## Why this is worth reading, not skimming

An unbounded read still produces an answer, so overspending is invisible
unless something polices it. A first run of `html-design-analyzer` spent
~250k tokens on a *single screen* by reading whole files instead of scoped
slices. The `design-guard` PreToolUse hook now blocks the expensive reads
listed below — if it fires, take the alternative it names rather than routing
around it. That hook is the actual enforcement; this table is what lets you
avoid tripping it in the first place.

## The budget

| Source | Read | Never |
| --- | --- | --- |
| `screens/<NN-Screen>.png` | **always, before the markup** — one image, and the only source produced by running the design rather than parsing it | skipping it because the text sources "look consistent" — when the markup is stale they are consistently wrong |
| `apps/mobile/design/.extracted/inventory.json` | whole — always first, it is the index | — |
| `screens/INDEX.md` | whole — the screen tree, cheaper than `ls` plus guesswork | — |
| `styles/rn/<NN-Screen>.json` | whole, for **your** screen — this is the CSS, already translated | another screen's slice |
| `screens/<NN-Screen>.facts.json` | whole, for your screen | all of them |
| `styles/rn/chrome-<role>.json`, `chrome/<role>.html` | whole, for the region you are building | — |
| `styles/component-candidates.json` | whole, in phase 2 only — it's already the mined, cross-screen aggregate | re-deriving it by opening every screen; nothing should ever do that by hand |
| `styles/tokens.json` | whole, in phase 1 only — it is the token gate's input | in phase 2/3; the compiled styles already name the token |
| `styles/typography.json`, `styles/tokens.tiers.json` | whole, in phase 1 only | — |
| `styles/tokens.css` | whole, it is small — but prefer `styles/tokens.json` | — |
| `styles/app.css` | **nothing — it is already compiled to `styles/rn/`** | always |
| `screens/*.jsx` | only your screen's line range | whole (20-30 components each) |
| `screens/*.html` (inline-style export) | whole — phase 0 already split it to one screen | — |
| `scripts/app.js` (inline-style export) | only the functions named by your screen's `renderFns` (inventory) or `handlers` (facts) | whole (a real one runs ~3000 lines) |
| `config.json`, `config.local.json` | whole — both are small | — |
| `apps/mobile/CLAUDE.md` | only the `## The Golden Rules` section (grep the heading, read to the next `##`) | whole — everything past that section is unrelated to this flow |
| existing components barrel + the 2-3 you might reuse | whole | every component in the project |
| `apps/mobile/design/*.html` (the raw design source), `vendor/*` | never, once it's over ~200 KB — `design-guard` gates on actual size, not just the path, so a small companion file (a token-preview page) isn't blocked | always, above that size |

## The stylesheet is not a source any more

Phase 0 translates every CSS rule to React Native — `scale()`-wrapped lengths,
theme-key colour expressions, expanded and re-collapsed shorthands, shadow
objects with an Android `elevation`, resolved `calc()` sums — and writes each
screen only the rules its own class names reach. Reading `app.css` to
re-translate a rule by hand is not just expensive, it is *worse*: it reintroduces
exactly the transcription errors the compile step removed.

If a value looks wrong, fix `scripts/lib/css-model.mjs` and re-run phase 0. Do
not patch around it per screen.

## Finding a range instead of reading for one

```bash
grep -n 'const WelcomeScreen' apps/mobile/design/.extracted/screens/10-*.jsx
grep -n '^## The Golden Rules' apps/mobile/CLAUDE.md
grep -n 'function renderJoblist' apps/mobile/design/.extracted/scripts/app.js   # from screens[].renderFns
```

Then `Read` with `offset`/`limit`. `inventory.json` `screens[].components` tells
you which file declares what, so you never grep blind.

## Verify what you were handed

A list of selectors or a screen's component set — handed to you by the user,
by another agent, or by this prompt — may be wrong. On the first port of this
flow, four selectors named as belonging to one screen actually belonged to
sibling screens in the same file. Trust the render tree you actually read,
not a summary of it.

**Getting it right the first time is the real saving.** A second pass costs
more than any amount of careful reading up front, which is what
`references/known-traps.md` is for — read it before writing styles, not after
the audit fails.
