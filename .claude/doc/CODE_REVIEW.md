# Code Review with Claude Code — Team Guide

Every team member can run an AI code review before pushing. It checks your changes against
our project rules (`.claude/skills/code-review/references/conventions.md`) and gives you a
report with a clear verdict: ❌ don't push, ⚠️ fix first, or ✅ ready.

**Not sure how to use it?** Open Claude Code in the project and ask:
_"How do I use the code review?"_ — it will explain using this guide.

---

## 1. One-time setup (each person)

1. Install Claude Code if you don't have it: https://docs.claude.com/en/docs/claude-code
2. Pull the latest code — the review tools live in the repo, so you get them automatically:
   ```bash
   git pull
   ```
3. Open Claude Code **inside the project folder**:
   ```bash
   cd path/to/project
   claude
   ```
4. Check it's installed: type `/agents` → you should see **code-reviewer**.

Nothing else to install. Node.js is already needed for React Native, and that's all the scripts use.

---

## 2. When to run a review

**Rule of thumb: run it before every push.**

| Your situation | What to say to Claude | What gets reviewed |
|---|---|---|
| Normal work — before pushing | `review my changes before push` | Only your new, unpushed changes |
| Before opening a Pull Request | `review my changes against main` | Everything in your branch vs `main` |
| You merged `main` into your branch | `review my changes against main` | Only your work (not teammates' code that came in with the merge) |
| Small fix, not committed yet | `review my uncommitted changes` | Only the files you just edited |
| You only want your last few commits | `review only my last 2 commits` | Those 2 commits |
| Brand-new project / first push ever | `review the whole project before the first push` | Every file (expensive — see section 5) |

You can also type `/code-review` instead of a sentence.

**When NOT to run it:**
- Nothing changed yet — it will just say "nothing to review".
- To review a teammate's pushed code — use the Pull Request review on GitHub for that.
- As a replacement for testing the app. It reads code; it doesn't run the app.

---

## 3. Reading the report

The report is saved in `.claude/reviews/` (not committed to git). Claude also shows the
verdict and critical issues in chat.

| Verdict | Meaning | What to do |
|---|---|---|
| ❌ Do not push | At least one **Critical** issue — bug, crash, security problem or type error | Fix all Critical issues, then run the review again |
| ⚠️ Push after fixing standards | No bugs, but several rule violations | Fix the Standards Violations, then push |
| ✅ Ready to push | Only minor or no issues | Push. Fix minor items if you have time |

Each issue shows the **file and line**, the **problem**, and a **suggested fix**. Tags:
- `[tool]` — found by ESLint or TypeScript
- `[cross-file]` — a problem between files (e.g. a new route not added to `AppNavigation.tsx`)
- `[foundation]` — a project setup problem (e.g. a `.env` file about to be pushed)

You can ask Claude: _"fix the critical issues"_ — it will only fix what you ask.

The **Session Usage** section at the end shows how many tokens the review used.

---

## 4. Our team agreement

1. Run the review before every push. Don't push with ❌.
2. Before opening a PR, run `review my changes against main`, and paste the **Verdict** line into the PR description.
3. Never push secrets. If the review flags `.env`, a keystore or a key, stop and ask the team.
4. Reviewers on GitHub still review PRs — the AI review is a first pass, not the final approval.

_(Edit this section if the team decides differently.)_

---

## 5. Keeping reviews fast and cheap

- **Push often, in small pieces.** Reviewing 10 files is faster, cheaper and more accurate than 150.
- **Fix lint and type errors first** — they're free to find:
  ```bash
  npx eslint app/ --ext .ts,.tsx
  npx tsc --noEmit
  ```
- **Don't ask for a whole-project review** unless it's the very first push. After the first push,
  every review is automatically "changes only".
- If you hit your Claude usage limit mid-review, unfinished files are listed under **Not Reviewed**.
  Run the review again later.

---

## 6. FAQ

**It says "nothing to review" but I changed files.**
Your changes are probably already pushed, or you're comparing against the wrong branch. Try
`review my uncommitted changes` or `review my changes against main`.

**It's reviewing all files instead of just mine.**
There's no pushed branch to compare against yet. Push your branch once (`git push -u origin <branch>`),
or say `review only my last N commits`.

**It flagged something I think is fine.**
The AI can be wrong. If a rule itself is wrong or outdated, change it (see below). If it's a
one-off false alarm, ignore it and mention it in the PR.

**How do I change or add a review rule?**
Edit `.claude/skills/code-review/references/conventions.md` and open a PR for it, so the whole team
agrees. That one file is the only place rules live — every review uses it.

**Is my code sent anywhere?**
The review runs through Claude Code, the same as any other Claude Code task. Follow our company's
policy for Claude Code usage.

---

## 7. What's inside (for maintainers)

```
.claude/
├── agents/code-reviewer.md            # reviews one batch of files
└── skills/code-review/
    ├── SKILL.md                       # orchestrator: plans batches, runs reviewers, writes report
    ├── references/conventions.md      # ⭐ the team's review rules — edit this one
    └── scripts/
        ├── plan-batches.js            # finds changed files, splits into batches
        ├── foundation-check.js        # checks core files, tsconfig, ESLint, secrets
        └── usage-report.js            # token usage for the report
docs/CODE_REVIEW.md                    # this guide
```

Run the scripts by hand to debug:
```bash
node .claude/skills/code-review/scripts/plan-batches.js --working   # what would be reviewed
node .claude/skills/code-review/scripts/foundation-check.js         # project setup check
```
