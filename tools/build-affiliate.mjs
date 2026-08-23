#!/usr/bin/env node
/**
 * LegalCostGuides — LawDepot affiliate block builder.
 *
 * Idempotent: every injected fragment is wrapped in <!--LCG-AFF:START--> ... <!--LCG-AFF:END-->
 * and stripped before re-injection, so the script can be re-run safely.
 *
 *   node tools/build-affiliate.mjs           inject (affiliate CTAs on)
 *   node tools/build-affiliate.mjs --off     inject hub links only, no external CTAs
 *   node tools/build-affiliate.mjs --strip   remove every injected fragment
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const offers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliate-offers.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliate-page-map.json'), 'utf8'));

const MODE = process.argv.includes('--strip') ? 'strip'
  : process.argv.includes('--off') ? 'off' : 'on';

const START = '<!--LCG-AFF:START-->';
const END = '<!--LCG-AFF:END-->';
const REL = 'sponsored nofollow noopener';
const HUB = map.hub_url;
const DISC = map.disclosure_short;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function offerUrl(key) {
  const o = offers.offers[key];
  if (!o) throw new Error(`Unknown offer: ${key}`);
  return o.url;
}

function dataAttrs({ offer, page, placement, tier }) {
  return [
    'data-affiliate-provider="lawdepot"',
    `data-affiliate-offer="${esc(offer)}"`,
    `data-source-page="${esc(page)}"`,
    `data-placement="${esc(placement)}"`,
    `data-page-tier="${esc(tier)}"`,
    'data-destination-country="US"',
  ].join(' ');
}

function disclosure() {
  return `<p class="affiliate-disclosure-inline">${DISC} <a href="/affiliate-disclosure">Affiliate disclosure</a>.</p>`;
}

function box(cfg, pageUrl, placement) {
  return `${START}<aside class="affiliate-box" ${dataAttrs({ offer: cfg.offer, page: pageUrl, placement, tier: cfg.tier })}>` +
    `<p class="affiliate-box-label">Do-it-yourself option</p>` +
    `<h3 class="affiliate-box-title">${esc(cfg.title)}</h3>` +
    `<p class="affiliate-box-copy">${esc(cfg.copy)}</p>` +
    `<p class="affiliate-box-action"><a class="affiliate-cta" href="${esc(offerUrl(cfg.offer))}" rel="${REL}" target="_blank">${esc(cfg.cta)}</a></p>` +
    disclosure() +
    `</aside>${END}`;
}

function inline(cfg, pageUrl, placement, withDisclosure) {
  const url = offerUrl(cfg.inline_offer || cfg.offer);
  const anchor = cfg.inline_anchor || cfg.anchor;
  const before = cfg.inline_before || cfg.before || '';
  const after = cfg.inline_after || cfg.after || '';
  return `${START}<p class="affiliate-inline" ${dataAttrs({ offer: cfg.inline_offer || cfg.offer, page: pageUrl, placement, tier: cfg.tier })}>` +
    `${esc(before)}<a class="affiliate-link" href="${esc(url)}" rel="${REL}" target="_blank">${esc(anchor)}</a>${esc(after)}</p>` +
    (withDisclosure ? disclosure() : '') + END;
}

function hubNote(pageUrl) {
  return `${START}<p class="hub-link-note" data-source-page="${esc(pageUrl)}" data-placement="related_guides_footer">` +
    `<a href="${HUB}">${esc(map.hub_anchor)}</a> — which routine U.S. documents you can prepare yourself, and when you should not.</p>${END}`;
}

/** Insert `frag` just before the first `</section>` that follows `anchorIdx`. */
function insertBeforeSectionEnd(html, anchorIdx, frag) {
  const end = html.indexOf('</section>', anchorIdx);
  if (end === -1) return null;
  return html.slice(0, end) + frag + html.slice(end);
}

/** Insert `frag` just after the first `</section>` that follows `anchorIdx`. */
function insertAfterSectionEnd(html, anchorIdx, frag) {
  const end = html.indexOf('</section>', anchorIdx);
  if (end === -1) return null;
  const cut = end + '</section>'.length;
  return html.slice(0, cut) + frag + html.slice(cut);
}

function stripInjected(html) {
  return html.split(START).map((chunk, i) => {
    if (i === 0) return chunk;
    const e = chunk.indexOf(END);
    return e === -1 ? chunk : chunk.slice(e + END.length);
  }).join('');
}

function addFooterLink(html) {
  if (html.includes('>Affiliate Disclosure</a>')) return html;
  const re = /(<li><a href="[^"]*editorial-policy">Editorial Policy<\/a><\/li>)/;
  if (!re.test(html)) return html;
  return html.replace(re, '$1<li><a href="/affiliate-disclosure">Affiliate Disclosure</a></li>');
}

function pageUrlFor(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}

let changed = 0, skipped = 0;
const report = { A: 0, B: 0, C: 0, affiliate_links: 0, hub_links: 0 };

for (const [rel, cfg] of Object.entries(map.pages)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { skipped++; continue; }
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = stripInjected(html);

  if (MODE !== 'strip') {
    html = addFooterLink(html);
    const pageUrl = pageUrlFor(rel);
    const isState = rel.startsWith('states/') && rel !== 'states/index.html';
    const externalOk = MODE === 'on';

    if (cfg.tier === 'A' && externalOk) {
      const qa = html.indexOf('id="quick-answer"');
      const frag = box(cfg, pageUrl, 'post_quick_cost_breakdown');
      let next = qa !== -1 ? insertAfterSectionEnd(html, qa, frag) : null;
      if (!next) {
        const rs = html.indexOf('<section class="related-section">');
        next = rs !== -1 ? html.slice(0, rs) + frag + html.slice(rs) : null;
      }
      if (next) { html = next; report.affiliate_links++; }
      if (cfg.inline_offer) {
        const sb = html.indexOf('id="shared-cost-basics"');
        const f2 = inline(cfg, pageUrl, 'cost_basics_inline', false);
        const n2 = sb !== -1 ? insertBeforeSectionEnd(html, sb, f2) : null;
        if (n2) { html = n2; report.affiliate_links++; }
      }
      report.A++;
    } else if (cfg.tier === 'B' && externalOk) {
      const placement = isState ? 'cost_basics_inline' : 'cost_basics_inline';
      const anchorKey = isState ? 'id="reduce-legal-costs"' : 'id="shared-cost-basics"';
      const frag = inline(cfg, pageUrl, placement, true);
      let idx = html.indexOf(anchorKey);
      let next = idx !== -1 ? insertBeforeSectionEnd(html, idx, frag) : null;
      if (!next) {
        const rs = html.indexOf('<section class="related-section">');
        next = rs !== -1 ? html.slice(0, rs) + frag + html.slice(rs) : null;
      }
      if (next) { html = next; report.affiliate_links++; }
      report.B++;
    } else {
      report.C++;
    }

    // Every page — including Tier A and B — gets the internal hub link.
    const hf = hubNote(pageUrl);
    const rs = html.indexOf('<section class="related-section">');
    let placed = null;
    if (rs !== -1) placed = insertBeforeSectionEnd(html, rs, hf);
    if (!placed) {
      const or = html.indexOf('id="official-resources"');
      if (or !== -1) placed = insertBeforeSectionEnd(html, or, hf);
    }
    if (!placed) {
      const mainEnd = html.lastIndexOf('</main>');
      if (mainEnd !== -1) placed = html.slice(0, mainEnd) + hf + html.slice(mainEnd);
    }
    if (placed) { html = placed; report.hub_links++; }
  }

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}

console.log(`mode=${MODE} files_changed=${changed} skipped_missing=${skipped}`);
console.log(`tiers A=${report.A} B=${report.B} C=${report.C} | affiliate_blocks=${report.affiliate_links} hub_links=${report.hub_links}`);
