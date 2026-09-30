/**
 * Phase 4, Gate B — visual comparison against a live Chromium target.
 * Companion to audit-styles.mjs (structural) — this one handles the pixel
 * side: serving the extracted design, driving an already-running Chromium
 * target over raw CDP (no browser-automation dependency — Node's own
 * fetch + WebSocket are enough), and diffing two screenshots.
 *
 * This does NOT launch a browser — argent's own convention (and this
 * project's argent rule) is that a Chromium target is already running with
 * a debug port; see references/verification.md's Gate B procedure for the
 * launch step and how to get a screenshot via argent.
 *
 * Usage:
 *   node capture-design.mjs serve --extract <dir> [--port 4173]
 *   node capture-design.mjs rect --cdp-port 9222 --screen <id> [--navigate "<js>"]
 *   node capture-design.mjs diff --before <png> --after <png> \
 *     [--before-rect x,y,w,h] [--after-rect x,y,w,h] --out <png> [--threshold 0.1]
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2'
};

/** A plain static file server for the extracted design — it has relative
 * asset/script paths, so it needs real HTTP, not file://. */
function serve(extractDir, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(extractDir, urlPath === '/' ? 'index.html' : urlPath);
    if (!filePath.startsWith(path.resolve(extractDir))) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  server.listen(port, () => {
    console.log(`Serving ${extractDir} at http://localhost:${port}/index.html`);
  });
}

/** Minimal CDP client — a JSON-RPC-over-WebSocket call, nothing more. Node's
 * native fetch/WebSocket (22+) are enough; no puppeteer/playwright needed. */
async function cdpEvaluate(cdpPort, expression) {
  const targets = await (await fetch(`http://localhost:${cdpPort}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error(`No page target on CDP port ${cdpPort} — is a Chromium browser running with --remote-debugging-port=${cdpPort}?`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const result = await new Promise((resolve, reject) => {
    const id = 1;
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      if (msg.error) reject(new Error(msg.error.message));
      else if (msg.result?.exceptionDetails) reject(new Error(msg.result.exceptionDetails.text));
      else resolve(msg.result?.result?.value);
      ws.close();
    });
    ws.addEventListener('error', (ev) => reject(new Error(String(ev.message ?? ev))));
  });
  return result;
}

/**
 * Navigate to a screen (if a JS expression to do so was given) and return
 * its container's bounding rect — in pixels and as 0-1 fractions of the
 * viewport, the same normalized space `argent`'s gesture/screenshot tools
 * use, so the result drops directly into a crop of an argent screenshot.
 */
async function rect(cdpPort, screenId, navigateJs) {
  if (navigateJs) await cdpEvaluate(cdpPort, `(() => { ${navigateJs}; return true; })()`);
  const expr = `(() => {
    const el = document.getElementById(${JSON.stringify(screenId)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
  })()`;
  const raw = await cdpEvaluate(cdpPort, expr);
  if (!raw) throw new Error(`No element with id "${screenId}" found on the page — is it the currently-active screen?`);
  return {
    ...raw,
    normalized: {
      x: raw.x / raw.viewportWidth,
      y: raw.y / raw.viewportHeight,
      width: raw.width / raw.viewportWidth,
      height: raw.height / raw.viewportHeight
    }
  };
}

function loadPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

/** Crop is optional — pass `x,y,w,h` in the image's own pixel space (not normalized). */
function cropPng(png, cropStr) {
  if (!cropStr) return png;
  const [x, y, w, h] = cropStr.split(',').map(Number);
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, x, y, w, h, 0, 0);
  return out;
}

function diff(beforeFile, afterFile, beforeRect, afterRect, outFile, threshold) {
  const before = cropPng(loadPng(beforeFile), beforeRect);
  const after = cropPng(loadPng(afterFile), afterRect);
  if (before.width !== after.width || before.height !== after.height) {
    throw new Error(
      `Cropped images differ in size: before ${before.width}x${before.height}, after ${after.width}x${after.height}. ` +
      `Crop rects must resolve to the same dimensions before diffing.`
    );
  }
  const out = new PNG({ width: before.width, height: before.height });
  const mismatched = pixelmatch(before.data, after.data, out.data, before.width, before.height, { threshold: 0.1 });
  const ratio = mismatched / (before.width * before.height);
  fs.writeFileSync(outFile, PNG.sync.write(out));
  const pass = ratio <= Number(threshold ?? 0.1);
  console.log(`${mismatched} mismatched px / ${before.width * before.height} total = ${(ratio * 100).toFixed(2)}% — diff written to ${outFile}`);
  console.log(`GATE B: ${pass ? 'PASS' : 'FAIL'} (threshold ${threshold ?? 0.1})`);
  process.exit(pass ? 0 : 1);
}

const [cmd] = process.argv.slice(2, 3);
const args = parseArgs(process.argv.slice(3));

if (cmd === 'serve') {
  if (!args.extract) throw new Error('serve needs --extract <dir>');
  serve(path.resolve(args.extract), Number(args.port ?? 4173));
} else if (cmd === 'rect') {
  if (!args['cdp-port'] || !args.screen) throw new Error('rect needs --cdp-port <port> --screen <id>');
  const result = await rect(Number(args['cdp-port']), args.screen, args.navigate);
  console.log(JSON.stringify(result, null, 2));
} else if (cmd === 'diff') {
  if (!args.before || !args.after || !args.out) throw new Error('diff needs --before <png> --after <png> --out <png>');
  diff(args.before, args.after, args['before-rect'], args['after-rect'], args.out, args.threshold);
} else {
  console.error('Usage: capture-design.mjs <serve|rect|diff> ...  — see file header for each command\'s args.');
  process.exit(2);
}
