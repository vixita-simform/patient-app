# CSS → React Native

The property table Gate A diffs against, and the rules for the one comment a
generated style key is allowed to carry. `audit-styles.mjs` implements this
table in code — if you change one, change the other.

## Property table

**CHECKED** — the auditor resolves the CSS value and compares it against the
real, theme-resolved RN value. A mismatch fails unless annotated (next
section).

| CSS property | RN property | Conversion |
| --- | --- | --- |
| `color`, `background-color`, `border-color`, `border-top/right/bottom/left-color` | same name, or the matching `border*Color` | resolve `var(--x)` to its literal hex/rgba via the generated theme file; compare case-insensitively, whitespace-normalized |
| `padding` / `margin` (shorthand, 1-4 values) | `padding*`/`margin*` longhand, or `paddingHorizontal`+`paddingVertical` | expand the CSS shorthand to four sides (top/right/bottom/left per the 1-4-value rule), then resolve each side's effective RN value as `style[side] ?? style[axis] ?? style[shorthand] ?? 0` |
| `padding-*` / `margin-*` (longhand) | matching `padding*`/`margin*` | direct, one side |
| `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height` | same name | `NNpx` → `scale(NN)` (ceil); a `%` string compares as a literal string |
| `border-width`, `border-*-width` | `borderWidth` / `border*Width` | `scale(NN)` (ceil) |
| `border-radius` (shorthand, 1-4 values) | `borderRadius` or the four `border*Radius` corners | same 1-4-value expansion as padding/margin, mapped to TL/TR/BR/BL |
| `border-*-radius` (longhand) | matching `border*Radius` | direct |
| `gap`, `row-gap`, `column-gap` | `gap`, `rowGap`, `columnGap` | `scale(NN)` (ceil) |
| `font-size` | `fontSize` | `scale(NN, true)` (**no** ceil — see known-traps.md's font-weight note for why typography values round differently from spacing) |
| `line-height` (a `px` value, not a bare ratio) | `lineHeight` | `scale(NN, true)` |
| `letter-spacing` | `letterSpacing` | `scale(NN, true)` |
| `font-weight` | `fontWeight` | numeric string compare (`'700'` vs `'700'`); a bare `bold`/`normal` keyword compares literally |
| `opacity` | `opacity` | direct fractional compare, never scaled |
| `flex-direction`, `align-items`, `justify-content`, `flex-wrap`, `align-self`, `flex-grow`, `flex-shrink`, `text-align` | same name, camelCased | direct string/number compare, no unit conversion |
| `z-index` | `zIndex` | direct number compare |
| `top`, `right`, `bottom`, `left` (only under `position: absolute`) | same name | `scale(NN)` (ceil) |

**CHECKED-ANNOTATABLE** — the auditor does not attempt a numeric comparison
(these have no clean 1:1 RN equivalent). If the CSS declares one, the style
key **must** carry a `design-drift[<property>]` comment naming it, or the row
fails with "needs an annotation" rather than a value mismatch.

| CSS property | Why it can't be diffed directly |
| --- | --- |
| `box-shadow` | RN's `shadow*` props are one non-inset layer; a multi-layer or `inset` CSS shadow has no numeric equivalent to compare against |
| `position: sticky` / `position: fixed` | RN has neither; the port is always a structural workaround (`marginTop: 'auto'`, a portal, etc.), not a value |
| `background` / `background-image` when it's a `linear-gradient(...)`/`radial-gradient(...)` literal | Gradients render via a component (`expo-linear-gradient` or `react-native-svg`), not a style value — nothing to numerically diff in a StyleSheet object |
| `filter`, `backdrop-filter` | No RN style equivalent; always a different component (e.g. `expo-blur`) or dropped |
| `transform` when it mixes multiple functions in one declaration | RN's `transform` array is checked structurally elsewhere in this table's spirit, but a hand-authored multi-function CSS transform is treated as annotatable rather than value-diffed here — file `known-traps.md` an entry if a project needs this diffed properly |

**IGNORED** — never read by Gate A, annotated or not. A `design-drift[...]`
comment on one of these is noise, not a finding (see known-traps.md's
"Generated code hygiene" section).

`display`, `font-family`, `white-space`, `text-overflow`, `cursor`,
`transition`, `outline`, `box-sizing`, `content`, `appearance`,
`scroll-behavior`, `user-select`, `will-change`, any `-webkit-*`/`-moz-*`
vendor-prefixed property, `animation`/`animation-*`, `visibility` (RN has no
`hidden`-but-laid-out concept — a screen either renders the node or doesn't).

## Selector grammar the map file must use

`design/.extracted/maps/<Screen>.json`'s `map[].selector` is read by
`audit-styles.mjs`, not just by a human reviewing the file — it has to parse.
Three forms:

1. **A plain CSS selector**, exactly as it appears in `app.css`:
   `.ob-h`, `.field label`, `.btn.primary`, `.inp:focus`. Looked up directly.
2. **A selector with an inline-style override**, when the source HTML carries
   a `style="..."` attribute the stylesheet rule doesn't capture:
   `.ob-logo (inline: margin-top:var(--space-6))`. The base selector's rule
   (if any) is resolved first, then the `inline:` declarations are overlaid on
   top — same precedence CSS itself gives an inline `style` attribute. Base
   selector may be empty when the element has no class of its own:
   `(inline: padding:var(--space-2) var(--space-5) var(--space-5))`.
   Multiple declarations separate with `;`. Trailing prose after a value
   (`padding:var(--space-2)..., overrides generic .page`) is tolerated —
   parsing stops at the first token after a value that isn't `property:`, but
   don't rely on that; keep the parenthetical to declarations only where you
   can.
3. **No design source**: `no design source — <reason>`. Used for a style key
   that exists only for RN-side behavior (a validation error message, a
   loading spinner's container) with nothing in the CSS to check it against.
   The auditor reports this as `SKIP`, not `PASS` — it is not evidence the key
   is correct, only that there was nothing to compare.

Anything that isn't one of these three (free prose with no `(inline:` marker
and no recognizable selector) is also reported `SKIP`, with a note to fix the
map entry — that is a map-authoring bug, not a passing case.

## Drift annotation rules

```ts
// design-drift[box-shadow]: 3-layer inset CSS shadow; RN supports one non-inset shadow
shadowRadius: scale(48),
```

- **The bracket is mandatory and excuses exactly one property.**
  `design-drift[box-shadow]` covers `box-shadow` only — it does not also
  excuse a `position` or `background` mismatch on the same key. Each drifted
  property gets its own annotation line.
- **The comment goes directly above the style key it applies to**, not above
  the one property line inside it (a `StyleSheet.create` key is one object;
  the annotation names which CSS property of that key's design source is
  drifting, not which RN line). Stack multiple annotations if a key drifts on
  more than one property.
- **`unresolved` is never annotatable.** If the auditor can't resolve a
  `var(--x)` at all (the token doesn't exist in the generated theme file),
  that's an unverified value, not an approximated one — annotating it doesn't
  make it checked, it just hides that phase 1 missed a token. Fix the token
  file instead.
- **Reuse the reason text for the same underlying case** — don't write a new
  paraphrase per call site. Known cases and their canonical wording:

  | Case | Reason text |
  | --- | --- |
  | Sticky/fixed footer or header | `CSS position:sticky has no RN equivalent; footer pinned via flex marginTop:'auto' instead of scroll-stickiness` (adjust the mechanism clause if the port used something other than `marginTop: 'auto'`) |
  | Gradient literal, no matching token yet | `linear-gradient literal, no matching Gradients.ts token — hoisted to a local constant` |
  | Gradient literal, dependency not installed | `linear-gradient literal, expo-linear-gradient not installed — flat surface color used instead` |
  | Focus/hover ring drawn with `box-shadow` | `focus ring approximated with border-color change only, outer glow not reproduced` |
  | Multi-layer or inset `box-shadow` | `3-layer inset CSS shadow; RN supports one non-inset shadow` (adjust the layer count) |

  A genuinely new case gets a new row here, not a one-off sentence buried in a
  single component's source — the next screen that hits the same CSS pattern
  should find the same wording already written down.
