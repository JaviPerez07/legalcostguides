import { SITE, esc, readJSON, page, byline, DISCLAIMER, faqHTML, faqLD, articleLD, firstPublished, writeOut, fmtDate } from './lib.mjs';
import { productCTA, lawdepotWidget } from './components.mjs';

const REVIEWED = '2026-10-11';

// Land borders (plus nearest neighbors for AK and HI).
const ADJ = {
  alabama: ['florida', 'georgia', 'mississippi', 'tennessee'], alaska: ['washington', 'oregon', 'hawaii'], arizona: ['california', 'colorado', 'nevada', 'new-mexico', 'utah'],
  arkansas: ['louisiana', 'mississippi', 'missouri', 'oklahoma', 'tennessee', 'texas'], california: ['arizona', 'nevada', 'oregon'], colorado: ['arizona', 'kansas', 'nebraska', 'new-mexico', 'oklahoma', 'utah', 'wyoming'],
  connecticut: ['massachusetts', 'new-york', 'rhode-island'], delaware: ['maryland', 'new-jersey', 'pennsylvania'], florida: ['alabama', 'georgia'], georgia: ['alabama', 'florida', 'north-carolina', 'south-carolina', 'tennessee'],
  hawaii: ['california', 'alaska'], idaho: ['montana', 'nevada', 'oregon', 'utah', 'washington', 'wyoming'], illinois: ['indiana', 'iowa', 'kentucky', 'missouri', 'wisconsin'], indiana: ['illinois', 'kentucky', 'michigan', 'ohio'],
  iowa: ['illinois', 'minnesota', 'missouri', 'nebraska', 'south-dakota', 'wisconsin'], kansas: ['colorado', 'missouri', 'nebraska', 'oklahoma'], kentucky: ['illinois', 'indiana', 'missouri', 'ohio', 'tennessee', 'virginia', 'west-virginia'],
  louisiana: ['arkansas', 'mississippi', 'texas'], maine: ['new-hampshire', 'vermont', 'massachusetts'], maryland: ['delaware', 'pennsylvania', 'virginia', 'west-virginia'], massachusetts: ['connecticut', 'new-hampshire', 'new-york', 'rhode-island', 'vermont'],
  michigan: ['indiana', 'ohio', 'wisconsin'], minnesota: ['iowa', 'north-dakota', 'south-dakota', 'wisconsin'], mississippi: ['alabama', 'arkansas', 'louisiana', 'tennessee'], missouri: ['arkansas', 'illinois', 'iowa', 'kansas', 'kentucky', 'nebraska', 'oklahoma', 'tennessee'],
  montana: ['idaho', 'north-dakota', 'south-dakota', 'wyoming'], nebraska: ['colorado', 'iowa', 'kansas', 'missouri', 'south-dakota', 'wyoming'], nevada: ['arizona', 'california', 'idaho', 'oregon', 'utah'], 'new-hampshire': ['maine', 'massachusetts', 'vermont'],
  'new-jersey': ['delaware', 'new-york', 'pennsylvania'], 'new-mexico': ['arizona', 'colorado', 'oklahoma', 'texas', 'utah'], 'new-york': ['connecticut', 'massachusetts', 'new-jersey', 'pennsylvania', 'vermont'], 'north-carolina': ['georgia', 'south-carolina', 'tennessee', 'virginia'],
  'north-dakota': ['minnesota', 'montana', 'south-dakota'], ohio: ['indiana', 'kentucky', 'michigan', 'pennsylvania', 'west-virginia'], oklahoma: ['arkansas', 'colorado', 'kansas', 'missouri', 'new-mexico', 'texas'], oregon: ['california', 'idaho', 'nevada', 'washington'],
  pennsylvania: ['delaware', 'maryland', 'new-jersey', 'new-york', 'ohio', 'west-virginia'], 'rhode-island': ['connecticut', 'massachusetts'], 'south-carolina': ['georgia', 'north-carolina'], 'south-dakota': ['iowa', 'minnesota', 'montana', 'nebraska', 'north-dakota', 'wyoming'],
  tennessee: ['alabama', 'arkansas', 'georgia', 'kentucky', 'mississippi', 'missouri', 'north-carolina', 'virginia'], texas: ['arkansas', 'louisiana', 'new-mexico', 'oklahoma'], utah: ['arizona', 'colorado', 'idaho', 'nevada', 'new-mexico', 'wyoming'], vermont: ['massachusetts', 'new-hampshire', 'new-york'],
  virginia: ['kentucky', 'maryland', 'north-carolina', 'tennessee', 'west-virginia'], washington: ['idaho', 'oregon'], 'west-virginia': ['kentucky', 'maryland', 'ohio', 'pennsylvania', 'virginia'], wisconsin: ['illinois', 'iowa', 'michigan', 'minnesota'], wyoming: ['colorado', 'idaho', 'montana', 'nebraska', 'south-dakota', 'utah'],
};

const CLIO_URL = 'https://www.clio.com/resources/legal-trends/compare-lawyer-rates/';
const CLIO_NATIONAL = 349;
const LSC_URL = 'https://www.govinfo.gov/content/pkg/FR-2026-01-26/html/2026-01431.htm';

const money = (n) => '$' + Number(n).toLocaleString('en-US');
const NV = '<span class="nv">Not verified yet — ask the court clerk</span>';
const link = (s) => (s && s.url ? ` <a class="src" href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label || 'Source')}</a>` : '');

export function renderStates({ addSitemap }) {
  const disp = readJSON('data/states-display.json');
  const raw = readJSON('data/states.json');
  const bySlug = Object.fromEntries(disp.map((d) => [d.slug, d]));
  const clio = Object.fromEntries(raw.map((r) => [r.slug, r.clio_avg_hourly]));
  const verifiedScope = new Set(disp.filter((d) => d.sc.limit && d.sc.feeText).map((d) => d.slug));

  for (const d of disp) {
    const urlPath = `/states/${d.slug}-lawyer-costs`;
    const N = d.name;
    const rate = clio[d.slug];
    const sources = [];
    const addSrc = (s) => { if (!s?.url) return null; let i = sources.findIndex((x) => x.url === s.url); if (i === -1) { sources.push(s); i = sources.length - 1; } return i + 1; };
    const cite = (s) => { const i = addSrc(s); return i ? `<sup class="cite"><a href="#src-${i}">[${i}]</a></sup>` : ''; };
    const scCites = (d.sc.sources || []).map(cite).join('');

    // At-a-glance rows
    const rows = [
      ['Small claims limit', d.sc.limitText ? esc(d.sc.limitText) + scCites : NV],
      ['Small claims filing fee', d.sc.feeText ? esc(d.sc.feeText) + (d.sc.feeVaries ? ' <em>(varies by county)</em>' : '') + scCites : NV],
      [`${esc(d.civil.court || 'Trial court')} civil filing fee`, d.civil.feeText ? esc(d.civil.feeText) + cite(d.civil.source) : NV],
      ['Divorce filing fee', d.divorce.feeText ? esc(d.divorce.feeText) + cite(d.divorce.source) : (d.divorce.note ? esc(d.divorce.note) + cite(d.divorce.source) : NV)],
      ['Personal injury deadline', d.sol.text ? esc(d.sol.text) + cite(d.sol.source) : NV],
      ['Attorney fee caps', d.caps.text ? esc(d.caps.text) + cite(d.caps.source) : 'No statewide percentage cap identified in our review'],
      ['Average lawyer rate', rate ? `${money(rate)}/hour (Clio, 2025 data for ${esc(N)})` + cite({ label: 'Clio, Compare Lawyer Rates (2025 Legal Trends data)', url: CLIO_URL }) : `No ${esc(N)} figure published; national average ${money(CLIO_NATIONAL)}/hour` + cite({ label: 'Clio, Compare Lawyer Rates (2025 Legal Trends data)', url: CLIO_URL })],
    ];
    const glance = `<section id="at-a-glance"><h2>${esc(N)} legal costs at a glance</h2><div class="table-wrap"><table class="data-table kv"><caption>Court fees, limits and fee rules in ${esc(N)}, checked ${fmtDate(REVIEWED)}</caption><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></div></section>`;

    // Lawyer rates + illustrative budget
    const r = rate || CLIO_NATIONAL;
    const rateSec = `<section id="lawyer-rates"><h2>What lawyers charge in ${esc(N)}</h2>${rate ? `<p>Clio's Legal Trends data puts the average billed rate in ${esc(N)} at <strong>${money(rate)} per hour</strong>, against ${money(CLIO_NATIONAL)} nationally${cite({ label: 'Clio, Compare Lawyer Rates (2025 Legal Trends data)', url: CLIO_URL })}. That is an average across law firms that use Clio's software, not a quote: rates depend on the practice area, the lawyer's experience and the city.</p>` : `<p>Clio publishes state-level averages for only some states, and ${esc(N)} is not one of them. The national average billed rate in Clio's 2025 data is <strong>${money(CLIO_NATIONAL)} per hour</strong>${cite({ label: 'Clio, Compare Lawyer Rates (2025 Legal Trends data)', url: CLIO_URL })}. We do not publish an invented ${esc(N)} figure: ask two or three local lawyers for their hourly rate and compare it with the national number.</p>`}<div class="example"><p><strong>Illustrative budget at ${money(r)}/hour</strong> (not a quote): a 1-hour consultation ≈ ${money(r)}; a 5-hour document review ≈ ${money(5 * r)}; a 20-hour contested matter ≈ ${money(20 * r)}, before court fees and expenses. Many lawyers quote flat fees for routine work instead; see <a href="/pages/hourly-vs-flat-fee-lawyer">hourly vs flat fees</a>.</p></div></section>`;

    // Small claims detail
    const sc = `<section id="small-claims"><h2>Small claims court in ${esc(N)}</h2><p>${d.sc.court ? `Small claims cases are heard in the <strong>${esc(d.sc.court)}</strong>. ` : ''}${d.sc.limitText ? `You can ask for up to <strong>${esc(d.sc.limitText)}</strong>${scCites}.` : `We have not yet verified the ${esc(N)} small claims limit; check with the court clerk.`}${d.sc.limitNote ? ' ' + esc(d.sc.limitNote) : ''}</p><ul><li><strong>Filing fee:</strong> ${d.sc.feeText ? esc(d.sc.feeText) : 'not verified yet'}${d.sc.feeVaries ? ' Fees vary by county, so confirm with your local clerk.' : ''}</li><li><strong>Serving the other side:</strong> ${d.sc.serviceText ? esc(d.sc.serviceText) : 'service costs are not listed in the official sources we checked; ask the clerk which service methods are allowed and what they cost.'}</li>${d.selfHelp ? `<li><strong>Court self-help:</strong> <a href="${esc(d.selfHelp)}" rel="noopener" target="_blank">${esc(N)} court self-help resources</a></li>` : ''}</ul><p>See how ${esc(N)} compares with other states in our <a href="/pages/small-claims-court-cost">50-state small claims table</a>.</p></section>`;

    // Filing fees
    const fees = `<section id="filing-fees"><h2>Court filing fees</h2><p><strong>${esc(d.civil.court || 'General civil court')}:</strong> ${d.civil.feeText ? esc(d.civil.feeText) + cite(d.civil.source) : 'not verified yet; ask the clerk of court.'}</p><p><strong>Divorce:</strong> ${d.divorce.feeText ? esc(d.divorce.feeText) + cite(d.divorce.source) : 'no single statewide amount verified.'}${d.divorce.note ? ' ' + esc(d.divorce.note) : ''}</p><p>If you cannot afford a filing fee, every state lets you ask the court to waive it; the form is usually called a fee waiver or an application to proceed without paying fees. Our <a href="/pages/divorce-lawyer-cost">divorce cost guide</a> compares filing fees across states.</p></section>`;

    // Deadlines and fee rules
    const rules = `<section id="deadlines-and-fee-rules"><h2>Deadlines and attorney fee rules</h2><p><strong>Personal injury filing deadline:</strong> ${d.sol.text ? esc(d.sol.text) + cite(d.sol.source) + '. Exceptions exist (for example for minors, government defendants and medical claims), so check with a lawyer before the deadline gets close.' : `not verified yet for ${esc(N)}. Ask a lawyer promptly: missing the deadline usually ends the claim.`}</p><p><strong>Contingency and fee caps:</strong> ${d.caps.text ? esc(d.caps.text) + cite(d.caps.source) : `we did not find a statewide percentage cap in ${esc(N)}. Fees must still be reasonable under the state's version of ABA Model Rule 1.5, and contingency agreements must be in writing.`}</p>${d.feeDispute ? `<p><strong>If you disagree with a lawyer's bill:</strong> the <a href="${esc(d.feeDispute.url || '#')}" rel="noopener" target="_blank">${esc(d.feeDispute.name)}</a> handles fee disputes between clients and lawyers.</p>` : `<p><strong>If you disagree with a lawyer's bill:</strong> we did not find a statewide fee-dispute program for ${esc(N)}; ask your local county bar association whether it runs one.</p>`}</section>`;

    // Help
    const help = `<section id="low-cost-help"><h2>Free and low-cost legal help in ${esc(N)}</h2><ul>${d.legalAid ? `<li><strong>Legal aid:</strong> <a href="${esc(d.legalAid.url)}" rel="noopener" target="_blank">${esc(d.legalAid.name)}</a>. Programs funded by the Legal Services Corporation generally serve households at or below 125% of the federal poverty guidelines; ${['alaska','hawaii'].includes(d.slug) ? `${esc(N)} has its own, higher income limits in the 2026 LSC table` : 'in 2026 that is $19,950 a year for one person and $41,250 for a family of four in the 48 contiguous states'}${cite({ label: 'Federal Register: LSC income guidelines (2026)', url: LSC_URL })}.</li>` : `<li><strong>Legal aid:</strong> find your local program through <a href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" rel="noopener" target="_blank">LSC's legal aid locator</a>.</li>`}${d.referral ? `<li><strong>Lawyer referral:</strong> <a href="${esc(d.referral.url)}" rel="noopener" target="_blank">${esc(d.referral.name)}</a>${d.referral.note ? ` — ${esc(d.referral.note)}` : ''}.</li>` : ''}<li><strong>Before you hire:</strong> read <a href="/pages/lawyer-consultation-fee">what consultations cost</a> and <a href="/pages/can-i-afford-a-lawyer">options if you can't afford a lawyer</a>.</li></ul></section>`;

    // FAQ from data only
    const faq = [];
    if (d.sc.limitText) faq.push({ q: `What is the small claims limit in ${N}?`, a: `${d.sc.limitText}${d.sc.court ? `, in the ${d.sc.court}` : ''}.${d.sc.limitNote ? ' ' + d.sc.limitNote : ''}` });
    if (d.sc.feeText) faq.push({ q: `How much does it cost to file a small claims case in ${N}?`, a: `${d.sc.feeText}${d.sc.feeVaries ? ' Fees vary by county.' : ''} Service of the papers usually costs extra.` });
    if (d.sol.text) faq.push({ q: `How long do I have to file a personal injury lawsuit in ${N}?`, a: `Generally ${d.sol.text}. Exceptions apply, so talk to a lawyer well before the deadline.` });
    if (d.divorce.feeText) faq.push({ q: `How much is the divorce filing fee in ${N}?`, a: `${d.divorce.feeText}.${d.divorce.note ? ' ' + d.divorce.note : ''} You can ask the court to waive fees if you cannot afford them.` });
    if (d.feeDispute) faq.push({ q: `What can I do if I think my ${N} lawyer overcharged me?`, a: `Ask the lawyer for an itemized bill first. If that does not resolve it, the ${d.feeDispute.name} handles fee disputes between clients and lawyers.` });

    const neighbors = (ADJ[d.slug] || []).filter((s) => bySlug[s]);
    const nb = `<section class="related-section" id="nearby"><h2>Nearby state guides</h2><ul class="related-list">${neighbors.map((s) => `<li><a href="/states/${s}-lawyer-costs">${esc(bySlug[s].name)} lawyer costs</a></li>`).join('')}<li><a href="/states/">All 50 states</a></li></ul></section>`;

    const summaryBits = [];
    if (d.sc.limitText) summaryBits.push(`small claims cases up to ${d.sc.limitText.replace(/\s*\(.*\)$/, '')}`);
    if (d.sol.years) summaryBits.push(`a ${d.sol.years}-year personal injury filing deadline`);
    if (d.divorce.feeText && /^\$[\d,.]+/.test(d.divorce.feeText)) summaryBits.push(`a divorce filing fee of ${d.divorce.feeText.match(/^\$[\d,.]+/)[0]}`);
    const summary = `${N} has ${summaryBits.length ? summaryBits.join(', ') : 'court fees that vary by court and county'}. ${rate ? `Lawyers in ${N} bill an average of ${money(rate)} an hour in Clio's 2025 data.` : `Clio does not publish a ${N} rate; the national average is ${money(CLIO_NATIONAL)} an hour.`} Below are the verified court fees, deadlines, fee-cap rules and free-help options, each linked to its official source.`;

    const scCTA = verifiedScope.has(d.slug) ? productCTA('smallclaims', { pagePath: urlPath, placement: 'after_small_claims', context: { headline: `Filing in ${N} small claims? Get organized first`, copy: `The Small Claims Filing Kit includes a case organizer, damages calculator, demand-letter worksheet and court-day checklist, plus a fee and limit reference that covers ${N}.` } }) : '';
    const ld = lawdepotWidget(['demand-letter'], { pagePath: urlPath, placement: 'after_small_claims', heading: 'Send a demand letter before you file', copy: 'Many small claims courts expect you to ask for payment first. A written demand letter template can help; it is not legal advice.' });

    const sourceList = () => `<section id="sources" class="sources-section"><h2>Sources</h2><ol class="source-list">${sources.map((s, i) => `<li id="src-${i + 1}"><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a> <span class="source-date">(checked ${fmtDate(REVIEWED)})</span></li>`).join('')}</ol></section>`;

    // Build body in order (cites accumulate in order of appearance)
    const parts = [glance, rateSec, sc];
    const bodyMain = parts.join('') + scCTA + ld + fees + rules + help;
    const title = `${N} Lawyer Costs 2026: Court Fees, Small Claims & Fee Rules`;
    const description = `${N}: small claims limit and filing fee, court and divorce filing fees, injury deadline, attorney fee caps and free legal help, with official sources.`.slice(0, 158);
    const h1 = `${N} lawyer costs and court fees`;
    const published = firstPublished(`states/${d.slug}-lawyer-costs.html`);
    const html = `<div class="container article-layout"><article class="article-content"><h1>${esc(h1)}</h1>${byline({ lastReviewed: REVIEWED, published, nSources: sources.length })}${DISCLAIMER}<div class="quick-answer" role="note"><p class="quick-answer-label">Short answer</p><p>${esc(summary)}</p></div><nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p></nav>${bodyMain}${faqHTML(faq)}${sourceList()}${nb}</article></div>`;
    const crumbs = [{ name: 'Home', url: '/' }, { name: 'States', url: '/states/' }, { name: `${N} lawyer costs`, url: urlPath }];
    const jsonld = [articleLD({ urlPath, headline: h1, description, published, modified: REVIEWED })];
    const fl = faqLD(faq); if (fl) jsonld.push(fl);
    writeOut(urlPath, page({ urlPath, title, description, body: html, crumbs, jsonld }));
    addSitemap(urlPath, REVIEWED);
  }

  // States hub
  const rowsHub = disp.map((d) => `<tr><th scope="row"><a href="/states/${d.slug}-lawyer-costs">${esc(d.name)}</a></th><td>${d.sc.limit ? money(d.sc.limit) : '—'}</td><td>${d.sol.years ? d.sol.years + ' yr' : '—'}</td><td>${clio[d.slug] ? money(clio[d.slug]) : '—'}</td></tr>`).join('');
  const hub = `<div class="container article-layout"><article class="article-content"><h1>Lawyer costs and court fees by state</h1>${byline({ lastReviewed: REVIEWED, published: null, nSources: 0 })}<div class="quick-answer" role="note"><p class="quick-answer-label">How to use this page</p><p>Each state guide lists that state's small claims limit and filing fee, general civil and divorce filing fees, personal injury filing deadline, attorney fee caps, fee-dispute program and free legal help, each linked to the official source we checked. A dash means we have not verified that figure yet; we leave it blank rather than estimate it.</p></div><div class="table-wrap"><table class="data-table sortable"><caption>Key figures by state (checked ${fmtDate(REVIEWED)})</caption><thead><tr><th scope="col">State</th><th scope="col">Small claims limit</th><th scope="col">Injury filing deadline</th><th scope="col">Avg. lawyer rate (Clio)</th></tr></thead><tbody>${rowsHub}</tbody></table></div><p class="note">Average rates are from Clio's 2025 Legal Trends data, which publishes state figures for only some states (national average ${money(CLIO_NATIONAL)}/hour). Small claims limits and deadlines link to statutes and court pages on each state guide.</p></article></div>`;
  writeOut('/states/', page({ urlPath: '/states/', title: 'Lawyer Costs by State: Court Fees, Small Claims Limits & Deadlines', description: 'All 50 states: small claims limits and fees, court filing fees, injury filing deadlines, attorney fee caps and free legal help, with official sources.', body: hub, crumbs: [{ name: 'Home', url: '/' }, { name: 'States', url: '/states/' }], jsonld: [] }));
  addSitemap('/states/', REVIEWED);
}
