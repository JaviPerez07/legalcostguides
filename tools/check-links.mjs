#!/usr/bin/env node
/** Internal link + structural check for the static site. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let files = 0, checked = 0;

const REDIRECT_OK = new Set(['/', '']);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'reports') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function resolveTarget(fromFile, href) {
  let clean = href.split('#')[0].split('?')[0];
  if (clean === '') return null;
  const base = clean.startsWith('/') ? ROOT : path.dirname(fromFile);
  const rel = clean.startsWith('/') ? clean.slice(1) : clean;
  const candidate = path.join(base, rel);
  const tries = [candidate, candidate + '.html', path.join(candidate, 'index.html')];
  return tries.some((t) => fs.existsSync(t)) ? true : candidate;
}

for (const file of walk(ROOT)) {
  files++;
  const html = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(ROOT, file);

  if (html.includes('<!--LCG-AFF:START-->') !== html.includes('<!--LCG-AFF:END-->')) {
    errors.push(`${relFile}: unbalanced LCG-AFF markers`);
  }
  const opens = (html.match(/<!--LCG-AFF:START-->/g) || []).length;
  const closes = (html.match(/<!--LCG-AFF:END-->/g) || []).length;
  if (opens !== closes) errors.push(`${relFile}: ${opens} LCG-AFF START vs ${closes} END`);

  const asides = (html.match(/<aside class="affiliate-box"/g) || []).length;
  const asideCloses = (html.match(/<\/aside>/g) || []).length;
  if (asides > asideCloses) errors.push(`${relFile}: unclosed affiliate-box aside`);

  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) continue;
    checked++;
    const res = resolveTarget(file, href);
    if (res !== true && res !== null) {
      errors.push(`${relFile}: broken internal link "${href}"`);
    }
  }
}

console.log(`link check: ${files} files, ${checked} internal links`);
if (errors.length) {
  console.error(`${errors.length} ERROR(S):`);
  for (const e of errors.slice(0, 30)) console.error('  ' + e);
  process.exit(1);
}
console.log('Link check passed.');
