#!/usr/bin/env node
/**
 * Step 5 — pixel diff of a design reference vs the RN app screenshot.
 *
 * Crops device chrome off the actual (status bar / home indicator / tab bar),
 * scales it to the reference width, compares row by row, and reports the
 * vertical bands where they differ so a fix list can point at "the card
 * header around 40–48% height" instead of a bare percentage.
 *
 * Usage:
 *   node diff-screens.mjs --ref ref/HomeScreen.png --actual sim.png --out diff.png
 *        [--crop-actual top,bottom]  px or % of height, e.g. 6%,4% or 120,90
 *        [--crop-ref top,bottom] [--threshold 0.12] [--json]
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { load } from './lib/resolve.mjs';

const { PNG } = load('pngjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[argv[i].slice(2)] = true;
      else {
        out[argv[i].slice(2)] = next;
        i += 1;
      }
    }
  }
  return out;
}

const read = (p) => PNG.sync.read(readFileSync(p));

function crop(img, spec) {
  if (!spec) return img;
  const [t, b] = String(spec).split(',').map((v) => (v?.endsWith('%') ? Math.round((parseFloat(v) / 100) * img.height) : Number(v || 0)));
  const h = img.height - t - b;
  const out = new PNG({ width: img.width, height: h });
  img.data.copy(out.data, 0, t * img.width * 4, (t + h) * img.width * 4);
  return out;
}

/** Box-filter resize to a target width, keeping aspect ratio. */
function resizeToWidth(img, width) {
  if (img.width === width) return img;
  const s = img.width / width;
  const height = Math.round(img.height / s);
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.floor(x * s);
      const y0 = Math.floor(y * s);
      const x1 = Math.min(img.width, Math.max(x0 + 1, Math.floor((x + 1) * s)));
      const y1 = Math.min(img.height, Math.max(y0 + 1, Math.floor((y + 1) * s)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy += 1)
        for (let xx = x0; xx < x1; xx += 1) {
          const i = (yy * img.width + xx) * 4;
          r += img.data[i];
          g += img.data[i + 1];
          b += img.data[i + 2];
          a += img.data[i + 3];
          n += 1;
        }
      const o = (y * width + x) * 4;
      out.data[o] = r / n;
      out.data[o + 1] = g / n;
      out.data[o + 2] = b / n;
      out.data[o + 3] = a / n;
    }
  }
  return out;
}

function main() {
  const a = args(process.argv.slice(2));
  if (!a.ref || !a.actual) {
    console.error('Usage: node diff-screens.mjs --ref <png> --actual <png> [--out diff.png] [--crop-actual t,b] [--crop-ref t,b] [--threshold 0.12] [--json]');
    process.exit(2);
  }
  const ref = crop(read(a.ref), a['crop-ref']);
  const act = resizeToWidth(crop(read(a.actual), a['crop-actual']), ref.width);
  const threshold = Number(a.threshold ?? 0.12);
  const w = ref.width;
  const h = Math.min(ref.height, act.height);
  const diff = new PNG({ width: w, height: h });
  const rowBad = new Array(h).fill(0);
  let bad = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const dr = ref.data[i] - act.data[i];
      const dg = ref.data[i + 1] - act.data[i + 1];
      const db = ref.data[i + 2] - act.data[i + 2];
      const d = Math.sqrt(dr * dr + dg * dg + db * db) / 441.7;
      const gray = 0.3 * ref.data[i] + 0.59 * ref.data[i + 1] + 0.11 * ref.data[i + 2];
      if (d > threshold) {
        bad += 1;
        rowBad[y] += 1;
        diff.data.set([255, 0, 0, 255], i);
      } else diff.data.set([gray, gray, gray, 70], i);
    }
  }
  // group rows with >3% mismatching pixels into bands
  const bands = [];
  let cur = null;
  for (let y = 0; y < h; y += 1) {
    const hot = rowBad[y] / w > 0.03;
    if (hot && !cur) cur = { y0: y, y1: y, px: 0 };
    if (hot) {
      cur.y1 = y;
      cur.px += rowBad[y];
    }
    if ((!hot || y === h - 1) && cur) {
      if (cur.y1 - cur.y0 >= 2) bands.push(cur);
      cur = null;
    }
  }
  // merge bands closer than 1% of height
  const merged = [];
  for (const b of bands) {
    const last = merged[merged.length - 1];
    if (last && b.y0 - last.y1 < h * 0.01) {
      last.y1 = b.y1;
      last.px += b.px;
    } else merged.push({ ...b });
  }
  if (a.out) writeFileSync(a.out, PNG.sync.write(diff));
  const result = {
    mismatchPct: +((bad / (w * h)) * 100).toFixed(2),
    compared: { width: w, height: h },
    heightDelta: act.height - ref.height,
    bands: merged
      .sort((x, y) => y.px - x.px)
      .slice(0, 12)
      .map((b) => ({ fromPct: +((b.y0 / h) * 100).toFixed(1), toPct: +((b.y1 / h) * 100).toFixed(1), y: [b.y0, b.y1], mismatchPx: b.px })),
    diff: a.out ?? null,
  };
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`mismatch ${result.mismatchPct}% over ${w}x${h} (actual is ${result.heightDelta >= 0 ? '+' : ''}${result.heightDelta}px taller than ref)`);
    for (const b of result.bands) console.log(`  band ${b.fromPct}%–${b.toPct}% (y ${b.y[0]}–${b.y[1]}): ${b.mismatchPx}px`);
    if (a.out) console.log(`diff → ${a.out}`);
  }
}

main();
