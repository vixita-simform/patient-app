#!/usr/bin/env node
/**
 * Makes an HTML design file extractable, without touching the original.
 *
 * The extractor refuses this design as-is for two reasons:
 * 1. It rejects external `<link>` tags (the Google Fonts lines) as "linked-css".
 * 2. It needs an `id` on every `div.phone`, and the design has none.
 *
 * This writes `apps/mobile/design/<basename>.src.html` with the external links removed and
 * an id on every phone, slugged from the `.frame-label` just before it
 * ("Billing &amp; payments" → `billing-and-payments`). Then it points
 * `.claude/html-design-to-rn/config.local.json` at both files.
 *
 * Usage: node prepare-source.mjs <path/to/design.html> [--out <file>]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

const CONFIG_LOCAL = '.claude/html-design-to-rn/config.local.json';

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

/** "<span>9</span>Billing &amp; payments" → "billing-and-payments" */
export function slugFromLabel(labelHtml) {
  const text = labelHtml
    .replace(/<span[^>]*>.*?<\/span>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? ' ');
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** External <link> tags (stylesheet / preconnect / preload) the extractor rejects. */
const EXTERNAL_LINK = /^[ \t]*<link\b[^>]*\bhref\s*=\s*["']https?:\/\/[^>]*>[ \t]*\r?\n?/gim;

/**
 * Returns the patched HTML plus a report. Throws on a phone with no label or a
 * duplicate id, because either would silently mis-map screens to specs.
 */
export function prepareSource(html) {
  const removedLinks = html.match(EXTERNAL_LINK)?.map((l) => l.trim()) ?? [];
  let out = html.replace(EXTERNAL_LINK, '');

  // Walk opening tags in order: remember the latest .frame-label, consume it at the next .phone.
  const tagRe = /<div\b([^>]*)>/gi;
  const screens = [];
  const seen = new Map();
  let pendingLabel = null;
  let result = '';
  let last = 0;
  let m;
  while ((m = tagRe.exec(out))) {
    const attrs = m[1];
    const cls = attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1].split(/\s+/) ?? [];
    if (cls.includes('frame-label')) {
      const close = out.indexOf('</div>', tagRe.lastIndex);
      pendingLabel = out.slice(tagRe.lastIndex, close);
      continue;
    }
    if (!cls.includes('phone')) continue;

    const existingId = attrs.match(/\bid\s*=\s*["']([^"']*)["']/i)?.[1];
    const labelText =
      pendingLabel === null
        ? null
        : pendingLabel
            .replace(/<span[^>]*>.*?<\/span>/gis, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .trim();
    let id = existingId;
    if (!id) {
      if (pendingLabel === null) {
        throw new Error(`div.phone #${screens.length + 1} has no id and no .frame-label before it — cannot name it`);
      }
      id = slugFromLabel(pendingLabel);
      if (!id) throw new Error(`div.phone #${screens.length + 1}: label "${labelText}" slugs to an empty id`);
      result += out.slice(last, m.index) + `<div${attrs} id="${id}">`;
      last = tagRe.lastIndex;
    }
    if (seen.has(id)) {
      throw new Error(`duplicate screen id "${id}" (screens #${seen.get(id)} and #${screens.length + 1}) — rename one .frame-label`);
    }
    seen.set(id, screens.length + 1);
    screens.push({ id, label: labelText, idSource: existingId ? 'existing' : 'label' });
    pendingLabel = null;
  }
  result += out.slice(last);
  return { html: result, screens, removedLinks };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input] = process.argv.slice(2);
  if (!input || input.startsWith('--')) {
    console.error('usage: node prepare-source.mjs <path/to/design.html> [--out <file>]');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`not found: ${input}`);
    process.exit(1);
  }
  const outIdx = process.argv.indexOf('--out');
  const out = outIdx === -1 ? join('design', basename(input).replace(/\.html?$/i, '') + '.src.html') : process.argv[outIdx + 1];

  let report;
  try {
    report = prepareSource(readFileSync(input, 'utf8'));
  } catch (err) {
    console.error(`prepare-source: ${err.message}`);
    process.exit(2);
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, report.html);

  const local = existsSync(CONFIG_LOCAL) ? JSON.parse(readFileSync(CONFIG_LOCAL, 'utf8')) : {};
  local.source = { ...(local.source ?? {}), designFile: out, originalDesignFile: relative('.', input) };
  writeFileSync(CONFIG_LOCAL, JSON.stringify(local, null, 2) + '\n');

  console.log(`wrote ${out} (${report.screens.length} screens, ${report.removedLinks.length} external <link> removed)`);
  for (const s of report.screens) console.log(`  ${s.id.padEnd(24)} ← ${s.label ?? '(no label)'}${s.idSource === 'existing' ? '  [id already set]' : ''}`);
}
