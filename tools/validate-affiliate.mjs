#!/usr/bin/env node
/** Build-time gate for the LawDepot affiliate implementation. Exits non-zero on any failure. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const offersFile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliate-offers.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliate-page-map.json'), 'utf8'));
const AFFID = offersFile.affiliate_id;
const approved = new Set(Object.values(offersFile.offers).map((o) => o.url));

const errors = [];
const warnings = [];
const stats = { files: 0, affiliateLinks: 0, hubLinks: 0, tierA: 0, tierB: 0, tierC: 0 };

const EXEMPT_LINK_CAP = new Set(['legal-document-tools.html', 'pages/lawyer-cost-calculator.html']);

function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'reports') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(path.relative(ROOT, full));
  }
  return acc;
}

const anchorRe = /<a\b[^>]*href="([^"]*lawdepot\.com[^"]*)"[^>]*>/gi;

for (const rel of htmlFiles(ROOT)) {
  stats.files++;
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const tier = (map.pages[rel] && map.pages[rel].tier) || (rel === 'legal-document-tools.html' ? 'HUB' : rel === 'affiliate-disclosure.html' ? 'LEGAL' : null);
  if (tier === 'A') stats.tierA++; else if (tier === 'B') stats.tierB++; else if (tier === 'C') stats.tierC++;

  const anchors = [...html.matchAll(anchorRe)];
  stats.affiliateLinks += anchors.length;

  for (const m of anchors) {
    const tag = m[0];
    const href = m[1].replace(/&amp;/g, '&');

    if (!href.includes(`pid=pg-${AFFID}-`)) errors.push(`${rel}: LawDepot link without affiliate id → ${href}`);
    if (!href.includes('loc=US')) errors.push(`${rel}: LawDepot link without loc=US → ${href}`);
    if (!approved.has(href)) errors.push(`${rel}: LawDepot link not in the approved inventory → ${href}`);
    if (/loc=(?!US)/.test(href) || /\/es\//.test(href) || /lawdepot\.es/.test(href)) errors.push(`${rel}: non-US LawDepot destination → ${href}`);

    const rel_ = (tag.match(/rel="([^"]*)"/i) || [, ''])[1];
    for (const token of ['sponsored', 'nofollow', 'noopener']) {
      if (!rel_.includes(token)) errors.push(`${rel}: affiliate anchor missing rel="${token}" → ${href}`);
    }
    if (!/target="_blank"/i.test(tag)) errors.push(`${rel}: affiliate anchor missing target="_blank" → ${href}`);
  }

  if (tier === 'C' && anchors.length > 0 && !EXEMPT_LINK_CAP.has(rel)) {
    errors.push(`${rel}: Tier C page must not contain an external LawDepot offer (${anchors.length} found)`);
  }

  if (anchors.length > 0) {
    if (!html.includes('affiliate-disclosure-inline')) errors.push(`${rel}: affiliate link present but no inline disclosure`);
    if (!html.includes('href="/affiliate-disclosure"')) errors.push(`${rel}: affiliate link present but no link to the disclosure page`);
  }

  if (!EXEMPT_LINK_CAP.has(rel) && tier && tier !== 'HUB' && tier !== 'LEGAL') {
    if (anchors.length > 2) errors.push(`${rel}: ${anchors.length} affiliate links (max 2 on an editorial page)`);
    const buttons = (html.match(/class="affiliate-cta"/g) || []).length;
    if (buttons > 1) errors.push(`${rel}: ${buttons} affiliate buttons (max 1 on an editorial page)`);
  }

  const hub = (html.match(/href="\/legal-document-tools"/g) || []).length;
  stats.hubLinks += hub;
  if (tier && tier !== 'HUB' && hub === 0) errors.push(`${rel}: no internal link to ${map.hub_url}`);

  const hubTag = html.match(/<a\b[^>]*href="\/legal-document-tools"[^>]*>/i);
  if (hubTag && /sponsored/i.test(hubTag[0])) errors.push(`${rel}: internal hub link must not be rel="sponsored"`);

  if (tier && !html.includes('>Affiliate Disclosure</a>')) errors.push(`${rel}: footer is missing the Affiliate Disclosure link`);

  for (const bad of ['is a law firm', 'legal advice from LawDepot', 'guaranteed', 'money-back guarantee', 'free forever', 'limited time', '% off']) {
    if (html.toLowerCase().includes(bad.toLowerCase()) && anchors.length > 0) {
      warnings.push(`${rel}: review copy — contains "${bad}" on a page with affiliate links`);
    }
  }
}

for (const required of ['legal-document-tools.html', 'affiliate-disclosure.html']) {
  if (!fs.existsSync(path.join(ROOT, required))) errors.push(`missing required page: ${required}`);
}
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const slug of ['legal-document-tools', 'affiliate-disclosure']) {
  if (!sitemap.includes(`https://legalcostguides.com/${slug}`)) errors.push(`sitemap.xml is missing /${slug}`);
}
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/legal-document-tools/.test(robots)) errors.push('robots.txt blocks /legal-document-tools');

console.log(`scanned ${stats.files} html files`);
console.log(`tiers: A=${stats.tierA} B=${stats.tierB} C=${stats.tierC}`);
console.log(`external LawDepot links: ${stats.affiliateLinks} | internal hub links: ${stats.hubLinks}`);
for (const w of warnings) console.log('WARN  ' + w);
if (errors.length) {
  console.error(`\n${errors.length} ERROR(S):`);
  for (const e of errors.slice(0, 40)) console.error('  ' + e);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log('\nAffiliate validation passed.');
