---
name: generate-spec
description: Turn an HTML design file into screen specs only, with no code. Re-extracts the design incrementally, writes specs for new screens, regenerates specs for changed screens, skips unchanged ones, and refreshes the project inventory if it is stale. Run it before /build-screen, so the build finds every spec current and skips its spec stage.
argument-hint: "<path/to/design.html> [--only id,id] [--force]"
allowed-tools:
  - Read
  - Bash
  - Agent
user-invocable: true
disable-model-invocation: true
---

Generate design specs for `$ARGUMENTS`.

**You are the orchestrator.** Scripts decide what changed and agents read the
design. You never open the heavy sources yourself. This skill writes specs and
the project inventory only. It never writes or edits anything under `apps/mobile/src/`, and
it never touches the `build-screen` skill.

Scripts live in `.claude/skills/generate-spec/scripts/`. Below, `$GS` stands for
that path and `$X` for `.claude/skills/html-design-to-rn/scripts/extract-design.mjs`.

## Budget rules

- **Never read** `apps/mobile/design/*.html`, `screens/*.html`, `*.facts.json`,
  `styles/rn/*.json`, `styles/app.css`, `inventory.json` whole, or a whole
  `*.spec.md`. Delegating a read and then doing it yourself costs more than not
  delegating.
- From a spec, read the **Digest only**:
  `sed -n '/^## 0\. Digest/,/^## 1\./p' <spec>`.
- Pass paths to agents, not contents. Never ask an agent to paste back a file it
  wrote.
- Do not restate these rules to the user.

## Step 1: parse arguments

The first token is the HTML path. It is required. If it is missing or the file
does not exist, stop and ask for it. Optional flags: `--only id,id` (limit to
these screens) and `--force` (regenerate even when unchanged). Both pass
straight through to `spec-plan.mjs`.

## Step 2: prepare the source

```bash
node $GS/prepare-source.mjs <html>
```

This writes `apps/mobile/design/<basename>.src.html` with the external `<link>`s removed and
an `id` on every `div.phone` (slugged from its `.frame-label`), and points
`.claude/html-design-to-rn/config.local.json` at it. It prints `id ← label` for
every screen.

- Exit 2 (duplicate id, or a phone with no label): stop, show the message, and
  ask the user to fix the label in the HTML.
- **A renamed label changes the id.** If an id the inventory used to have is now
  missing and a new one appears with a similar label, say so before continuing.
  Otherwise one screen will be read as "removed + added" and its spec archived.

## Step 3: extract incrementally

```bash
node $X apps/mobile/design/<basename>.src.html --out apps/mobile/design/.extracted --screen-selector div.phone --scale-fn scale 2>&1 \
  | grep -E 'Incremental extraction|Error|error' || true
```

Keep only that one summary line, never the full stdout. The extractor compares
every screen's markup hash with the last run and writes the diff to the top of
`apps/mobile/design/.extracted/CHANGELOG.md`. Read only the newest entry, if you need it:
`awk '/^## /{n++} n==1' apps/mobile/design/.extracted/CHANGELOG.md`.

If the summary says app.css/app.js changed, every screen's files were rewritten.
That is expected. Step 5 compares content, so unchanged screens are still
skipped.

## Step 4: render missing screenshots

```bash
node $GS/render-screenshots.mjs
```

This renders 375×812 @2x PNGs with headless Chrome for every screen with no
screenshot (new and changed screens lose theirs on re-extraction), and records
them in `inventory.json`. Exit 3 means some failed. Carry the list into the
report as "no screenshot". Never report a skipped screenshot as done.

## Step 5: plan

```bash
node $GS/spec-plan.mjs [--only …] [--force] > apps/mobile/design/.extracted/.build/.spec-plan.json
python3 -c "
import json; p=json.load(open('apps/mobile/design/.extracted/.build/.spec-plan.json'))
for k in ('new','changed'): [print(k, e['id'], e['name'], '|', e['reason'], '|', '; '.join(e.get('flags',[]))) for e in p[k]]
print('unchanged:', ', '.join(p['unchanged']) or '-')
print('removed:', ', '.join(r['id'] or r['spec'] for r in p['removed']) or '-')
print('inventoryStale:', p['inventoryStale'], p.get('inventoryStaleReason',''))
for n in p['notes']: print('note:', n)"
```

`spec-plan.mjs` decides by **content hash** of each screen's markup, facts and
compiled styles, stored in `apps/mobile/design/.extracted/.build/spec-manifest.json`. Specs
written before the manifest existed are judged by mtime once, then recorded.

Show the user this plan as a short table: `screen | new/changed | reason | flags`.
**If `toGenerate` > 3, ask before dispatching** and give the count, because this
is where the tokens go. With nothing to generate and a fresh inventory, report
"all specs current" and stop.

## Step 6: dispatch the agents

Send each wave as **one message with several Agent calls**, so they run
concurrently. **At most 4 `design-screen-spec` agents per wave**: 10 screens run
as 4 + 4 + 2. Add `design-reuse-scout` to the first wave, and only if
`inventoryStale` is true.

For each entry in `new` + `changed`, dispatch `design-screen-spec` with this
prompt, filling in the fields from that entry in `.spec-plan.json` (read them
with `python3`, one entry at a time):

```
Write the screen spec for <name> (<id>).
Output path: <outPath>
Resolved inventory fields (paths are relative to apps/mobile/design/.extracted/):
  file=<file> factsFile=<factsFile> styleFile=<styleFile> screenshot=<screenshot>
  role=<role> parent=<parent> tab=<tab> flow=<flow> title=<title> subtitle=<subtitle>
  dynamic=<dynamic> staticMarkup=<staticMarkup> renderStatus=<renderStatus> renderFns=<renderFns>
<if changed and a spec existed:> This screen changed (<reason>). Regenerate the spec from scratch. Do not patch the old one.
Other spec agents run in parallel. Write only your own output path.
Return the Digest and the path only.
```

For `design-reuse-scout`: `Write the project inventory to apps/mobile/design/.extracted/.build/project-inventory.md. Return the path, the counts per section, and any gaps.`

After **each wave** returns, record the screens whose spec was written:

```bash
node $GS/spec-plan.mjs --record <id>,<id>,…
```

A screen it reports as "not recorded" failed. Do not retry it automatically.
List it in the report.

Agents return their Digest. Keep only: the Gate 0 line, the BLOCKING questions,
and an `over cap:` line if one is present. Drop the rest.

## Step 7: removed screens

If `removed` is non-empty:

```bash
node $GS/spec-plan.mjs --archive-removed
```

This moves those specs to `apps/mobile/design/.extracted/.build/_removed/`. **Never delete
code.** For each removed screen, check whether `apps/mobile/src/screens/<feature>/` or a
route in `apps/mobile/src/app/` still exists for it (`ls`/`grep` by its id or name), and
list what you find for the user to decide on.

## Step 8: report, the last thing you write

1. One table: `screen | status (new / updated / unchanged / removed / failed) | lines | Gate 0 | BLOCKING questions`.
   Unchanged screens go on a single line, not one row each.
2. Each BLOCKING question, quoted from its Digest, under its screen.
3. Notes: missing screenshots, `over cap` lines, specs written without a
   screenshot (from `notes`), and an inventory refresh with its reason.
4. Next steps: the `/build-screen <id>` command for each new or updated screen.
   `/build-screen` will find these specs newer than their inputs and skip its
   own spec stage.

No narration of what the agents did. The specs are on disk.

## When something cannot run

- No Chrome: `render-screenshots.mjs` exits 2. Say so, and continue only if the
  user accepts specs without screenshots. The spec agent treats the screenshot
  as its top source.
- A dynamic screen that is not rendered shows up flagged `blocked`. The agent
  still writes a spec whose Gate 0 is BLOCKED. Report it as blocked, never as
  ready.
- If agent dispatch is unavailable, say so and stop. Do not write specs inline:
  reading the heavy design sources into this thread is exactly what this skill
  exists to avoid.
