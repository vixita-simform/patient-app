#!/usr/bin/env node
/**
 * Step 4 — render reference screenshots of the design, one per state.
 *
 * Serves the extracted app.html, drives a Chromium over the DevTools protocol
 * (Node's built-in fetch + WebSocket, no Puppeteer), and for every state in
 * states.seed.json (+ user overrides) navigates fresh, applies the steps, and
 * writes:
 *   ref/<state>.png            viewport capture
 *   ref/<state>.full.png       scroll containers expanded (whole screen content)
 *   ref/<state>.computed.json  visible elements: rect + resolved styles + own text
 *
 * State steps:
 *   { "set": "Component", "name": "hookName", "hook": 3?, "value": any }   set a useState hook through the React fiber
 *   { "click": "Visible text" }                                            click the smallest element with that text
 *   { "waitMs": 300 }
 *   { "eval": "js expression" }
 *
 * The design loads React/Babel from a CDN, so this needs network access.
 *
 * Usage:
 *   node render-reference.mjs --extract design/.rdr [--states .claude/react-design-to-rn/states.json]
 *        [--only HomeScreen,LoginScreen.mfaStep] [--width 320] [--height 680] [--dpr 2]
 *        [--cdp-port 9222]   (use an already-running Chromium; default: launch headless Chrome)
 *        [--chrome <path>] [--no-full] [--no-computed] [--out <dir>]
 *        [--unclamp]  remove a fixed max-width app column (render at device width, e.g. --width 393 --out design/.rdr/ref-device)
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true;
    else {
      out[a.slice(2)] = next;
      i += 1;
    }
  }
  return out;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.jsx': 'text/plain', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
function serve(dir) {
  const server = http.createServer((req, res) => {
    const p = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(dir) || !existsSync(p)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, port: server.address().port })));
}

function findChrome(explicit) {
  const c = [
    explicit,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return c.find((p) => existsSync(p));
}

async function launchChrome(bin) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), 'rdr-chrome-'));
  const proc = spawn(bin, [`--headless=new`, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 50; i += 1) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`);
      return { port, proc };
    } catch {
      await sleep(200);
    }
  }
  proc.kill();
  throw new Error('Chrome did not expose its debugging port');
}

async function connect(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else ok(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((ok, reject) => {
      id += 1;
      pending.set(id, { resolve: ok, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return { send, evaluate, close: () => ws.close(), targetId: target.id };
}

// Runs in the page. Sets a useState hook on every mounted instance of a component.
const PAGE_HELPERS = `
window.__rdrFibers = (name) => {
  const host = document.getElementById('root') || document.body.firstElementChild;
  const key = host && Object.keys(host).find((k) => k.startsWith('__reactContainer$'));
  if (!key) return [];
  let start = host[key];
  if (start && start.stateNode && start.stateNode.current) start = start.stateNode.current;
  const out = [];
  const stack = [start];
  while (stack.length) {
    const f = stack.pop();
    if (!f) continue;
    if (typeof f.type === 'function' && (f.type.name === name || f.type.displayName === name)) out.push(f);
    if (f.sibling) stack.push(f.sibling);
    if (f.child) stack.push(f.child);
  }
  return out;
};
window.__rdrSet = async (name, idx, value) => {
  for (let t = 0; t < 30; t += 1) {
    const fibers = window.__rdrFibers(name);
    if (fibers.length) {
      for (const f of fibers) {
        let h = f.memoizedState;
        for (let i = 0; i < idx && h; i += 1) h = h.next;
        if (!h || !h.queue || !h.queue.dispatch) return 'hook ' + idx + ' of ' + name + ' is not a useState';
        h.queue.dispatch(value);
      }
      return 'ok';
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return 'component ' + name + ' not mounted';
};
window.__rdrClick = (text) => {
  const all = [...document.querySelectorAll('body *')].filter((e) => (e.innerText || '').trim() === text && e.offsetParent !== null);
  const el = all.sort((a, b) => a.innerText.length - b.innerText.length || b.querySelectorAll('*').length - a.querySelectorAll('*').length).pop() || all[0];
  if (!el) return 'no element with text ' + JSON.stringify(text);
  el.click();
  return 'ok';
};
window.__rdrComputed = () => {
  const keys = ['color','backgroundColor','backgroundImage','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textAlign','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderTopColor','borderRadius','opacity','boxShadow','gap'];
  const skip = { backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none', paddingTop: '0px', paddingRight: '0px', paddingBottom: '0px', paddingLeft: '0px', marginTop: '0px', marginRight: '0px', marginBottom: '0px', marginLeft: '0px', borderTopWidth: '0px', borderRadius: '0px', opacity: '1', boxShadow: 'none', gap: 'normal', letterSpacing: 'normal', textAlign: 'start' };
  const root = document.getElementById('root');
  const out = [];
  for (const el of root.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    const s = {};
    for (const k of keys) { const v = cs[k]; if (v !== skip[k] && !(k === 'borderTopColor' && cs.borderTopWidth === '0px')) s[k] = v; }
    if (el.tagName === 'svg' || el.closest('svg') !== el && el.closest('svg')) { if (el.tagName !== 'svg') continue; }
    out.push({ tag: el.tagName.toLowerCase(), ...(own ? { text: own.slice(0, 60) } : {}), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), style: s });
  }
  return out;
};
window.__rdrUnclamp = () => {
  // drop a fixed max-width app column so the page fills a device-width viewport
  for (const el of [...document.querySelectorAll('#root, #root *')].slice(0, 400)) {
    const mw = getComputedStyle(el).maxWidth;
    if (mw !== 'none' && parseFloat(mw) < window.innerWidth) el.style.maxWidth = 'none';
  }
  return true;
};
window.__rdrExpand = () => {
  const scrollers = [...document.querySelectorAll('#root *')].filter((e) => { const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1; });
  for (const s of scrollers) {
    let e = s;
    while (e && e !== document.documentElement) { e.style.height = 'auto'; e.style.maxHeight = 'none'; e.style.minHeight = '0'; e.style.overflow = 'visible'; e = e.parentElement; }
  }
  document.documentElement.style.height = 'auto'; document.body.style.height = 'auto'; document.body.style.overflow = 'visible';
  return Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
};
`;

async function main() {
  const a = args(process.argv.slice(2));
  const extract = resolve(a.extract || 'design/.rdr');
  const seed = JSON.parse(readFileSync(join(extract, 'states.seed.json'), 'utf8'));
  const hooks = JSON.parse(readFileSync(join(extract, 'hooks.json'), 'utf8'));
  const userStatesPath = a.states ? resolve(a.states) : resolve('.claude/react-design-to-rn/states.json');
  const userStates = existsSync(userStatesPath) ? JSON.parse(readFileSync(userStatesPath, 'utf8')).states ?? {} : {};
  const states = { ...seed.states, ...userStates };
  const only = a.only ? String(a.only).split(',').map((s) => s.trim()) : null;
  const ids = Object.keys(states).filter((id) => !only || only.some((o) => id === o || id.startsWith(`${o}.`) || states[id].screen === o && !o.includes('.')));
  if (!ids.length) throw new Error(`No states match --only ${a.only}`);

  const width = Number(a.width || 320);
  const height = Number(a.height || 680);
  const dpr = Number(a.dpr || 2);
  const outDir = resolve(a.out || join(extract, 'ref'));
  mkdirSync(outDir, { recursive: true });

  const { server, port: httpPort } = await serve(extract);
  let chrome = null;
  let cdpPort = a['cdp-port'] ? Number(a['cdp-port']) : null;
  if (!cdpPort) {
    const bin = findChrome(a.chrome);
    if (!bin) throw new Error('No Chrome/Chromium/Edge found. Pass --chrome <path> or --cdp-port <port> of a running one.');
    chrome = await launchChrome(bin);
    cdpPort = chrome.port;
  }
  const cdp = await connect(cdpPort);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PAGE_HELPERS });
  const metrics = (h) => cdp.send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: dpr, mobile: true });

  const results = [];
  for (const id of ids) {
    const st = states[id];
    const log = [];
    try {
      await metrics(height);
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/app.html?state=${encodeURIComponent(id)}` });
      let mounted = false;
      for (let i = 0; i < 100 && !mounted; i += 1) {
        await sleep(150);
        mounted = await cdp.evaluate(`!!(document.getElementById('root') && document.getElementById('root').children.length && window.__rdrFibers)`).catch(() => false);
      }
      if (!mounted) throw new Error('app did not mount (network blocked? CDN scripts must load)');
      await cdp.evaluate('document.fonts.ready.then(() => true)');
      if (a.unclamp) await cdp.evaluate('window.__rdrUnclamp()');
      for (const step of st.steps ?? []) {
        if (step.set) {
          const idx = Number.isInteger(step.hook) && step.hook >= 0 ? step.hook : (hooks[step.set] ?? []).indexOf(step.name);
          if (idx < 0) throw new Error(`unknown hook ${step.set}.${step.name}`);
          const r = await cdp.evaluate(`window.__rdrSet(${JSON.stringify(step.set)}, ${idx}, ${JSON.stringify(step.value)})`);
          if (r !== 'ok') throw new Error(r);
          await sleep(120);
        } else if (step.click) {
          const r = await cdp.evaluate(`window.__rdrClick(${JSON.stringify(step.click)})`);
          if (r !== 'ok') throw new Error(r);
          await sleep(200);
        } else if (step.waitMs) await sleep(step.waitMs);
        else if (step.eval) await cdp.evaluate(step.eval);
      }
      await sleep(Number(a.settle || 350));
      if (a.unclamp) await cdp.evaluate('window.__rdrUnclamp()');
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(outDir, `${id}.png`), Buffer.from(shot.data, 'base64'));
      if (!a['no-computed']) writeFileSync(join(outDir, `${id}.computed.json`), JSON.stringify(await cdp.evaluate('window.__rdrComputed()'), null, 1));
      if (!a['no-full']) {
        const full = await cdp.evaluate('window.__rdrExpand()');
        if (full > height + 4) {
          await metrics(Math.min(full, 16000));
          await sleep(150);
          const s2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
          writeFileSync(join(outDir, `${id}.full.png`), Buffer.from(s2.data, 'base64'));
          log.push(`full ${full}px`);
        }
      }
      results.push({ id, ok: true, note: log.join('; ') });
    } catch (e) {
      results.push({ id, ok: false, error: e.message });
    }
  }
  cdp.close();
  server.close();
  if (chrome) chrome.proc.kill();

  const index = { generatedAt: new Date().toISOString(), viewport: { width, height, dpr }, results };
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  const ok = results.filter((r) => r.ok).length;
  console.log(`Rendered ${ok}/${results.length} states → ${outDir} (viewport ${width}x${height} @${dpr}x)`);
  for (const r of results.filter((x) => !x.ok)) console.log(`  FAIL ${r.id}: ${r.error}`);
  process.exit(ok === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
