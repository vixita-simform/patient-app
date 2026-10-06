---
name: code-review
description: Reviews ONLY the changed code (git diff), or the whole project for a new project / first push, of this monorepo (Expo mobile app, Next.js backend, shared packages) before a push or PR, at any size from 1 to 200+ files, reviewing batch by batch in this session with checkpoint files (no sub-agents), then merging everything into one severity-ranked report. Use this whenever the user says review my code, review my changes, review before push, check my diff, PR review, code audit, pre-push check, or asks whether their changes are ready to push, or asks to review a new/initial project or the full codebase, or says "continue the review", even if they don't say "skill" or mention the number of files.
user-invocable: true
disable-model-invocation: true
---

# Code Review (single session, diff-only)

You do the whole review yourself, in this session. **Never launch a sub-agent** (no Agent / Task
tool) — not the `code-reviewer` agent, not Explore, not general-purpose. Every token the review
spends must show up in this session.

How it scales without agents: the diff is split into small batches of related files. You review
them one at a time, and write each batch's findings to a file the moment it's done. The files are
the source of truth: if the conversation is compacted or stopped, nothing is lost, and the review
can be resumed. A script merges the files into the report.

Rules live in files. Don't restate or change them here:

- `.claude/agents/code-reviewer.md` — read only its **Procedure** and **Output format**
  sections. They are your review procedure and the exact result format. Where it says
  "orchestrator", that's this skill; where it says "diff command", use `batch-diff.js` output.
- `references/common.md` — every workspace (TypeScript, shared packages, security, severity guide)
- `references/mobile.md` + `apps/mobile/CLAUDE.md` — `apps/mobile/`
- `references/backend.md` — `apps/backend/`

## Step 0 — Pick the review mode

- **Resume:** the user says "continue the review" / "resume", or you are mid-review after a
  compaction. Run `plan-batches.js --resume`, skip to Step 3 and do only `pendingBatches`. Re-read
  the rule files first (Step 2) — they may have been compacted away.
- **Diff mode (default):** the project already has a base branch (usually after the first push).
  Reviews only changed lines.
- **Full-project mode (`--all`):** use when the user says initial / new / first push / whole
  project / full review, OR when Step 1 returns an error about no base branch or no commits.
  Every source file is reviewed and all lines count as new. Root-level tool configs
  (babel, metro, jest, .eslintrc) are covered by the foundation check instead.

## Step 1 — Plan the batches

Run from the repo root:

```bash
node .claude/skills/code-review/scripts/plan-batches.js [--base <ref>] [--working]   # diff mode
node .claude/skills/code-review/scripts/plan-batches.js --all                         # full-project mode
```

- Default base is the branch's upstream, else `origin/main` / `origin/master` / `origin/develop`.
  If the user names a branch ("review against develop"), pass `--base develop`.
- Add `--working` when the user has uncommitted changes they want included
  (check with `git status --short`; if there are uncommitted changes and the user didn't say,
  include them — they're about to be pushed too).
- The script keeps each feature folder (Screen + Styles + Types + hook + its tests, or one
  backend API area) in one batch, never mixes workspaces in a batch, and caps batches at
  ~12 files / ~800 changed lines. Lockfiles, images, snapshots, build output and pure renames
  (moved, 0 lines changed) are left out automatically.
- It writes the full plan to `<runDir>/plan.json` and prints only a summary: `runDir`,
  `startedAt`, `size`, `workspaces`, `totals`, one line per batch. Don't open `plan.json`
  yourself — `batch-diff.js` reads it.

Keep `runDir` and `startedAt` — later steps need them.

If the output has `error` about a missing base branch or common ancestor, switch to `--all`
and tell the user in one line ("No base branch yet — reviewing the whole project"). For any
other error, tell the user and stop. If `reviewFiles` is 0, say there's nothing to review and stop.

**Ask before continuing** (one line with the counts) only when it's a big spend: full-project mode
with more than 15 batches, or more than 250 files. Up to that, just go.

Tell the user in one line what will happen, e.g.
"Reviewing 148 changed files (3,920 lines) against origin/main in 13 batches."

## Step 1b — Foundation check (always — it's instant and costs no review tokens)

```bash
node .claude/skills/code-review/scripts/foundation-check.js --out <runDir>/foundation.txt
```

It checks, per workspace, that the core files the rules rely on exist (mobile: `Strings.ts`,
`Routes.ts`, `Colors.ts`, `Metrics.tsx`…; backend: `next.config.ts` lists the shared packages),
that the tsconfig files and ESLint actually enforce the rules, and that no secrets (`.env`,
release keystores) are about to be pushed. `merge-findings.js` picks up its findings (in diff mode
only the CRITICAL ones — the rest isn't about the changed code). Remember its `MISSING_CORE`
list: don't flag every usage of something that doesn't exist yet.

## Step 2 — Static tools (background) and rules (once)

Start lint and typecheck in the background (`run_in_background`) for each workspace that has
batches; skip any that aren't set up:

```bash
npm run lint --workspace=@patient-app/<name>
npm run typecheck --workspace=@patient-app/<name>
```

Keep only errors on reviewed files. Type errors are `CRITICAL`, lint errors `STANDARD`, tagged `[tool]`.

While they run, read the rules **once for the whole review**: the Procedure and Output format
sections of `.claude/agents/code-reviewer.md`, `references/common.md`, then the rule files of
only the workspaces in the plan's `workspaces` list (`mobile` → `references/mobile.md` +
`apps/mobile/CLAUDE.md`; `backend` → `references/backend.md`). Don't re-read them per batch.

## Step 3 — Review the batches, one at a time

For each batch id in order (on resume: only `pendingBatches`):

1. Get the batch:
   ```bash
   node .claude/skills/code-review/scripts/batch-diff.js <runDir> <id>
   ```
   It prints the workspace, the rule files that apply, the files, and the diff (`-U3`). New or
   untracked files (and every file in full-project mode) are printed whole with line numbers.
   Any file over 400 printed lines is cut, with a note on what to Read if needed. If the header
   says the result file already exists, skip the batch.
2. Review per the Procedure, applying only that batch's workspace rules. Findings only on added
   or changed lines. Read more of a file only when a hunk can't be judged on its own, and then
   with `Read` offset/limit around the hunk — never whole files "for context", and never re-read
   a file already shown in full by `batch-diff.js`. Grep is fine for checking callers.
3. **Immediately** write the result to `<runDir>/batch-<id>.txt` in the exact Output format
   (`BATCH`, `FILES_REVIEWED`, `FINDINGS`, `CONTEXT`, `APPROVED`). Write it even if there are no
   findings (`none`) — a missing file means "not reviewed".
4. Tell the user one line, e.g. "Batch 7/16 done — 2 critical, 5 standard." Don't repeat the
   findings in chat. Go to the next batch without waiting for the user.

Don't stop partway to summarize. If the conversation is compacted mid-review, run
`plan-batches.js --resume` and carry on with `pendingBatches`.

**Small reviews** (`size: "small"`, ≤10 files and ≤600 lines — usually 1–2 batches): same steps.
Each result file costs one short write and keeps the report path identical for every size.

## Step 4 — Merge and cross-file checks

```bash
node .claude/skills/code-review/scripts/merge-findings.js <runDir>
```

It prints `COUNTS`, ready-made `## Critical Issues` / `## Standards Violations` /
`## Minor Issues` / `## Approved Patterns` sections (deduped, sorted, same issue across >3 files
collapsed into one bullet), the merged `CONTEXT` facts, `NOT_REVIEWED` batches and `UNPARSED`
lines. If `NOT_REVIEWED` is not `none`, review those batches now (Step 3), then merge again. Fix
or drop any `UNPARSED` line.

Then use the `CONTEXT` lines plus Grep over the repo for the checks no single batch can do:

1. **Routes (mobile)** — every `NEW_ROUTE` has all three: a key in `STACK_ROUTES` / `TAB_ROUTES`
   (`apps/mobile/src/constants/Routes.ts`), a route file under `apps/mobile/src/app/`, and a
   screen exported from `apps/mobile/src/screens/index.ts`. Missing one → STANDARD.
2. **Strings (mobile)** — every `NEW_STRING_KEY` exists in `apps/mobile/src/constants/Strings.ts`
   and its block is in the default export. Same text already under another key → MINOR (reuse it).
3. **Tests** — every `NEW_COMPONENT` has a test in `apps/mobile/jest/__tests__/`; every `NEW_HOOK`
   with logic has tests for its handlers and states. Every `NEW_ENDPOINT` has route tests.
   Missing → STANDARD.
4. **Changed exports** — for each `CHANGED_EXPORT`, Grep all callers across the whole repo,
   including other workspaces (a changed `@patient-app/shared-types` type affects mobile and
   backend). A caller not updated for the new shape → CRITICAL.
5. **API contract** — every `API_CALL` from mobile matches a backend route (`apps/backend/src/app/api/<path>/route.ts`
   exporting that method) or is clearly marked as not built yet. Every `NEW_ENDPOINT` returns a
   type from `@patient-app/shared-types`. Mismatched method/path → CRITICAL.
6. **Shared types** — each `NEW_SHARED_TYPE` is exported from the package `index.ts` and is not
   a duplicate of a type still defined inside an app. Duplicate → STANDARD (move callers to the shared one).
7. **Barrels** — each `NEW_FOLDER` with `index.ts: no` → STANDARD.

Tag these findings `[cross-file]` and add them, plus the `[tool]` errors from Step 2, to the
merged sections in the right severity.

In full-project mode also check the project as a whole: mobile screens that skip the
`Screen / ScreenStyles / use<Name>Screen` pattern, duplicated components that should be one
shared component in `apps/mobile/src/components/`, types defined in both an app and
`packages/shared-types`, and whether each workspace has tests at all.

## Step 5 — Write the report

1. Measure usage for this review:
   ```bash
   node .claude/skills/code-review/scripts/usage-report.js --since <startedAt>
   ```
   It reads Claude Code's local session logs and prints a ready-made `## Session Usage`
   section. Paste its output unchanged — never estimate or invent token numbers. If it prints
   "not available", keep that note as-is.
2. Write the full report to `<runDir>/report.md` (this marks the run finished, so `--resume`
   skips it) and copy it to `.claude/reviews/review-<branch>-<YYYY-MM-DD-HHmm>.md`
   (`.claude/reviews/` is gitignored).
3. In chat, show the verdict, the counts, all Critical Issues, and the one-line **Total** from
   Session Usage. Point to the file for the rest.

Use this template exactly:

```markdown
# Code Review — <branch> vs <base>

**Verdict:** ❌ Do not push — <n> critical issues | ⚠️ Push after fixing standards | ✅ Ready to push
**Mode:** <diff vs <base> | full project>
**Scope:** <reviewFiles> files, <changedLines> changed lines (full project: total lines), <batches> batches · <skippedFiles> skipped · <renamedOnly> moved without changes

## Summary

<One sentence overall assessment>

## Critical Issues

- `path:line` — issue → fix _(category)_

## Standards Violations

- `path:line` — issue → fix _(category)_

## Minor Issues

- `path:line` — issue → fix _(category)_

## Approved Patterns

- <1–2 genuinely non-obvious good patterns, or omit the section>

## Not Reviewed

- <files from batches still missing a result, and the skipped list collapsed to a count>

<output of usage-report.js, pasted unchanged>
```

Verdict rule: any CRITICAL → ❌. Only STANDARD/MINOR with more than a few STANDARD → ⚠️.
Otherwise ✅.

## Step 6 — Offer next steps

End with one short offer, e.g. "Want me to fix the critical issues?" Do not start fixing
anything unless the user asks — this skill is review-only.
