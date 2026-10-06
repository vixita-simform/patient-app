#!/usr/bin/env node
/**
 * merge-findings.js — merges the per-batch result files of one review run into report sections.
 * Read-only, no dependencies.
 *
 * Usage:
 *   node .claude/skills/code-review/scripts/merge-findings.js <runDir>
 *
 * Reads <runDir>/plan.json, every <runDir>/batch-<id>.txt (format: Output format section of
 * .claude/agents/code-reviewer.md) and, if present, <runDir>/foundation.txt
 * (foundation-check.js output; in diff mode only its CRITICAL findings are kept).
 *
 * Prints:
 *   COUNTS          critical / standard / minor numbers for the verdict
 *   Markdown        ## Critical Issues / ## Standards Violations / ## Minor Issues / ## Approved Patterns
 *                   deduped (path + line + category), sorted by path then line, and the same issue
 *                   repeated in more than 3 files collapsed into one bullet
 *   CONTEXT         every batch's cross-file facts, grouped by type, for the cross-file checks
 *   NOT_REVIEWED    batches with no result file (with their files when 3 or fewer)
 *   UNPARSED        finding lines that didn't match the format (fix or drop them by hand)
 */
const fs = require('fs');

const runDir = process.argv[2];
if (!runDir) { process.stderr.write('Usage: merge-findings.js <runDir>\n'); process.exit(1); }
let plan;
try { plan = JSON.parse(fs.readFileSync(`${runDir}/plan.json`, 'utf8')); }
catch { process.stderr.write(`No plan.json in ${runDir}\n`); process.exit(1); }

const SEVERITIES = ['CRITICAL', 'STANDARD', 'MINOR'];
const findings = [];
const context = new Map(); // type -> Set(lines)
const approved = new Set();
const unparsed = [];
const missing = [];

function parseFinding(line, source) {
  const parts = line.split(' | ').map((s) => s.trim());
  if (parts.length < 5 || !SEVERITIES.includes(parts[0])) { unparsed.push(`${source}: ${line}`); return; }
  // Severity, category and location never contain the separator and the fix is the last field,
  // so any extra " | " belongs to the issue text and is kept there.
  const [severity, category, where] = parts;
  const issue = parts.slice(3, -1).join(' | ');
  const fix = parts[parts.length - 1];
  const m = where.match(/^(.*?)(?::(\d+))?$/);
  findings.push({ severity, category, path: m[1], line: m[2] ? +m[2] : 0, where, issue, fix });
}

function parseResult(text, source) {
  let section = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || /^```/.test(line) || /^BATCH\b|^FILES_REVIEWED\b/.test(line)) continue;
    if (/^(FINDINGS|CONTEXT|APPROVED|MISSING_CORE)$/.test(line)) { section = line; continue; }
    if (/^none$/i.test(line) || /^- none$/i.test(line)) continue;
    if (section === 'FINDINGS') parseFinding(line, source);
    else if (section === 'CONTEXT') {
      const type = line.split(' | ')[0];
      if (!context.has(type)) context.set(type, new Set());
      context.get(type).add(line);
    } else if (section === 'APPROVED') approved.add(line.replace(/^-\s*/, ''));
  }
}

for (const b of plan.batches) {
  const file = `${runDir}/batch-${b.id}.txt`;
  if (!fs.existsSync(file)) { missing.push(b); continue; }
  parseResult(fs.readFileSync(file, 'utf8'), `batch ${b.id}`);
}
if (fs.existsSync(`${runDir}/foundation.txt`)) {
  const before = findings.length;
  parseResult(fs.readFileSync(`${runDir}/foundation.txt`, 'utf8'), 'foundation');
  if (plan.reviewMode === 'diff') { // only secrets about to be pushed matter for a diff review
    const kept = findings.splice(before).filter((f) => f.severity === 'CRITICAL');
    findings.push(...kept);
  }
}

// ---- Dedupe: same path + line + category -> keep the longer (clearer) one ------------------
const byKey = new Map();
for (const f of findings) {
  const key = `${f.path}:${f.line}:${f.category}`;
  const prev = byKey.get(key);
  if (!prev || SEVERITIES.indexOf(f.severity) < SEVERITIES.indexOf(prev.severity)
    || (f.severity === prev.severity && f.issue.length > prev.issue.length)) byKey.set(key, f);
}
const unique = [...byKey.values()];

// ---- Collapse the same issue repeated across many files into one bullet --------------------
// "Same issue" = same severity + category + issue text with quoted/backticked values removed.
const shape = (f) => `${f.severity}|${f.category}|${f.issue.replace(/`[^`]*`|"[^"]*"|'[^']*'|\d+/g, '…').toLowerCase()}`;
const shapes = new Map();
for (const f of unique) { const s = shape(f); if (!shapes.has(s)) shapes.set(s, []); shapes.get(s).push(f); }

const bySev = Object.fromEntries(SEVERITIES.map((s) => [s, []]));
for (const group of shapes.values()) {
  group.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
  const files = new Set(group.map((f) => f.path));
  const first = group[0];
  if (files.size > 3) {
    bySev[first.severity].push({
      sortPath: first.path, sortLine: first.line,
      text: `- ${first.issue} (and ${group.length - 1} similar) → ${first.fix} _(${first.category})_: ${group.map((f) => `\`${f.where}\``).join(', ')}`,
    });
  } else {
    for (const f of group) bySev[f.severity].push({ sortPath: f.path, sortLine: f.line, text: `- \`${f.where}\` — ${f.issue} → ${f.fix} _(${f.category})_` });
  }
}

// ---- Output --------------------------------------------------------------------------------
const count = (s) => unique.filter((f) => f.severity === s).length;
const out = [
  'COUNTS',
  `critical: ${count('CRITICAL')} | standard: ${count('STANDARD')} | minor: ${count('MINOR')} | batches reviewed: ${plan.batches.length - missing.length}/${plan.batches.length}`,
  '',
];
const titles = { CRITICAL: 'Critical Issues', STANDARD: 'Standards Violations', MINOR: 'Minor Issues' };
for (const s of SEVERITIES) {
  out.push(`## ${titles[s]}`, '');
  const items = bySev[s].sort((a, b) => a.sortPath.localeCompare(b.sortPath) || a.sortLine - b.sortLine);
  out.push(...(items.length ? items.map((i) => i.text) : ['- none']), '');
}
if (approved.size) out.push('## Approved Patterns', '', ...[...approved].slice(0, 3).map((a) => `- ${a}`), '');

out.push('CONTEXT');
if (!context.size) out.push('none');
for (const [, lines] of [...context].sort(([a], [b]) => a.localeCompare(b))) out.push(...[...lines].sort());
out.push('', 'NOT_REVIEWED');
// File lists only when few batches are missing (final report); otherwise ids, to keep output short.
out.push(...(!missing.length ? ['none'] : missing.length <= 3
  ? missing.map((b) => `batch ${b.id}: ${b.files.join(', ')}`)
  : [`batches ${missing.map((b) => b.id).join(', ')} (${missing.reduce((n, b) => n + b.files.length, 0)} files) — review them, or list them by batch in the report`]));
out.push('', 'UNPARSED', ...(unparsed.length ? unparsed : ['none']), '');
process.stdout.write(out.join('\n'));
