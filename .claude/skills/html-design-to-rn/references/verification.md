# Verification — both gates

Gate A (structural) must pass before Gate B (pixel) is worth running — a
screen with wrong values does not need a screenshot to tell it so.

## Gate A — structural audit

Diffs the map file's resolved CSS values against the *generated* style
file's *real, theme-resolved* RN values (it requires the actual style
factory under Jest and calls it — it does not read source text as if it were
the truth, except to locate `design-drift[...]` comments). It cannot see a
token the generated `Colors.ts`/`Shadows.ts`/etc. doesn't define, even if the
design's own CSS defines it — that blind spot is intentional: comparing the
design against itself would pass regardless of what the generator wrote (see
known-traps.md's "The gates" section).

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/html-design-to-rn/scripts/audit-styles.mjs \
  --map apps/mobile/design/.extracted/maps/<Screen>.json \
  --extract apps/mobile/design/.extracted \
  --theme light \
  --colors <config.json project.colorsFile>
```

Run it **twice per screen — once for each of `--theme light` and
`--theme dark`** — before reporting the screen done. A key that only reads
`Colors.light` correctly and silently breaks in dark mode is a real failure
Gate A is designed to catch.

### Reading the output

Every mapped entry produces exactly one of:

- `[PASS] <key>.<property>: <value>` — resolved CSS value matches the real RN
  value.
- `[FAIL] <key>.<property>: expected <x>, got <y>` — they don't, and there's
  no annotation covering it. **This is the deliverable.** Never summarize a
  failing run as "mostly passing" — report every failing row verbatim.
- `[ANNOTATED] <key> (<property>): <reason text>` — the CSS property is in
  `css-to-rn.md`'s CHECKED-ANNOTATABLE table, the style key carries a
  matching `design-drift[<property>]` comment, and that reason text is
  reported instead of a numeric diff. Counts toward the pass total.
- `[FAIL] <key> (<property>): needs a design-drift[<property>] annotation` —
  same table, but no annotation was found. Add one (`css-to-rn.md`'s reason
  table has the wording) or fix the port so it isn't drifting.
- `[UNRESOLVED] <key>.<property>: var(--x) not found in <colorsFile theme>` —
  the design references a token the generated theme file doesn't have.
  Never annotate this away — land the token (phase 1) or fix the reference.
- `[SKIP] <key>: <reason>` — the map entry's selector is `no design source —
  ...`, or the auditor couldn't parse the selector at all. Not evidence the
  key is correct; only that nothing was compared.

A final summary line reports the counts and the gate's overall verdict:

```
14 pass, 0 fail, 2 annotated, 1 skip, 0 unresolved — GATE A: PASS
```

Any `FAIL` or `UNRESOLVED` row fails the gate, regardless of the pass count
around it. `SKIP` never fails the gate on its own, but a screen with more
`SKIP` rows than mapped keys is a sign the map file itself needs fixing, not
that the screen is verified.

### Scope boundary: only StyleSheet-based style keys

Gate A diffs `StyleSheet.create` objects. A value rendered through a
component **prop** instead of a style key — an SVG `fill`, a
`LinearGradient`'s `colors` array, a `CustomButton`'s `variant` — is outside
what it can see. Those need the manual check in Gate B, or a human read of
the component, not a `design-drift[...]` annotation (there is no style-key
mismatch to excuse — the value is simply somewhere else).

### Every style key needs a map entry

An unmapped key is invisible to this script — it never gets read, so it
never fails, which looks identical to passing. That is the one way to make
this gate lie. If you add a style key, add its map entry in the same edit.

## Gate B — pixel diff via a live Chromium target

`capture-design.mjs` drives this. The extracted design is a real, runnable
web page, and `argent` already drives any Chromium (CDP) target, so the
design's own rendering is reachable the same way the ported RN screen is:
launch it, navigate it, screenshot it, crop both sides to the same element,
diff. Proven end-to-end against SOFIA's login screen — this is not
theoretical.

1. **Serve the extracted design** — it has relative asset/script paths, so
   it needs real HTTP, not `file://`:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/skills/html-design-to-rn/scripts/capture-design.mjs serve \
     --extract apps/mobile/design/.extracted --port 4173
   ```
2. **Launch a Chromium browser with a debug port**, pointed at the served
   `index.html`, using a throwaway profile so it doesn't reuse an
   already-running instance's state. Launch the **binary directly** —
   `open -na` reuses an already-running instance of the same app and
   silently ignores the new flags (no error, no new CDP port; see
   known-traps.md):
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --remote-debugging-port=9222 --user-data-dir="$(mktemp -d)" \
     --no-first-run "http://localhost:4173/index.html" &
   ```
   (Any Chromium-family browser works identically over CDP — Edge, Brave,
   Chromium. `capture-design.mjs` never launches one itself, matching
   argent's own convention that a Chromium target is already running.)
3. **Confirm `argent`'s `list-devices` sees it** — a `platform: "chromium"`
   entry with `port: 9222` (or whatever port was used). If it doesn't appear,
   the debug port didn't bind; check nothing else already owns that port
   (known-traps.md's "Check what is already on your ports").
4. **Navigate to the target screen and get its crop rect**, in one call —
   `--navigate` is whatever JS shows that one screen (there is no universal
   call name across designs; discover it the same way phase 3 already does:
   grep the screen's `id`/`handlers` in `scripts/app.js`):
   ```bash
   node capture-design.mjs rect --cdp-port 9222 --screen p-login \
     --navigate "openLoginScreen()"
   ```
   Returns the screen container's exact bounding rect in the page's own
   pixels, plus a `normalized` `{x,y,width,height}` in 0-1 fractions of the
   viewport — the same normalized space `argent`'s gesture/screenshot tools
   already use.
5. **Screenshot it** with `argent`'s `screenshot` tool on that Chromium
   device id, and **screenshot the ported screen** on the simulator/emulator
   at a matching viewport (`config.json verify.viewport`) via the normal
   `argent-device-interact` flow.
6. **Crop and diff.** `--before-rect`/`--after-rect` are `x,y,w,h` in each
   image's own pixel space — multiply step 4's pixel rect by whatever scale
   argent's screenshot used (its `scale` param; unscaled if omitted) to get
   the design side's rect, and use the RN screenshot's own screen-container
   bounds for the other side:
   ```bash
   node capture-design.mjs diff --before design.png --after rn-screen.png \
     --before-rect 454,58,283,398 --after-rect 0,0,283,398 \
     --out diff.png --threshold <config.json verify.pixelThreshold>
   ```
   Exits 0/1 on the threshold and prints the mismatch percentage — that
   number is Gate B's verdict, report it verbatim like a Gate A row. A size
   mismatch between the two crops is an error, not a diff — fix the rects
   before trusting any percentage it would have printed.
7. Repeat for each theme in `config.json verify.themes`. SOFIA's design is
   light-only (`inventory.json` tokens have identical `light`/`dark` values
   throughout), so a dark-theme Gate B run there is comparing the RN dark
   screen against the same light-only design render — expected to show real
   differences, not a bug in the diff.

### Known gaps

- Cropping needs the design side's screenshot scale factor threaded through
  by hand (step 6) — `argent`'s `screenshot` scale isn't queryable from
  `capture-design.mjs`, so get it from whatever `scale` was passed to
  `screenshot`, or omit `scale` (defaults to unscaled) to skip the
  conversion entirely.
- No orchestrator ties steps 1–7 into one command yet — each is still a
  separate call coordinated by whoever's driving the verification (the
  agent, today). A `capture-design.mjs run --screen <id>` that does the
  whole loop is a reasonable next addition once this manual sequence proves
  itself across more than one screen.
