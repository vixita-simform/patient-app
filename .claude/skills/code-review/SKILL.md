---
name: code-review
description: Reviews ONLY the changed code (git diff), or the whole project for a new project / first push, of this React Native project before a push or PR, at any size from 1 to 200+ files, by splitting the diff into batches and running parallel code-reviewer sub-agents, then merging everything into one severity-ranked report. Use this whenever the user says review my code, review my changes, review before push, check my diff, PR review, code audit, pre-push check, or asks whether their changes are ready to push, or asks to review a new/initial project or the full codebase, even if they don't say "skill" or mention the number of files.
---

# Code Review Orchestrator (diff-only)

You coordinate the review. You do not review files yourself — the `code-reviewer` sub-agent
does that per batch. Your jobs: plan batches, launch reviewers in parallel, run the checks
that need the whole diff, and produce one clean report.

Why this design: one agent reading 150 files loses focus and misses bugs. Small batches of
related files get full attention, and running them in parallel keeps it fast.

Rules live in `references/conventions.md`. Don't restate or change them here.

## Step 0 — Pick the review mode

- **Diff mode (default):** the project already has a base branch (usually after the first push).
  Reviews only changed lines.
- **Full-project mode (`--all`):** use when the user says initial / new / first push / whole
  project / full review, OR when Step 1 returns an error about no base branch or no commits.
  Every source file is reviewed and all lines count as new. Root-level tool configs
  (babel, metro, jest, .eslintrc) are covered by the foundation check instead.

Full-project mode on a big codebase is much more expensive than a diff review. If it plans more
than 15 batches, tell the user the batch count first and ask to continue.

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
- The script keeps each feature folder (Screen + Styles + Types + hook) in one batch and
  caps batches at ~12 files / ~800 changed lines. Lockfiles, images, snapshots and build
  output are skipped automatically.

Save the `startedAt` value from the output — Step 5 uses it to measure token usage for
this review only.

If the output has `error` about a missing base branch or common ancestor, switch to `--all`
and tell the user in one line ("No base branch yet — reviewing the whole project"). For any
other error, tell the user and stop. If `reviewFiles` is 0, say there's nothing
to review and stop.

Tell the user in one line what will happen, e.g.
"Reviewing 148 changed files (3,920 lines) against origin/main in 13 parallel batches."

## Step 1b — Foundation check (always — it's instant and costs no review tokens)

```bash
node .claude/skills/code-review/scripts/foundation-check.js
```

It checks that the core files the conventions rely on exist (`Strings.ts`, `APIConfig.ts`,
`Store.ts`, `Metrics`, `Colors`…), that `tsconfig.json` and ESLint actually enforce the rules,
and that no secrets (`.env`, release keystores) are about to be pushed. In full-project mode keep
all its FINDINGS for the report. In diff mode keep only its CRITICAL findings (secrets about
to be pushed), since the rest isn't about the changed code. Pass its `MISSING_CORE` list to every reviewer in Step 3 — this stops reviewers
from flagging every single usage of something that doesn't exist yet.

## Step 2 — Run static tools (in parallel with Step 3)

These catch mechanical problems for free, so reviewers can focus on logic. Run them in the
background while reviewers work; skip any that aren't set up in this project.

```bash
npx eslint <all reviewFiles that are .ts/.tsx/.js/.jsx>   # lint rules (inline styles, color literals, etc.)
npx tsc --noEmit                                          # type errors
```

Keep only errors on changed files. Type errors and lint errors count as `CRITICAL` and
`STANDARD` respectively in the final report, tagged `[tool]`.

## Step 3 — Launch reviewers in parallel

For each batch, launch one `code-reviewer` sub-agent. **Send all launches in a single message**
so they run concurrently — sequential launches defeat the purpose. If there are more than 10
batches, launch in waves of 10.

Prompt each reviewer with exactly:

```
Review batch <id>.
Diff command: <diffCommand with this batch's files substituted for <files>>
Files:
<one path per line>
Untracked files in this batch (read whole file, all lines are new):
<paths, or "none">
Review mode: <diff | full-project>
Missing project foundation (don't flag each usage; one foundation finding already covers it):
<MISSING_CORE list, or "none">
Follow your procedure and return output in your exact format.
```

Single-batch runs (`mode: "single"`) still go through one `code-reviewer` so the output
format stays identical.

If a reviewer fails or returns malformed output, re-run that batch once. If it fails again,
list its files under "Not reviewed" in the report — never silently drop files.

## Step 4 — Cross-file checks (only you can do these)

Reviewers only see their own batch. Use their CONTEXT lines plus Grep over the repo:

1. **Routes** — every `NEW_ROUTE` exists in the `ROUTES` enum, in `RootStackParamList`
   (`AppNavigation.tsx`), and in `getLinkConfiguration()` if it's deep-linkable.
2. **Reducers** — every `NEW_REDUCER` is in `combineReducers` in `Store.ts`; if it holds data
   that should survive restart, flag whether `persistConfig` whitelists it (MINOR, as a question).
3. **Strings** — every `NEW_STRING_KEY` exists in both `en.json` and `Strings.ts`.
4. **Tests** — every `NEW_COMPONENT` has at least a test in `jest/__tests__/`; every `NEW_HOOK`
   with business logic has success/error/loading tests. Missing → STANDARD.
5. **Changed exports** — for each `CHANGED_EXPORT`, Grep all callers across the repo
   (including unchanged files). A caller not updated for the new signature → CRITICAL.
6. **Thunk actions** — no two `NEW_THUNK_ACTION` strings (or an existing one in
   `ToolkitAction.ts`) are identical → CRITICAL if duplicated.
7. **Endpoints** — each `NEW_ENDPOINT` is defined in `APIConst.ts` and actually used.
8. **Barrels** — each `NEW_FOLDER` with `index.ts: no` → STANDARD.

Tag these findings `[cross-file]`. Add the foundation-check FINDINGS here too (already tagged
`[foundation]`).

In full-project mode also check the project as a whole: features that skip the
`Screen / Styles / Types / use<Name> / index.ts` pattern, duplicated components that should be
one shared component in `app/components/`, and whether any tests exist at all.

## Step 5 — Merge and write the report

1. Parse all FINDINGS lines. Deduplicate: same path + line + category → keep the clearest one.
   If the same issue repeats in many files (e.g. hardcoded strings in 20 files), group them
   into one bullet listing the files, so the report stays readable.
2. Sort: CRITICAL → STANDARD → MINOR; inside each, by file path then line.
3. Measure usage for this review:
   ```bash
   node .claude/skills/code-review/scripts/usage-report.js --since <startedAt>
   ```
   It reads Claude Code's local session logs and prints a ready-made `## Session Usage`
   Markdown section (total tokens, cache, API calls, time, and a per-batch table). Paste its
   output into the report unchanged — never estimate or invent token numbers. If it prints
   "not available", keep that note as-is.
4. Write the full report to `.claude/reviews/review-<branch>-<YYYY-MM-DD-HHmm>.md`
   (create the folder; suggest adding `.claude/reviews/` to `.gitignore` the first time).
5. In chat, show the verdict, the counts, all Critical Issues, and the one-line **Total** from
   Session Usage. Point to the file for the rest.

Use this template exactly:

```markdown
# Code Review — <branch> vs <base>

**Verdict:** ❌ Do not push — <n> critical issues   |   ⚠️ Push after fixing standards   |   ✅ Ready to push
**Mode:** <diff vs <base> | full project>
**Scope:** <reviewFiles> files, <changedLines> changed lines (full project: total lines), <batches> batches · <skippedFiles> skipped

## Summary
<One sentence overall assessment>

## Critical Issues
- `path:line` — issue → fix  _(category)_

## Standards Violations
- `path:line` — issue → fix  _(category)_

## Minor Issues
- `path:line` — issue → fix  _(category)_

## Approved Patterns
- <1–2 genuinely non-obvious good patterns, or omit the section>

## Not Reviewed
- <files from failed batches, and the skipped list collapsed to a count>

<output of usage-report.js, pasted unchanged>
```

Verdict rule: any CRITICAL → ❌. Only STANDARD/MINOR with more than a few STANDARD → ⚠️.
Otherwise ✅.

## Step 6 — Offer next steps

End with one short offer, e.g. "Want me to fix the critical issues?" Do not start fixing
anything unless the user asks — this skill is review-only.
