import { SITE, esc, page, faqHTML, faqLD, writeOut } from './lib.mjs';

const list = (items, cls = 'check-list') => `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

export function renderProductPage(s, p, { addSitemap }) {
  const urlPath = p.url;
  const buy = `/api/checkout?sku=${p.sku}`;
  const buyBox = `<div class="buy-box"><p class="sales-price">${esc(p.priceDisplay)} <span class="calc-formula">USD, one-time</span></p><a class="button-primary" href="${buy}" data-track-click="checkout_click" data-sku="${p.sku}" rel="nofollow">Buy now — secure checkout with Stripe</a><ul><li>Instant download after payment is confirmed</li><li>${esc(s.formats)}</li><li>14-day refund, no questions asked</li><li>Version ${esc(p.version)} · ${esc(s.updated)}</li></ul><p class="calc-formula">A planning tool, not legal advice.</p></div>`;
  const gallery = `<section id="samples"><h2>Real pages from the kit</h2><p>These are screenshots of the actual files (examples use fictional data).</p><div class="gallery">${s.samples.map((g) => `<figure><a href="${g.src}" target="_blank" rel="noopener"><img src="${g.src}" alt="${esc(g.alt)}" width="${g.w || 1200}" height="${g.h || 800}" loading="lazy" decoding="async"></a><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div></section>`;
  const body = `<div class="container article-layout wide"><article class="article-content" data-offer-view="${p.sku}">
<p class="product-cta-label">Planning kit from LegalCostGuides</p><h1>${esc(s.h1)}</h1>
<div class="sales-hero"><div><p class="hero-copy-dark">${esc(s.outcome)}</p>${list(s.benefits)}</div>${buyBox}</div>
${s.video ? `<section id="demo"><h2>See it in 25 seconds</h2><video controls muted playsinline preload="none" width="1280" height="720" poster="${s.video.poster}" style="width:100%;height:auto;border-radius:8px;border:1px solid var(--line)"><source src="${s.video.src}" type="video/mp4"><track kind="captions" srclang="en" label="English" src="${s.video.vtt}" default>Your browser does not support video. The screenshots above show the same steps.</video><p class="calc-formula">Silent demo with captions, using the filled fictional example.</p></section>` : ''}
<section id="included"><h2>What's included</h2><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">File</th><th scope="col">Format</th><th scope="col">What it does</th></tr></thead><tbody>${s.files.map((f) => `<tr><td><strong>${esc(f.name)}</strong></td><td>${esc(f.format)}</td><td>${esc(f.does)}</td></tr>`).join('')}</tbody></table></div></section>
<section id="how-it-works"><h2>How it works</h2><ol>${s.steps.map((x) => `<li>${x}</li>`).join('')}</ol></section>
<section id="who"><h2>Who it's for, and who it isn't</h2><div class="row-2"><div><h3>Good fit</h3>${list(s.forWho)}</div><div><h3>Not a fit</h3>${list(s.notFor, 'check-list x-list')}</div></div></section>
<section id="details"><h2>Compatibility, delivery and support</h2><ul><li><strong>Compatibility:</strong> ${esc(s.compat)}</li><li><strong>Delivery:</strong> after Stripe confirms your payment you are taken to your download page. Bookmark it: it works for 12 months, and you can <a href="/access/recover">recover access</a> with your checkout email and order code.</li><li><strong>License:</strong> personal use for you, your household or one small business you own. Please don't resell or share the files. <a href="/refund-policy">Full license and refund policy</a>.</li><li><strong>Refunds:</strong> 14 days, no questions asked: email javiperezguides@gmail.com.</li><li><strong>Support:</strong> <a href="mailto:javiperezguides@gmail.com">javiperezguides@gmail.com</a>. We reply within 2 business days.</li><li><strong>Privacy:</strong> we use your email only to deliver and support your purchase. No mailing list.</li></ul></section>
<section id="limits"><h2>What this kit does not do</h2>${list(s.limits, 'check-list x-list')}</section>
${faqHTML(s.faq)}
<section id="buy" class="buy-again">${buyBox}</section>
${s.related ? `<p>Related guides: ${s.related.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(' · ')}</p>` : ''}
</article></div>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: s.description, image: s.samples.map((g) => SITE + g.src), brand: { '@type': 'Brand', name: 'LegalCostGuides' }, sku: p.sku, offers: { '@type': 'Offer', url: SITE + urlPath, price: String(p.price), priceCurrency: 'USD', availability: 'https://schema.org/InStock' } }];
  const fl = faqLD(s.faq); if (fl) jsonld.push(fl);
  writeOut(urlPath, page({ urlPath, title: s.title, description: s.description, body, crumbs: [{ name: 'Home', url: '/' }, { name: 'Planning kits', url: '/products/' }, { name: p.name, url: urlPath }], jsonld, ads: false, ogType: 'product', ogImage: s.samples[0].src }));
  addSitemap(urlPath, s.updatedISO);
}
