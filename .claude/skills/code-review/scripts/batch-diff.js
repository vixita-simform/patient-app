#!/usr/bin/env node
/**
 * batch-diff.js — prints everything needed to review ONE batch: a header (workspace, rule files,
 * files, result file) and the diff of its files. Untracked files, and every file in full-project
 * mode, are printed whole with line numbers (all lines are new). Read-only.
 *
 * Usage:
 *   node .claude/skills/code-review/scripts/batch-diff.js <runDir> <batchId> [--max-lines 400]
 *
 *   --max-lines   Per-file cap on printed lines, so one huge or generated file can't flood the
 *                 context. The rest is announced with the exact range to Read if it matters.
 */
const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const [runDir, idArg] = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--max-lines');
const MAX = parseInt(opt('--max-lines', '400'), 10);

const die = (msg) => { process.stderr.write(`${msg}\n`); process.exit(1); };
if (!runDir || !idArg) die('Usage: batch-diff.js <runDir> <batchId>');
let plan;
try { plan = JSON.parse(fs.readFileSync(`${runDir}/plan.json`, 'utf8')); } catch { die(`No plan.json in ${runDir}`); }
const batch = plan.batches.find((b) => b.id === Number(idArg));
if (!batch) die(`Batch ${idArg} not found (1–${plan.batches.length}).`);

const out = [];
const resultFile = `${runDir}/batch-${batch.id}.txt`;
out.push(
  `BATCH ${batch.id} of ${plan.batches.length} | workspace: ${batch.workspace} | ${batch.files.length} files | ${batch.changedLines} changed lines`,
  `Review mode: ${plan.reviewMode}`,
  `Rules: ${batch.rules.join(', ')}`,
  `Write result to: ${resultFile}${fs.existsSync(resultFile) ? '  (ALREADY EXISTS — batch done, skip it)' : ''}`,
  'Files:', ...batch.files.map((p) => `  ${p}${batch.untracked.includes(p) ? '  (new, whole file below)' : ''}`),
  '',
);

// ---- Diff of tracked files, split per file so each one can be capped ----------------------
if (batch.diffCommand) {
  let diff = '';
  try { diff = execSync(batch.diffCommand, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch (e) { out.push(`(diff failed: ${e.message.split('\n')[0]})`); }
  for (const chunk of diff.split(/^(?=diff --git )/m).filter(Boolean)) {
    const lines = chunk.replace(/\n$/, '').split('\n');
    const name = (lines[0].match(/ b\/(.+)$/) || [])[1] || '?';
    out.push(...lines.slice(0, MAX));
    if (lines.length > MAX) {
      out.push(`... [${lines.length - MAX} more diff lines of ${name} not shown — run \`git diff\` for this file, or Read the changed ranges, only if they need review]`);
    }
    out.push('');
  }
}

// ---- Untracked / full-project files: whole file with line numbers ----------------------
for (const p of batch.untracked) {
  let text;
  try { text = fs.readFileSync(p, 'utf8'); } catch { out.push(`=== ${p} (could not read)`, ''); continue; }
  const lines = text.replace(/\n$/, '').split('\n');
  out.push(`=== ${p} (new file, ${lines.length} lines — every line counts as added)`);
  const w = String(Math.min(lines.length, MAX)).length;
  lines.slice(0, MAX).forEach((l, i) => out.push(`${String(i + 1).padStart(w)}  ${l}`));
  if (lines.length > MAX) out.push(`... [lines ${MAX + 1}–${lines.length} not shown — Read with offset ${MAX + 1} if they need review]`);
  out.push('');
}

process.stdout.write(out.join('\n') + '\n');
