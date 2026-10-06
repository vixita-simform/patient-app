#!/usr/bin/env node
/**
 * usage-report.js — token usage for the current review, read from Claude Code's local
 * session logs (~/.claude/projects/<project>/*.jsonl). Read-only, no dependencies.
 *
 * Usage:
 *   node .claude/skills/code-review/scripts/usage-report.js --since <ISO timestamp> [--json]
 *
 *   --since   Only count API calls at/after this time (use `startedAt` from plan-batches.js).
 *   --json    Print JSON instead of the Markdown section.
 *
 * The review runs in the main session, so that row is the whole cost. Sub-agent rows only
 * appear if something else launched agents in this repo during the review.
 * Numbers are exact token counts from the API responses Claude Code logged. Calls made after
 * this script runs (e.g. writing the final chat message) are not included.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const sinceArg = opt('--since', null);
const since = sinceArg ? Date.parse(sinceArg) : Date.now() - 6 * 3600 * 1000;
const asJson = args.includes('--json');
const cwd = process.cwd();

// ---- Locate the project log folder ---------------------------------------------------
const roots = [
  process.env.CLAUDE_CONFIG_DIR && path.join(process.env.CLAUDE_CONFIG_DIR, 'projects'),
  path.join(os.homedir(), '.claude', 'projects'),
  path.join(os.homedir(), '.config', 'claude', 'projects'),
].filter((r) => r && fs.existsSync(r));

function walk(dir, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

// Only files touched since the review started, belonging to this repo (matched by cwd).
const files = [];
for (const root of roots) {
  for (const f of walk(root)) {
    try { if (fs.statSync(f).mtimeMs >= since - 60 * 1000) files.push(f); } catch { /* ignore */ }
  }
}

// ---- Parse ---------------------------------------------------------------------------
const textOf = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((c) => (c && (c.text || (typeof c.content === 'string' ? c.content : ''))) || '').join('\n');
  return '';
};
const blank = () => ({ calls: 0, input: 0, output: 0, cacheWrite: 0, cacheRead: 0, models: new Set() });
const add = (acc, u, model) => {
  acc.calls += 1;
  acc.input += u.input_tokens || 0;
  acc.output += u.output_tokens || 0;
  acc.cacheWrite += u.cache_creation_input_tokens || 0;
  acc.cacheRead += u.cache_read_input_tokens || 0;
  if (model && !model.startsWith('<')) acc.models.add(model);
};

const seen = new Set(); // dedupe: Claude Code logs one line per content block with the same usage
const total = blank();
const main = blank();
const agents = new Map(); // key -> {label, usage, first, last}
const byModel = new Map();
let first = Infinity, last = 0, matchedFiles = 0;

for (const file of files) {
  let lines;
  try { lines = fs.readFileSync(file, 'utf8').split('\n'); } catch { continue; }
  const entries = [];
  let belongs = false;
  for (const line of lines) {
    if (!line.trim()) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    if (e.cwd && path.resolve(e.cwd) === cwd) belongs = true;
    entries.push(e);
  }
  if (!belongs) continue;
  matchedFiles += 1;
  const fileIsSubagent = /[\\/]subagents[\\/]|[\\/]agent-[^\\/]*\.jsonl$/.test(file);

  for (const e of entries) {
    const sidechain = fileIsSubagent || e.isSidechain === true;
    const key = sidechain ? `${file}#${e.agentId || ''}` : null;
    if (sidechain && !agents.has(key)) agents.set(key, { label: null, usage: blank(), first: Infinity, last: 0 });

    // Label each sub-agent by the batch id in its first prompt ("Review batch 3.")
    if (sidechain && e.type === 'user' && !agents.get(key).label) {
      const m = textOf(e.message && e.message.content).match(/Review batch (\d+)/i);
      if (m) agents.get(key).label = `Batch ${m[1]}`;
    }

    const u = e.message && e.message.usage;
    if (e.type !== 'assistant' || !u) continue;
    const t = Date.parse(e.timestamp || '');
    if (!Number.isFinite(t) || t < since) continue;
    const id = `${(e.message && e.message.id) || ''}:${e.requestId || ''}`;
    if (id !== ':' && seen.has(id)) continue;
    seen.add(id);

    const model = e.message.model;
    add(total, u, model);
    add(sidechain ? agents.get(key).usage : main, u, model);
    if (model && !model.startsWith('<')) { if (!byModel.has(model)) byModel.set(model, blank()); add(byModel.get(model), u, model); }
    if (sidechain) { const a = agents.get(key); a.first = Math.min(a.first, t); a.last = Math.max(a.last, t); }
    first = Math.min(first, t); last = Math.max(last, t);
  }
}

// ---- Output --------------------------------------------------------------------------
const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : `${n}`);
const allIn = (a) => a.input + a.cacheWrite + a.cacheRead;
const dur = (ms) => { if (!Number.isFinite(ms) || ms <= 0) return '—'; const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`; };
const agentRows = [...agents.values()].filter((a) => a.usage.calls > 0)
  .sort((x, y) => (parseInt((x.label || '').replace(/\D/g, ''), 10) || 1e9) - (parseInt((y.label || '').replace(/\D/g, ''), 10) || 1e9));

const result = {
  since: new Date(since).toISOString(),
  found: total.calls > 0,
  logFilesMatched: matchedFiles,
  duration: dur(last - Math.min(first, since)),
  total: { ...total, models: [...total.models], totalInput: allIn(total) },
  mainSession: { ...main, models: [...main.models] },
  subAgents: agentRows.map((a) => ({ label: a.label || 'Other sub-agent', ...a.usage, models: [...a.usage.models], duration: dur(a.last - a.first) })),
  byModel: [...byModel].map(([m, a]) => ({ model: m, calls: a.calls, input: allIn(a), output: a.output })),
};

if (asJson) { process.stdout.write(JSON.stringify(result, null, 2) + '\n'); process.exit(0); }

if (!result.found) {
  process.stdout.write([
    '## Session Usage',
    '',
    '_Token usage not available — no Claude Code session logs found for this repo since the review started._',
    '_Run `/cost` (API) or `/usage` (Pro/Max plan) in Claude Code to see it._',
    '',
  ].join('\n'));
  process.exit(0);
}

const cacheHit = allIn(total) ? Math.round((total.cacheRead / allIn(total)) * 100) : 0;
const out = [
  '## Session Usage',
  '',
  `**Total:** ${k(allIn(total) + total.output)} tokens (${k(allIn(total))} in · ${k(total.output)} out) · ${total.calls} API calls · ${result.duration}`,
  `**Cache:** ${k(total.cacheRead)} read · ${k(total.cacheWrite)} written · ${cacheHit}% of input served from cache`,
  `**Models:** ${result.total.models.join(', ') || 'unknown'}`,
  '',
  '| Part | Calls | Input | Output | Time |',
  '|---|---:|---:|---:|---:|',
  `| Review session | ${main.calls} | ${k(allIn(main))} | ${k(main.output)} | — |`,
  ...agentRows.map((a) => `| ${a.label || 'Other sub-agent'} | ${a.usage.calls} | ${k(allIn(a.usage))} | ${k(a.usage.output)} | ${dur(a.last - a.first)} |`),
  '',
  '_Input includes cached tokens. Exact counts from Claude Code logs; the final chat message is not included. For cost or plan limits run `/cost` or `/usage`._',
  '',
];
process.stdout.write(out.join('\n'));
