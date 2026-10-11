import { esc, readJSON } from './lib.mjs';

let _products, _offers;
export function products() { return (_products ||= readJSON('content/products.json')); }
export function offers() { return (_offers ||= readJSON('data/affiliate-offers.json').offers); }

export function productBySku(sku) { return products().items.find((p) => p.sku === sku); }

export function isLive(p) { return p && (p.status === 'live' || p.status === 'preview'); }

// Contextual product CTA. `context` gives page-specific copy; falls back to the product's default.
export function productCTA(sku, { pagePath, placement = 'in_content', context = null } = {}) {
  const p = productBySku(sku);
  if (!isLive(p)) return '';
  const headline = context?.headline || p.cta.headline;
  const copy = context?.copy || p.cta.copy;
  const img = p.cta.image ? `<img class="product-cta-img" src="${p.cta.image}" alt="${esc(p.cta.imageAlt || '')}" width="320" height="200" loading="lazy" decoding="async">` : '';
  return `<aside class="product-cta" data-track="cta" data-sku="${p.sku}" data-placement="${placement}" data-page="${esc(pagePath)}"><div class="product-cta-body"><p class="product-cta-label">Our planning kit · ${esc(p.priceDisplay)}</p><h2 class="product-cta-title">${esc(headline)}</h2><p>${esc(copy)}</p><p class="product-cta-actions"><a class="button-primary" href="${p.url}" data-track-click="cta_click">${esc(p.cta.button)}</a><a class="product-cta-free" href="/free/questions-before-you-hire-a-lawyer">Or get the free 10-question checklist</a></p><p class="product-cta-fine">A planning and organizing tool, not legal advice. Instant download after payment · 14-day refund.</p></div>${img}</aside>`;
}

// LawDepot affiliate widget: our own card, clearly marked as affiliate. Preserves the platform-generated tracking URL.
export function lawdepotWidget(keys, { pagePath, placement = 'in_content', heading = null, copy = null } = {}) {
  const items = (keys || []).map((k) => [k, offers()[k]]).filter(([, o]) => o && o.url);
  if (!items.length) return '';
  const cards = items.slice(0, 3).map(([k, o]) => `<li><a class="ld-card" href="${esc(o.url)}" rel="sponsored nofollow noopener" target="_blank" data-track-click="affiliate_click" data-offer="${k}"><span class="ld-card-name">${esc(o.name)}</span><span class="ld-card-go">Open on LawDepot →</span></a></li>`).join('');
  return `<aside class="ld-widget" data-track="affiliate" data-provider="lawdepot" data-placement="${placement}" data-page="${esc(pagePath)}" aria-label="Affiliate: document templates on LawDepot"><p class="ld-label"><span class="ld-badge">Affiliate</span> Document templates from LawDepot, a third-party service</p>${heading ? `<h2 class="ld-title">${esc(heading)}</h2>` : ''}<p class="ld-copy">${esc(copy || 'If your situation is simple and undisputed, a template can cover the paperwork. LawDepot is not a law firm and is not affiliated with LegalCostGuides beyond this affiliate program.')}</p><ul class="ld-cards">${cards}</ul><p class="ld-disclosure">We may earn a commission if you buy through these links. It does not change your price or our cost figures. <a href="/affiliate-disclosure">How we make money</a>.</p></aside>`;
}

export function relatedHTML(slugs, titles) {
  const items = (slugs || []).filter((s) => titles[s]).slice(0, 6);
  if (!items.length) return '';
  return `<section class="related-section" id="related"><h2>Related guides</h2><ul class="related-list">${items.map((s) => `<li><a href="${titles[s].url}">${esc(titles[s].title)}</a></li>`).join('')}</ul></section>`;
}
