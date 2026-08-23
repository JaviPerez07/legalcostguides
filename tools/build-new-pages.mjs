#!/usr/bin/env node
/** Generates /legal-document-tools and /affiliate-disclosure from the site shell. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const offers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/affiliate-offers.json'), 'utf8')).offers;
const shell = fs.readFileSync(path.join(ROOT, 'terms.html'), 'utf8');

const DISC = 'We may earn a commission if you create a document through LawDepot. It does not change what you pay, and it does not affect the cost figures on this page.';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function head({ title, description, slug }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://legalcostguides.com/${slug}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" href="favicon.ico">
<link rel="stylesheet" href="styles.css">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="https://legalcostguides.com/${slug}">
<meta property="og:type" content="article">
<meta property="og:image" content="https://legalcostguides.com/assets/social-cover.svg">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="LegalCostGuides">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://legalcostguides.com/assets/social-cover.svg">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="theme-color" content="#1B2A4A">
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});</script>
<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">
<link rel="preconnect" href="https://googleads.g.doubleclick.net" crossorigin>
<link rel="dns-prefetch" href="https://googleads.g.doubleclick.net">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3733223915347669" crossorigin="anonymous"></script>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "WebPage", "name": ${JSON.stringify(title)}, "description": ${JSON.stringify(description)}, "url": "https://legalcostguides.com/${slug}", "publisher": {"@type": "Organization", "name": "LegalCostGuides", "email": "javiperezguides@gmail.com"}, "dateModified": "2026-08-23", "datePublished": "2026-08-23", "author": {"@type": "Person", "name": "Javi Pérez", "url": "https://legalcostguides.com/authors/javi-perez/"}}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://legalcostguides.com/"},{"@type":"ListItem","position":2,"name":${JSON.stringify(title)},"item":"https://legalcostguides.com/${slug}"}]}</script>

<script src="main.js" defer></script>
`;
}

const chromeStart = shell.indexOf('</head>');
const mainStart = shell.indexOf('<main');
const mainEnd = shell.indexOf('</main>') + '</main>'.length;
const chrome = shell.slice(chromeStart, mainStart);        // </head><body><header>...</nav>
const tail = shell.slice(mainEnd);                          // <footer>...</html>

const byline = `<div class="editorial-byline">
  <img src="/assets/javi-perez-guides.jpg" alt="Javi Pérez" width="48" height="48" loading="lazy">
  <div>
    <strong><a href="/authors/javi-perez/">Javi Pérez</a></strong> · Editor
    <a href="https://www.linkedin.com/in/javi-perez-guides" target="_blank" rel="noopener">LinkedIn</a>
    <span class="byline-meta">Last reviewed: August 2026 · Document availability and jurisdiction verified against the provider's U.S. catalogue</span>
  </div>
</div>`;

const disclaimerBanner = `<div class="disclaimer-banner"><strong>Legal Disclaimer:</strong> This content is for informational purposes only and does not constitute legal advice. Always consult a licensed attorney for your specific situation.</div>`;

function offerBlock(key, { good, bad, guide, guideLabel, cta }) {
  const o = offers[key];
  return `<div class="hub-offer" data-affiliate-provider="lawdepot" data-affiliate-offer="${esc(key)}" data-source-page="/legal-document-tools" data-placement="legal_document_hub" data-page-tier="HUB" data-destination-country="US">` +
    `<h3>${esc(o.name)}</h3>` +
    `<p class="hub-offer-good"><strong>Use it for:</strong> ${esc(good)}</p>` +
    `<p class="hub-offer-bad"><strong>Do not use it for:</strong> ${esc(bad)}</p>` +
    `<p class="hub-offer-links"><a href="${guide}">${esc(guideLabel)}</a> · Jurisdiction: United States</p>` +
    `<p class="affiliate-box-action"><a class="affiliate-cta" href="${esc(o.url)}" rel="sponsored nofollow noopener" target="_blank">${esc(cta)}</a></p>` +
    `</div>`;
}

const O = offerBlock;

const hubMain = `<main class="page-shell"><div class="container article-layout"><article class="article-content">
<h1>U.S. Legal Document Tools</h1>
${byline}
${disclaimerBanner}
<p class="affiliate-disclosure-inline">${esc(DISC)} <a href="/affiliate-disclosure">Read the full affiliate disclosure</a>.</p>
<p>Most of this site is about what lawyers charge. This page is about the other half of the question: which routine legal documents you can reasonably prepare yourself, and which ones you should not. Every document listed here is a United States version. Nothing on this page is legal advice, and the provider linked from this page is not a law firm.</p>
<p>The honest summary is short. Template documents work when the situation is ordinary, the parties agree, and your state's rules are clear. They stop working the moment there is a dispute, a deadline set by a court, money or property that is genuinely contested, or a fact pattern that a form cannot ask about. If you are in that second category, the money is better spent on an attorney than on a document.</p>

<section id="estate-planning" class="content-section"><h2>Estate Planning</h2>
<p>This is the category where do-it-yourself documents hold up best, because the decisions are yours to make and the formalities are published. It is also the category where a bad document does the most damage, since the person who signed it is not around to correct it.</p>
${O('last-will-and-testament', { good: 'naming beneficiaries, an executor, and a guardian for minor children when your estate is straightforward.', bad: 'blended families, business interests, estate-tax exposure, disinheriting a spouse, or anything you expect to be contested.', guide: '/pages/will-cost-guide', guideLabel: 'Compare with will preparation costs', cta: 'Create a Last Will and Testament' })}
${O('living-will', { good: 'recording end-of-life treatment preferences and naming a health-care agent.', bad: 'situations where capacity is already in question, or where family members disagree about care.', guide: '/pages/estate-planning-lawyer-cost', guideLabel: 'Compare with estate planning attorney fees', cta: 'Create a Living Will' })}
${O('power-of-attorney', { good: 'authorising someone to handle financial or property matters, generally or for a limited purpose.', bad: 'granting authority to someone you are not certain you can trust, or where a court has already appointed a guardian or conservator.', guide: '/pages/power-of-attorney-cost', guideLabel: 'Compare with power of attorney costs', cta: 'Create a Power of Attorney' })}
${O('revocable-living-trust', { good: 'holding assets in a trust to keep them out of probate when the estate is simple.', bad: 'tax-driven planning, funding the trust correctly, or any estate where the transfer of title is complicated. Funding is where most DIY trusts fail.', guide: '/pages/estate-planning-lawyer-cost', guideLabel: 'Compare with estate planning attorney fees', cta: 'Create a Revocable Living Trust' })}
</section>

<section id="family-and-divorce" class="content-section"><h2>Family and Divorce</h2>
<p>Documents help here only when the parties already agree. Nothing on this list resolves a dispute, and nothing on it substitutes for representation in a contested case involving children, support, or property.</p>
${O('separation-agreement', { good: 'writing down terms two spouses have already agreed on before filing.', bad: 'any case where custody, support, or property division is genuinely disputed, or where there is a history of coercion or abuse.', guide: '/pages/divorce-lawyer-cost', guideLabel: 'Compare with divorce attorney fees', cta: 'Create a Separation Agreement' })}
${O('separation-divorce-papers', { good: 'assembling the paperwork for an uncontested separation or divorce.', bad: 'contested proceedings, or as a replacement for your county court’s own required forms and filing procedure.', guide: '/pages/divorce-lawyer-cost', guideLabel: 'Compare with divorce attorney fees', cta: 'Create Separation or Divorce Papers' })}
${O('prenuptial-agreement', { good: 'setting out how property and debts are treated if a marriage ends.', bad: 'a prenup you want to hold up under pressure. Enforceability turns on disclosure, timing, and independent review — all of which a template cannot supply.', guide: '/pages/divorce-lawyer-cost', guideLabel: 'Compare with family law attorney fees', cta: 'Create a Prenuptial Agreement' })}
${O('power-of-attorney-for-child', { good: 'authorising a named adult to make day-to-day decisions for a child for a limited period, for example during travel or medical treatment.', bad: 'custody. This is not a custody order, it does not override one, and it has no effect in a custody case.', guide: '/pages/child-custody-lawyer-cost', guideLabel: 'Compare with child custody attorney fees', cta: 'Create a Power of Attorney for Child' })}
</section>

<section id="landlord-and-tenant" class="content-section"><h2>Landlord and Tenant</h2>
<p>A written, state-specific lease prevents a large share of the disputes that later cost thousands. Notices are different: they are procedural documents with rules a court will check.</p>
${O('residential-lease', { good: 'setting the terms of a residential tenancy in writing, drafted to your state’s rules.', bad: 'commercial premises, or fixing a tenancy that has already broken down.', guide: '/pages/landlord-tenant-lawyer-cost', guideLabel: 'Compare with landlord–tenant attorney fees', cta: 'Create a Residential Lease Agreement' })}
${O('eviction-notice', { good: 'serving the notice your state requires before an eviction can be filed.', bad: 'the eviction itself. A contested eviction, a habitability defence, or a fair-housing allegation is attorney work. Notice rules are strict and getting them wrong restarts the clock.', guide: '/pages/landlord-tenant-lawyer-cost', guideLabel: 'Compare with eviction costs', cta: 'Create an Eviction Notice' })}
</section>

<section id="real-estate" class="content-section"><h2>Real Estate</h2>
<p>Preparing the document yourself narrows what you are paying an attorney to do. It does not remove the attorney or title company from the closing in the states that require one.</p>
${O('real-estate-purchase-agreement', { good: 'setting out price, contingencies, and closing terms between a buyer and a seller.', bad: 'the closing itself, title problems, or any transaction where a lender, an estate, or a dispute is involved.', guide: '/pages/real-estate-lawyer-cost', guideLabel: 'Compare with real estate attorney fees', cta: 'Create a Purchase Agreement' })}
${O('quitclaim-deed', { good: 'transferring whatever interest you hold to someone else — typically between family members or into a trust.', bad: 'a sale to a third party. A quitclaim gives no warranty of title, and recording and tax consequences vary by county. Confirm both before you file.', guide: '/pages/real-estate-lawyer-cost', guideLabel: 'Compare with deed preparation costs', cta: 'Create a Quitclaim Deed' })}
</section>

<section id="business-and-contracts" class="content-section"><h2>Business and Contracts</h2>
<p>Routine commercial paperwork is the strongest case for templates. Negotiated agreements, investor terms, and anything with real downside risk are not.</p>
${O('llc-operating-agreement', { good: 'recording ownership, management, and distributions for a simple LLC.', bad: 'multi-class ownership, investor terms, buy-sell provisions, or partners who do not yet agree.', guide: '/pages/business-lawyer-cost', guideLabel: 'Compare with business attorney fees', cta: 'Create an Operating Agreement' })}
${O('nda', { good: 'a standard mutual or one-way confidentiality agreement before a commercial conversation.', bad: 'protecting anything you cannot afford to lose, or where the other side will negotiate the terms.', guide: '/pages/business-lawyer-cost', guideLabel: 'Compare with contract drafting costs', cta: 'Create an NDA' })}
${O('service-agreement', { good: 'scope, price, and payment terms for routine services between two businesses or a business and a client.', bad: 'regulated services, high-liability work, or contracts with indemnity and insurance terms that need review.', guide: '/pages/business-lawyer-cost', guideLabel: 'Compare with business attorney fees', cta: 'Create a Service Agreement' })}
${O('trademark-registration', { good: 'preparing and filing a straightforward trademark application.', bad: 'clearance searching, likelihood-of-confusion analysis, or responding to an office action — which is where most of the value of a trademark attorney sits.', guide: '/pages/trademark-lawyer-cost', guideLabel: 'Compare with trademark attorney fees', cta: 'Start a Trademark Registration' })}
</section>

<section id="employment" class="content-section"><h2>Employment</h2>
<p>These are employer-side documents. If you are the worker and something has already gone wrong — a termination, a wage problem, a discrimination claim — nothing on this list helps you, and an employment attorney will.</p>
${O('employment-contract', { good: 'setting out role, pay, and terms when hiring an employee.', bad: 'restrictive covenants you intend to enforce, or jurisdictions with specific statutory requirements you have not checked.', guide: '/pages/employment-lawyer-cost', guideLabel: 'Compare with employment attorney fees', cta: 'Create an Employment Contract' })}
${O('independent-contractor-agreement', { good: 'defining scope, payment, and ownership of work with a contractor.', bad: 'papering over a relationship that is really employment. Classification is decided by the facts, not by the label on the contract.', guide: '/pages/employment-lawyer-cost', guideLabel: 'Compare with employment attorney fees', cta: 'Create a Contractor Agreement' })}
${O('employment-termination-letter', { good: 'documenting an ordinary, uncontested end of employment.', bad: 'any termination involving a protected characteristic, a complaint, a leave of absence, or a severance negotiation. Those need advice before the letter goes out.', guide: '/pages/wrongful-termination-lawyer-cost', guideLabel: 'Compare with wrongful termination costs', cta: 'Create a Termination Letter' })}
</section>

<section id="consumer-and-small-claims" class="content-section"><h2>Consumer and Small Claims</h2>
<p>Most small claims cases are filed and argued without a lawyer, which makes this the category where a good document does the most work per dollar.</p>
${O('demand-letter', { good: 'a documented written demand for payment before filing in small claims.', bad: 'debts governed by the FDCPA if you are collecting on someone else’s behalf, or matters already in litigation.', guide: '/pages/small-claims-court-cost', guideLabel: 'Compare with small claims court costs', cta: 'Write a Demand Letter' })}
${O('settlement-agreement', { good: 'recording the terms of a settlement, including a release, once both sides have agreed.', bad: 'anything with ongoing obligations, structured payments, or a party who has not had a chance to take advice.', guide: '/pages/mediation-cost-guide', guideLabel: 'Compare with mediation costs', cta: 'Create a Settlement Agreement' })}
</section>

<section id="advice-not-documents" class="content-section"><h2>When you need advice, not a document</h2>
<p>Sometimes the problem is not a missing document — it is a question nobody has answered. Online legal-advice subscriptions price by the month rather than by the hour, which can be cheaper than a paid consultation for a single narrow question.</p>
${O('talk-to-a-lawyer', { good: 'asking a narrow question when you are not ready to retain anyone.', bad: 'representation. LawDepot is not a law firm, a subscription is not an attorney–client relationship, and nothing about it covers a hearing, a filing deadline, or a matter already in dispute.', guide: '/pages/lawyer-consultation-fee', guideLabel: 'Compare with lawyer consultation fees', cta: 'Compare subscription pricing' })}
</section>

<section id="do-not-use-a-template" class="content-section"><h2>When not to use a template</h2>
<p>There is no polite way to put this list, so here it is plainly. Do not rely on a template document if any of the following is true:</p>
<ul>
<li>The other side has a lawyer and you do not.</li>
<li>A court has set a deadline, or a case has already been filed.</li>
<li>The money or property at stake would be painful to lose.</li>
<li>Someone’s liberty, immigration status, or physical safety is involved.</li>
<li>The document has to survive a challenge — a contested will, a prenup, a non-compete.</li>
<li>You would not be able to explain, in a sentence, what each clause does.</li>
<li>Your state has a formality you have not verified: witnesses, notarisation, recording, or specific statutory language.</li>
</ul>
<p>In every one of those situations the cheapest outcome is usually the one where you paid an attorney early. Our <a href="/pages/how-much-does-a-lawyer-cost">lawyer cost guide</a> and the <a href="/pages/lawyer-cost-calculator">lawyer cost calculator</a> exist to make that number less of a surprise.</p>
</section>

<section id="when-to-hire" class="content-section"><h2>When to hire an attorney</h2>
<p>Hiring does not have to mean full representation. Limited-scope representation — sometimes called unbundled legal services — lets you pay for document review, coaching before a hearing, or help with a single filing, without retaining someone for the whole matter. For many readers that is the middle path between a $0 template and a $5,000 retainer.</p>
<p>If cost is the obstacle, start with <a href="/pages/legal-aid-guide">legal aid</a>, your state bar’s referral service, court self-help centres, and law school clinics. <a href="/pages/can-i-afford-a-lawyer">Can I afford a lawyer?</a> walks through those options in order.</p>
</section>

<section class="faq-section" id="faq"><h2>Frequently Asked Questions</h2>
<div class="faq-item open"><button class="faq-question" type="button" aria-expanded="true">Is an online legal document valid?</button><div class="faq-answer"><p>A document is valid if it meets your state’s requirements for that document type — who has to sign it, whether witnesses or a notary are required, and whether it has to be recorded. A well-built template will prompt you for those steps, but completing them is your responsibility, and the requirements differ by state and by document.</p></div></div>
<div class="faq-item"><button class="faq-question" type="button" aria-expanded="false">Is LawDepot a law firm?</button><div class="faq-answer"><p>No. LawDepot is an online document provider. It does not practise law, does not represent you, and using it does not create an attorney–client relationship. Neither does reading this site.</p></div></div>
<div class="faq-item"><button class="faq-question" type="button" aria-expanded="false">Does LegalCostGuides earn money from these links?</button><div class="faq-answer"><p>Yes, on the links marked as affiliate links. If you create a document after clicking one, we may receive a commission. You pay the same price you would pay going to the provider directly, and no commission has any influence on the cost figures published on this site. The full terms are on our <a href="/affiliate-disclosure">affiliate disclosure</a> page.</p></div></div>
<div class="faq-item"><button class="faq-question" type="button" aria-expanded="false">Why are there no documents for personal injury, criminal defence, or bankruptcy?</button><div class="faq-answer"><p>Because no honest document answers those questions. Those matters are decided in court, on deadlines, against an opposing party — and there is nothing a template can do about any of that. We would rather list nothing than list something irrelevant.</p></div></div>
</section>

<section class="related-section"><h2>Related Guides and Tools</h2><div class="card-grid">
<article class="card"><p class="eyebrow">Legal Guides</p><h3><a href="/pages/how-much-does-a-lawyer-cost">How Much Does a Lawyer Cost?</a></h3><p>Hourly benchmarks, flat fees, contingency percentages, and retainers explained.</p></article>
<article class="card"><p class="eyebrow">Legal Guides</p><h3><a href="/pages/will-cost-guide">Will Cost Guide</a></h3><p>DIY, online, and lawyer-drafted will pricing compared.</p></article>
<article class="card"><p class="eyebrow">Calculators</p><h3><a href="/pages/lawyer-cost-calculator">Lawyer Cost Calculator</a></h3><p>Model an attorney-fee range before you call firms.</p></article>
<article class="card"><p class="eyebrow">State Guides</p><h3><a href="/states/">State Lawyer Cost Guides</a></h3><p>Hourly benchmarks, filing fees, and official resources for all 50 states.</p></article>
</div></section>
${byline}
</article></div></main>`;

const disclosureMain = `<main class="page-shell"><div class="container article-layout"><article class="article-content">
<h1>Affiliate Disclosure</h1>
${byline}
${disclaimerBanner}
<p>LegalCostGuides is supported by display advertising and, on a small number of pages, by affiliate links to online legal document providers.</p>
<p>When a link on this site is an affiliate link, we may receive a commission if you create or purchase a document after clicking it. You pay the same price you would pay by going to the provider directly. Every affiliate link on this site carries a disclosure next to the link itself, and is marked with <code>rel="sponsored nofollow"</code> in the page source.</p>

<section id="what-this-does-not-change" class="content-section"><h2>What this does not change</h2>
<p>We do not sell leads. We do not take commissions from law firms, attorney referral networks, or lead marketplaces. No provider pays for editorial placement, for a favourable description, or for the cost figures published on this site. Our fee ranges come from public, verifiable sources — the Clio Legal Trends Report, U.S. Bureau of Labor Statistics data, U.S. Courts fee schedules, and official state judiciary fee schedules — and they are researched independently of any commercial relationship. You can read the full sourcing rules in <a href="/how-we-research">how we research</a> and <a href="/editorial-policy">our editorial policy</a>.</p>
<p>This site does not accept payment for editorial mentions.</p>
</section>

<section id="what-we-link-to" class="content-section"><h2>What we link to</h2>
<p>We link to a document provider only where the document genuinely answers the question the page is about, and only to United States versions of those documents. Our current affiliate partner is LawDepot, an online legal document provider.</p>
<p>Where no relevant product exists — personal injury, criminal defence, DUI, bankruptcy, immigration, medical malpractice, mass torts, workers’ compensation, Social Security disability, and most litigation topics — we place no affiliate link at all. Those pages link only to our own <a href="/legal-document-tools">legal document tools guide</a>, which is an internal page.</p>
<p>Editorial pages carry at most two affiliate links and one button. We do not use pop-ups, interstitials, sticky overlays, banner advertising from the provider, or automatic linking of every mention of a document.</p>
</section>

<section id="what-we-are-not" class="content-section"><h2>What we are not</h2>
<p>LegalCostGuides is not a law firm and does not provide legal advice. Online document providers are not law firms either. A template is not a substitute for advice when your situation is complex, when your state’s rules are unclear, or when someone is on the other side of the matter. Reading this site does not create an attorney–client relationship, and neither does using a document provider we link to.</p>
</section>

<section id="cookies" class="content-section"><h2>Cookies and tracking</h2>
<p>Some pages contain affiliate links to third-party legal document providers. If you click one, that provider may set cookies on its own website to attribute the visit. Those cookies are governed by the provider’s privacy and cookie policies, and LegalCostGuides does not receive the personal information entered into the provider’s forms. Our own cookie and advertising practices are described in the <a href="/privacy-policy">privacy policy</a>.</p>
</section>

<section id="questions" class="content-section"><h2>Questions</h2>
<p>If anything on this page is unclear, or if you believe a link is placed where it does not belong, tell us through the <a href="/contact">contact page</a>. Placement complaints are treated the same way as factual corrections: reviewed, and removed if the objection is fair.</p>
</section>

<section class="related-section"><h2>Related Guides and Tools</h2><div class="card-grid">
<article class="card"><p class="eyebrow">Company</p><h3><a href="/editorial-policy">Editorial Policy</a></h3><p>Sourcing hierarchy, review cycle, corrections, and independence standards.</p></article>
<article class="card"><p class="eyebrow">Company</p><h3><a href="/how-we-research">How We Research</a></h3><p>Where every number on this site comes from.</p></article>
<article class="card"><p class="eyebrow">Company</p><h3><a href="/privacy-policy">Privacy Policy</a></h3><p>Cookies, advertising, analytics, and your privacy rights.</p></article>
<article class="card"><p class="eyebrow">Legal Guides</p><h3><a href="/legal-document-tools">U.S. Legal Document Tools</a></h3><p>Which routine documents you can prepare yourself, and when you should not.</p></article>
</div></section>
${byline}
</article></div></main>`;

function write(slug, title, description, mainHtml) {
  const html = head({ title, description, slug }) + chrome + mainHtml + tail;
  fs.writeFileSync(path.join(ROOT, slug + '.html'), html);
  console.log('wrote', slug + '.html', html.length, 'bytes');
}

write('legal-document-tools',
  'U.S. Legal Document Tools (2026) | LegalCostGuides',
  'Which routine U.S. legal documents you can prepare yourself, which you should not, and how each compares with paying an attorney. Estate, family, property, business, employment and small claims.',
  hubMain);

write('affiliate-disclosure',
  'Affiliate Disclosure | LegalCostGuides',
  'How LegalCostGuides is funded: display advertising and a small number of clearly disclosed affiliate links to online legal document providers. We do not sell leads or take commissions from law firms.',
  disclosureMain);
