// LegalCostGuides static site build: content/ + data/ -> dist/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DIST, SITE, BUILD_DATE, esc, readJSON, page, byline, DISCLAIMER, sourcesHTML, faqHTML, faqLD, articleLD, insertAfterSection, firstPublished, writeOut, fmtDate } from './lib.mjs';
import { productCTA, lawdepotWidget, relatedHTML, products, isLive, productBySku } from './components.mjs';
import { renderStates } from './states.mjs';

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const sitemap = []; // {loc, lastmod}
const addSitemap = (urlPath, lastmod) => sitemap.push({ loc: SITE + urlPath, lastmod: lastmod || BUILD_DATE });

// ---------- Topic content ----------
const topicDir = path.join(ROOT, 'content/pages');
const topics = fs.readdirSync(topicDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(topicDir, f), 'utf8')));
const toolDir = path.join(ROOT, 'content/tools');
const tools = fs.existsSync(toolDir) ? fs.readdirSync(toolDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(toolDir, f), 'utf8'))) : [];

export const titles = {};
for (const t of [...topics, ...tools]) titles[t.slug] = { title: t.h1 || t.title, url: '/pages/' + t.slug, summary: t.summary, short: t.navTitle || t.h1 };

const ctaContext = readJSON('content/cta-context.json');

function renderArticle(t, { kind }) {
  const urlPath = '/pages/' + t.slug;
  const published = firstPublished(`pages/${t.slug}.html`);
  const crumbs = [{ name: 'Home', url: '/' }, kind === 'tool' ? { name: 'Calculators', url: '/calculators' } : { name: 'Guides', url: '/guides' }, { name: t.navTitle || t.h1, url: urlPath }];
  let body = t.body;
  const ctx = ctaContext[t.slug] || {};
  const sku = ctx.product ?? t.product;
  if (sku && sku !== 'none') body = insertAfterSection(body, ctx.productAfter || 2, productCTA(sku, { pagePath: urlPath, placement: 'mid_article', context: ctx.copy }));
  if (t.lawdepot?.length) body = insertAfterSection(body, ctx.lawdepotAfter || 4, lawdepotWidget(t.lawdepot, { pagePath: urlPath, placement: 'mid_article', heading: ctx.lawdepotHeading, copy: ctx.lawdepotCopy }));
  let toolHTML = t.tool ? `<div class="tool-wrap">${t.tool}</div>` : '';
  if (toolHTML.includes('<!--SC_DATA-->')) {
    const disp = readJSON('data/states-display.json');
    const data = Object.fromEntries(disp.map((d) => [d.slug, { name: d.name, limit: d.sc.limit, limitText: d.sc.limitText, feeText: d.sc.feeText, feeVaries: d.sc.feeVaries, serviceText: d.sc.serviceText }]));
    toolHTML = toolHTML.replace('<!--SC_OPTIONS-->', disp.map((d) => `<option value="${d.slug}">${esc(d.name)}</option>`).join('')).replace('<!--SC_DATA-->', `<script type="application/json" id="sc-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
  }
  const html = `<div class="container article-layout"><article class="article-content"><h1>${esc(t.h1)}</h1>${byline({ lastReviewed: t.lastReviewed, published, nSources: t.sources?.length })}${DISCLAIMER}<div class="quick-answer" role="note"><p class="quick-answer-label">Short answer</p><p>${esc(t.summary)}</p></div>${toolHTML}<nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p></nav>${body}${faqHTML(t.faq)}${sourcesHTML(t.sources)}${relatedHTML(t.related, titles)}</article></div>`;
  const jsonld = [articleLD({ urlPath, headline: t.h1, description: t.description, published, modified: t.lastReviewed })];
  const fl = faqLD(t.faq); if (fl) jsonld.push(fl);
  if (kind === 'tool') jsonld.push({ '@context': 'https://schema.org', '@type': 'WebApplication', name: t.h1, applicationCategory: 'FinanceApplication', operatingSystem: 'Any (web browser)', url: SITE + urlPath, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
  writeOut(urlPath, page({ urlPath, title: t.title, description: t.description, body: html, crumbs, jsonld }));
  addSitemap(urlPath, t.lastReviewed);
}

for (const t of topics) renderArticle(t, { kind: 'topic' });
for (const t of tools) renderArticle(t, { kind: 'tool' });

// ---------- States ----------
renderStates({ addSitemap, titles });

// ---------- Static/trust pages ----------
const siteDir = path.join(ROOT, 'content/site');
for (const f of fs.readdirSync(siteDir).filter((x) => x.endsWith('.json'))) {
  const s = JSON.parse(fs.readFileSync(path.join(siteDir, f), 'utf8'));
  const crumbs = s.urlPath === '/' ? null : [{ name: 'Home', url: '/' }, { name: s.crumb || s.h1, url: s.urlPath }];
  let body = s.body;
  if (s.hub) body = body.replace('<!--HUB-->', hubList(s.hub));
  if (s.products) body = body.replace('<!--PRODUCTS-->', productGrid());
  const head = s.noByline ? '' : byline({ lastReviewed: s.lastReviewed, published: null, nSources: s.sources?.length });
  const html = s.raw ? body : `<div class="container article-layout${s.wide ? ' wide' : ''}"><article class="article-content"><h1>${esc(s.h1)}</h1>${head}${body}${faqHTML(s.faq)}${sourcesHTML(s.sources)}</article></div>`;
  const jsonld = s.jsonld || [];
  const fl = faqLD(s.faq); if (fl) jsonld.push(fl);
  writeOut(s.urlPath, page({ urlPath: s.urlPath, title: s.title, description: s.description, body: html, crumbs, jsonld, ads: s.ads !== false, robots: s.robots || undefined, ogType: s.urlPath === '/' ? 'website' : 'article' }));
  if (!s.noindex && !(s.robots || '').includes('noindex')) addSitemap(s.urlPath, s.lastReviewed);
}

function hubList(kind) {
  const groups = readJSON('content/hubs.json')[kind];
  return groups.map((g) => `<section id="${g.id}"><h2>${esc(g.title)}</h2>${g.intro ? `<p>${esc(g.intro)}</p>` : ''}<ul class="hub-list">${g.slugs.filter((s) => titles[s]).map((s) => `<li><a href="${titles[s].url}">${esc(titles[s].title)}</a><span>${esc(trimSentence(titles[s].summary))}</span></li>`).join('')}</ul></section>`).join('');
}
function trimSentence(s) { if (!s) return ''; const m = s.match(/^.{40,220}?[.!?](\s|$)/); return m ? m[0].trim() : s.slice(0, 200) + '…'; }

function productGrid() {
  const items = products().items.filter(isLive);
  if (!items.length) return '<p class="note">Our planning kits are being finalized. Check back soon.</p>';
  return `<ul class="product-grid">${items.map((p) => `<li class="product-card"><a href="${p.url}">${p.cta.image ? `<img src="${p.cta.image}" alt="${esc(p.cta.imageAlt)}" width="320" height="200" loading="lazy">` : ''}<span class="product-card-name">${esc(p.name)}</span></a><span class="product-card-price">${esc(p.priceDisplay)}</span><p>${esc(p.cta.copy)}</p></li>`).join('')}</ul>`;
}

// ---------- Product sales pages ----------
const prodDir = path.join(ROOT, 'content/products');
if (fs.existsSync(prodDir)) {
  for (const f of fs.readdirSync(prodDir).filter((x) => x.endsWith('.json'))) {
    const s = JSON.parse(fs.readFileSync(path.join(prodDir, f), 'utf8'));
    const p = productBySku(s.sku);
    if (!isLive(p)) continue;
    const { renderProductPage } = await import('./product-page.mjs');
    renderProductPage(s, p, { addSitemap });
  }
}

// ---------- Static files ----------
const copy = (rel, destRel = rel) => { const src = path.join(ROOT, rel); if (!fs.existsSync(src)) return; const dst = path.join(DIST, destRel); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.cpSync(src, dst, { recursive: true }); };
for (const f of ['styles.css', 'main.js', 'favicon.ico', 'favicon.svg', 'robots.txt', 'ads.txt', '_headers', '_redirects', 'sw.js']) copy(f);
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, 'assets'))) {
  if (f === 'src') continue;
  copy(path.join('assets', f));
}

// ---------- Sitemap ----------
sitemap.sort((a, b) => a.loc.localeCompare(b.loc));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);
console.log(`Built ${sitemap.length} indexable URLs into dist/`);
