// Shared rendering helpers for the LegalCostGuides static build.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

export const SITE = 'https://legalcostguides.com';
export const SITE_NAME = 'LegalCostGuides';
export const ADSENSE_CLIENT = 'ca-pub-3733223915347669';
export const CONTACT_EMAIL = 'javiperezguides@gmail.com';
export const BUILD_DATE = process.env.LCG_BUILD_DATE || '2026-10-11';
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
export const DIST = path.join(ROOT, 'dist');

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

export function hashFile(rel) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 10);
}

export function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const firstCommitCache = {};
export function firstPublished(relFile) {
  if (relFile in firstCommitCache) return firstCommitCache[relFile];
  let v = null;
  try {
    const out = execSync(`git log --diff-filter=A --follow --format=%as -- "${relFile}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n').filter(Boolean);
    v = out.length ? out[out.length - 1] : null;
  } catch { v = null; }
  firstCommitCache[relFile] = v;
  return v;
}

export function writeOut(urlPath, html) {
  // urlPath like '/pages/foo' or '/' or '/states/'
  let file;
  if (urlPath === '/') file = 'index.html';
  else if (urlPath.endsWith('/')) file = urlPath.slice(1) + 'index.html';
  else file = urlPath.slice(1) + '.html';
  const full = path.join(DIST, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

export const NAV = {
  practice: [
    ['/pages/personal-injury-lawyer-cost', 'Personal Injury'],
    ['/pages/divorce-lawyer-cost', 'Divorce'],
    ['/pages/criminal-defense-lawyer-cost', 'Criminal Defense'],
    ['/pages/dui-lawyer-cost', 'DUI'],
    ['/pages/bankruptcy-lawyer-cost', 'Bankruptcy'],
    ['/pages/immigration-lawyer-cost', 'Immigration'],
    ['/pages/estate-planning-lawyer-cost', 'Estate Planning'],
    ['/pages/real-estate-lawyer-cost', 'Real Estate'],
    ['/pages/employment-lawyer-cost', 'Employment'],
    ['/pages/business-lawyer-cost', 'Business'],
  ],
};

function header() {
  const dd = NAV.practice.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('');
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner"><a href="/" class="site-logo" aria-label="LegalCostGuides home"><span class="logo-mark" aria-hidden="true">LC</span><span class="logo-text">Legal<span>CostGuides</span></span></a><nav class="nav-desktop" aria-label="Main"><div class="nav-dropdown"><button class="nav-trigger" type="button" aria-expanded="false" aria-controls="nav-practice">Practice Areas</button><div class="dropdown-menu" id="nav-practice">${dd}</div></div><a href="/guides">Guides</a><a href="/calculators">Calculators</a><a href="/states/">States</a><a href="/products/">Planning Kits</a><a href="/about">About</a></nav><button class="mobile-nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile"><a href="/guides">Guides</a><a href="/calculators">Calculators</a><a href="/states/">State Guides</a><a href="/products/">Planning Kits</a><a href="/about">About</a><a href="/contact">Contact</a></nav></header>`;
}

function footer() {
  const col = (title, links) => `<div><h2 class="footer-h">${esc(title)}</h2><ul>${links.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-footer"><div class="container"><div class="footer-grid">${col('Practice Areas', NAV.practice.slice(0, 6))}${col('Guides & Tools', [['/pages/how-much-does-a-lawyer-cost', 'How Much Does a Lawyer Cost?'], ['/pages/lawyer-consultation-fee', 'Consultation Fees'], ['/pages/contingency-fee-explained', 'Contingency Fees'], ['/pages/small-claims-court-cost', 'Small Claims Costs by State'], ['/pages/legal-aid-guide', 'Free Legal Aid'], ['/calculators', 'Calculators']])}${col('Planning Kits', [['/products/', 'All planning kits'], ['/free/questions-before-you-hire-a-lawyer', 'Free: 10 questions before you sign'], ['/refund-policy', 'Refunds & license'], ['/access/recover', 'Recover my download link']])}${col('About', [['/about', 'About'], ['/how-we-research', 'How We Research'], ['/editorial-policy', 'Editorial Policy'], ['/affiliate-disclosure', 'Advertising & Affiliates'], ['/contact', 'Contact'], ['/privacy-policy', 'Privacy Policy'], ['/terms', 'Terms'], ['/disclaimer', 'Disclaimer']])}</div><p class="footer-disclaimer"><strong>Not legal advice.</strong> LegalCostGuides publishes general information about legal costs in the United States. It is not a law firm, does not provide legal advice or referrals, and is not a substitute for a lawyer licensed in your state.</p><div class="footer-bottom"><span><button type="button" id="lcg-privacy-choices" class="footer-privacy-link" hidden>Privacy &amp; cookie settings</button></span><span>&copy; 2026 LegalCostGuides · Operated by Javi Pérez · <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></span></div></div></footer>`;
}

export function breadcrumbHTML(crumbs) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => i === crumbs.length - 1 ? `<li><span class="current" aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join('')}</ol></nav>`;
}

export function breadcrumbLD(crumbs) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.url })) };
}

export const PERSON = { '@type': 'Person', name: 'Javi Pérez', url: SITE + '/authors/javi-perez/', jobTitle: 'Independent legal-cost researcher (not a lawyer)' };
export const ORG = { '@type': 'Organization', name: SITE_NAME, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/assets/legalcostguides-logo-square.png' }, email: CONTACT_EMAIL };

export function page({ urlPath, title, description, body, crumbs = null, jsonld = [], ads = true, robots = 'index,follow,max-image-preview:large', ogType = 'article', extraHead = '', bodyClass = '', ogImage = '/assets/social-cover.png' }) {
  const canonical = SITE + (urlPath === '/' ? '/' : urlPath);
  const css = '/styles.css?v=' + hashFile('styles.css');
  const js = '/main.js?v=' + hashFile('main.js');
  const lds = [...jsonld, ...(crumbs ? [breadcrumbLD(crumbs)] : [])].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const adTags = ads ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});</script>
<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="${css}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${ogType}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1B2A4A">
${adTags}
${lds}
${extraHead}
<script src="${js}" defer></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>${header()}
${crumbs ? breadcrumbHTML(crumbs) : ''}
<main id="main" class="page-shell">${body}</main>
${footer()}
</body>
</html>
`;
}

export function byline({ lastReviewed, published, nSources }) {
  const pub = published ? `First published ${fmtDate(published)} · ` : '';
  return `<div class="editorial-byline"><img src="/assets/javi-perez-guides.jpg" alt="" width="48" height="48" loading="lazy"><div><strong>By <a href="/authors/javi-perez/">Javi Pérez</a></strong>, independent researcher (not a lawyer)<span class="byline-meta">${pub}Last reviewed <time datetime="${lastReviewed}">${fmtDate(lastReviewed)}</time>${nSources ? ` · ${nSources} sources cited below` : ''} · <a href="/how-we-research">How we research</a></span></div></div>`;
}

export const DISCLAIMER = `<p class="disclaimer-banner"><strong>General information, not legal advice.</strong> Fees and rules change and differ by court and county. Confirm current amounts with the court or a lawyer licensed in your state before you rely on them.</p>`;

export function sourcesHTML(sources) {
  if (!sources?.length) return '';
  return `<section id="sources" class="sources-section"><h2>Sources</h2><ol class="source-list">${sources.map((s, i) => `<li id="src-${i + 1}"><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a>${s.publisher ? ` — ${esc(s.publisher)}` : ''}${s.note ? `. <span class="source-note">${esc(s.note)}</span>` : ''}${s.accessed ? ` <span class="source-date">(checked ${fmtDate(s.accessed)})</span>` : ''}</li>`).join('')}</ol></section>`;
}

export function faqHTML(faq) {
  if (!faq?.length) return '';
  return `<section class="faq-section" id="faq"><h2>Frequently asked questions</h2>${faq.map((f, i) => `<details class="faq-item"${i === 0 ? ' open' : ''}><summary class="faq-question">${esc(f.q)}</summary><div class="faq-answer"><p>${esc(f.a)}</p></div></details>`).join('')}</section>`;
}

export function faqLD(faq) {
  if (!faq?.length) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function articleLD({ urlPath, headline, description, published, modified }) {
  return { '@context': 'https://schema.org', '@type': 'Article', headline: headline.slice(0, 110), description, mainEntityOfPage: SITE + urlPath, datePublished: published || modified, dateModified: modified, author: PERSON, publisher: ORG, inLanguage: 'en-US' };
}

// Insert html after the nth closing </section> of a body (1-based). Falls back to the end.
export function insertAfterSection(body, n, html) {
  if (!html) return body;
  let idx = -1, from = 0;
  for (let i = 0; i < n; i++) {
    idx = body.indexOf('</section>', from);
    if (idx === -1) return body + html;
    from = idx + 10;
  }
  return body.slice(0, from) + html + body.slice(from);
}
