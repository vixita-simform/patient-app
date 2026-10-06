#!/usr/bin/env node
/**
 * PreToolUse guard for the html-design-to-rn workflow.
 *
 * The design sources are enormous and reading them whole is the single largest
 * token sink in this workflow — and, worse, it is invisible: the run still
 * "works", it just costs ten times what it should and crowds out the context the
 * agent needs to be accurate.
 *
 * Every block below is something that actually happened during the port. Each
 * one names the cheap alternative rather than only saying no.
 *
 * Wired as a PreToolUse hook via this plugin's hooks/hooks.json.
 * Reads the tool call on stdin, exits 0 to allow, exits 2 with a reason on
 * stderr to block.
 */

const MB = 1024 * 1024;

// Real environment variable — Claude Code exports this to every hook process,
// unlike the ${CLAUDE_PLUGIN_ROOT} markdown substitution (which has known gaps
// in command/skill prose on some versions). Fall back to the doc-only path if
// it's ever missing, so the message still tells the reader what to do.
const SKILL_SCRIPTS = process.env.CLAUDE_PLUGIN_ROOT
  ? `${process.env.CLAUDE_PLUGIN_ROOT}/skills/html-design-to-rn/scripts`
  : '<html-design-to-rn plugin install dir>/skills/html-design-to-rn/scripts';

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0); // Never break the session over an unparsable payload.
  }

  const tool = payload.tool_name ?? payload.toolName ?? '';
  const args = payload.tool_input ?? payload.toolInput ?? {};
  const target = String(args.file_path ?? args.path ?? '');
  const command = String(args.command ?? '');

  const block = (reason) => {
    process.stderr.write(reason);
    process.exit(2);
  };

  /* ---------------------------------------------------- the raw design bundle */

  // A bundler-v1 export runs 2.6 MB, mostly base64; a real inline-style export
  // has run 500+ KB too. Either way, reading it will not tell you anything and
  // will crowd out your context — the extractor exists to turn it into files
  // you can read cheaply. Gated on actual size, not just the path: a small
  // companion file that happens to sit in apps/mobile/design/ (a token preview page, a
  // README-ish doc) is not the token sink this guards against, and blocking it
  // anyway just forces a pointless detour through an extractor that doesn't
  // even apply to it.
  const RAW_DESIGN_THRESHOLD = 20000 * 1024;
  const isRawDesign = /(^|\/)design\/[^/]+\.html$/i.test(target);
  if (isRawDesign && /^(Read|NotebookRead)$/.test(tool)) {
    let bytes = null;
    try {
      bytes = require('fs').statSync(target).size;
    } catch {
      /* can't stat it (doesn't exist yet, or a race) — fall through and allow */
    }
    if (bytes !== null && bytes > RAW_DESIGN_THRESHOLD) {
      block(
        `BLOCKED: ${target} is ${(bytes / 1024).toFixed(0)} KB — the packed design bundle.\n` +
          `Reading it will not tell you anything and will crowd out your context.\n\n` +
          `Run phase 0 instead, then read what it produced:\n` +
          `  node ${SKILL_SCRIPTS}/extract-design.mjs "${target}" --out apps/mobile/design/.extracted\n` +
          `  apps/mobile/design/.extracted/inventory.json   <- the index; start here\n`
      );
    }
  }

  // Same file via the shell.
  if (/^Bash$/.test(tool) && /design\/[^"']*\.html/i.test(command)) {
    const readsWhole = /\b(cat|head|tail|less|more|strings)\b/.test(command);
    const greps = /\b(grep|rg|wc|node|python3?|jq|sed -n)\b/.test(command);
    if (readsWhole && !greps) {
      const m = command.match(/design\/[^"'\s]*\.html/i);
      let bytes = null;
      try {
        bytes = m && require('fs').statSync(m[0]).size;
      } catch {
        /* can't resolve/stat the path from the command text — block to be safe */
      }
      if (bytes === null || bytes > RAW_DESIGN_THRESHOLD) {
        block(
          `BLOCKED: that pipes the packed design bundle into your context.\n\n` +
            `Extract it once, then work from apps/mobile/design/.extracted/. If you must inspect the\n` +
            `raw file, derive the answer in code and print only the result:\n` +
            `  node -e "…" | head -20\n`
        );
      }
    }
  }

  /* ------------------------------------------------- the extracted stylesheet */

  // app.css is not a source any more: phase 0 compiles every rule to React
  // Native and writes each screen the slice its own class names reach. Reading
  // the raw stylesheet to re-translate a rule by hand costs context *and*
  // reintroduces the transcription errors the compile step exists to remove.
  if (/^Read$/.test(tool) && /design\/\.extracted\/styles\/app\.css$/.test(target)) {
    block(
      `BLOCKED: app.css is already compiled to React Native.\n\n` +
        `Read your screen's slice instead — it has the RN property, the expression\n` +
        `to paste, the CSS it came from and the theme token it references:\n` +
        `  apps/mobile/design/.extracted/styles/rn/<NN-Screen>.json   (inventory.screens[].styleFile)\n` +
        `  apps/mobile/design/.extracted/styles/rn/_global.json       (element-level resets)\n\n` +
        `If a compiled value is wrong, fix scripts/lib/css-model.mjs and re-run phase 0.\n` +
        `Do not hand-translate around it.\n`
    );
  }

  // Same rule, via the shell.
  if (/^Bash$/.test(tool) && /\.extracted\/styles\/app\.css/.test(command) && /\b(cat|head|tail|less|more)\b/.test(command)) {
    block(
      `BLOCKED: app.css is already compiled — read apps/mobile/design/.extracted/styles/rn/<NN-Screen>.json.\n`
    );
  }

  /* ------------------------------------------------- extracted screen sources */

  // A bundler-v1 screens/*.jsx file often declares 20-30 components; one
  // screen is a slice. An inline-style export's screens/*.html is usually one
  // screen already (phase 0 splits on the screen container), so this rarely
  // fires for that shape — kept for the same reason: a screen that happens to
  // be unusually large is still a slice, not a whole-file read.
  if (/^Read$/.test(tool) && /design\/\.extracted\/screens\/.*\.(jsx|html)$/.test(target)) {
    const hasWindow = args.offset !== undefined || args.limit !== undefined;
    let big = false;
    try {
      big = require('fs').statSync(target).size > 12 * 1024;
    } catch {
      /* file may not exist yet; fall through */
    }
    if (big && !hasWindow) {
      block(
        `BLOCKED: ${target.split('/').pop()} declares many components; you want one.\n\n` +
          `Find its line range, then Read that window:\n` +
          `  grep -n 'const <ScreenName>' ${target}\n` +
          `  Read(file_path, offset: <start>, limit: <length>)\n\n` +
          `inventory.json screens[].components lists what each file declares.\n`
      );
    }
  }

  /* ---------------------------------------------- inline-style behaviour script */

  // An inline-style export's shared navigation/state script (scripts/app.js)
  // is everything the design's JS does, in one file — a real one has run to
  // ~3000 lines / several hundred KB. A screen only needs the handler
  // functions its own markup references (inventory.json screens[].handlers).
  if (/^Read$/.test(tool) && /design\/\.extracted\/scripts\/[^/]+\.js$/.test(target)) {
    const hasWindow = args.offset !== undefined || args.limit !== undefined;
    let big = false;
    try {
      big = require('fs').statSync(target).size > 12 * 1024;
    } catch {
      /* file may not exist yet; fall through */
    }
    if (big && !hasWindow) {
      block(
        `BLOCKED: ${target.split('/').pop()} is the whole shared behaviour script.\n\n` +
          `Grep for the functions your screen actually uses instead:\n` +
          `  grep -n 'function renderJoblist' ${target}\n` +
          `then Read with offset/limit. inventory.json screens[].renderFns names the\n` +
          `function that fills a runtime-rendered screen, and the screen's\n` +
          `<NN-Screen>.facts.json "handlers" lists what its markup calls.\n`
      );
    }
  }

  /* ------------------------------------------------------ vendor + binaries */

  if (/^Read$/.test(tool) && /design\/\.extracted\/vendor\//.test(target)) {
    block(
      `BLOCKED: vendor/ is React, ReactDOM and Babel (~4 MB), not design content.\n` +
        `It exists so the extracted index.html runs for the pixel gate. Nothing to read.\n`
    );
  }

  /* ------------------------------------------- generated files are generated */

  if (
    /^(Edit|Write|MultiEdit)$/.test(tool) &&
    /src\/theme\/(Colors|Gradients|Shadows)\.ts$/.test(target)
  ) {
    process.stderr.write(
      `NOTE: ${target.split('/').pop()} is generated from apps/mobile/design/.extracted/inventory.json.\n` +
        `Hand edits are lost on the next run. Change gen-theme.mjs and re-run:\n` +
        `  node ${SKILL_SCRIPTS}/gen-theme.mjs --extract apps/mobile/design/.extracted --out apps/mobile/src/theme\n`
    );
    process.exit(0); // Warn, do not block — a deliberate edit is sometimes right.
  }

  process.exit(0);
});
