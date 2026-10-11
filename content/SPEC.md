# Content spec for LegalCostGuides topic pages (rebuild 2026-10)

You are rewriting one topic page of legalcostguides.com, a U.S. consumer site that explains what lawyers and legal procedures cost. Google AdSense rejected the site for "low value content". Your job is to replace the templated page with genuinely useful, accurate, sourced content. Write in US English.

## Output
Write ONE JSON file per page: `/home/claude/repo/content/pages/<slug>.json`, matching this shape exactly. It must be valid JSON; check it with `python3 -c "import json;json.load(open(PATH))"`.

```json
{
  "slug": "divorce-lawyer-cost",
  "title": "Divorce Lawyer Cost: Fees, Retainers and Filing Costs (2026)",
  "description": "≤155 chars. Says exactly what the page answers. Do not promise anything the body does not deliver.",
  "h1": "How much does a divorce lawyer cost?",
  "lastReviewed": "2026-10-11",
  "summary": "Plain-text quick answer, 2–4 sentences, written so it can be quoted alone (GEO). Must state the key numbers with the conditions behind them.",
  "body": "HTML string. See body rules.",
  "faq": [{"q": "Question a real searcher asks?", "a": "Plain-text answer of 1–4 sentences that actually answers it."}],
  "sources": [{"label": "Title of the page or document", "publisher": "Organization", "url": "https://...", "accessed": "2026-10-11", "note": "What this source supports (one line)"}],
  "related": ["other-topic-slug", "..."],
  "product": "toolkit | divorce | estate | smallclaims | none",
  "lawdepot": ["offer-key", "..."]
}
```

## Body rules
- Use `<section id="kebab-id"><h2>…</h2>…</section>` blocks; `<h3>` inside is fine. Do NOT include the h1, byline, disclaimer, TOC, FAQ, sources list, related links, CTAs or ads: the generator adds those.
- Tables: `<div class="table-wrap"><table class="data-table"><caption>…</caption><thead>…</thead><tbody>…</tbody></table></div>`.
- Cite at the claim: `<sup class="cite"><a href="#src-1">[1]</a></sup>`, where the number is the 1-based index in `sources`. Every dollar figure, percentage, legal limit or deadline must carry a citation OR be explicitly marked as an illustrative example whose arithmetic is shown (for example: "Example: 12 hours × $349 = $4,188").
- Useful elements: worked examples with arithmetic, checklists of questions to ask, "what drives the cost up", state-variation notes that name real states and real rules, and "when you do not need a lawyer / when you do".
- Callouts: `<div class="note">…</div>` for caveats, `<div class="example">…</div>` for worked examples.
- Aim for 900–1,800 words of body. Do not pad: a shorter page with real substance beats a long one. Do not write synonym-shuffled paraphrases of other pages.
- Internal links are relative to the site root, without .html: `/pages/<slug>` or `/states/<state>-lawyer-costs`. Link only to slugs from the list below.

## Hard rules (accuracy and policy)
1. No invented numbers. You may use: (a) the verified facts files listed below; (b) facts you verify yourself on primary or official sources (statutes, courts, agencies, state bars) or reputable named surveys (Clio Legal Trends, BLS, state bar economic surveys), cited with URL and accessed date; (c) published prices of named services (for example a LawDepot or LegalZoom price page), cited and dated. If you cannot support a typical market price range, say what drives it and show an illustrative calculation from the Clio national average hourly rate ($349, 2025 Legal Trends Report, https://www.clio.com/resources/legal-trends/compare-lawyer-rates/) instead of inventing a range.
2. Remove the old templated material: "How Costs Change by City Tier", the 10-state comparison table, the generic "How Billing Usually Works" table, "Cost Basics for Every Matter", and the false claim that court fees "are cited individually". Never write that figures are "derived" from multipliers.
3. Do not invent an attorney reviewer, credentials, testimonials, case results, statistics or quotes. The author is Javi Pérez, an independent researcher who is not a lawyer; the generator adds the byline.
4. No promises of outcomes and no settlement-value predictions. Do not tell readers they will win or what their case is worth.
5. Do not use criminal contingency fees: ABA Model Rule 1.5(d) bars contingent fees in criminal cases and in domestic relations matters that depend on securing a divorce or the amount of alimony, support or a property settlement.
6. Current status of litigation or regulations must be dated ("as of October 2026") and sourced. For anything after your knowledge, verify with WebSearch or WebFetch.
7. FAQ: 3–6 questions people actually ask, each with a real answer. Never include a question without an answer. The FAQ must not repeat the body word for word.
8. Product fit: set `product` only where the paid product genuinely helps the reader of this page. Available products:
   - toolkit: Lawyer Quote & Fee Agreement Toolkit. Compare quotes from up to 3 lawyers, a fee-agreement review checklist, consult questions and a legal-bill tracker. Fits any "how much does a lawyer cost" or "hiring a lawyer" page.
   - divorce: Divorce Cost & Lawyer Budget Planner.
   - estate: Estate "If Something Happens" Binder, an information organizer. It is NOT a will or legal document.
   - smallclaims: Small Claims Filing Kit (organizer, demand letter worksheet, evidence and court-day checklists).
   - none: for legal aid, mass torts, injury contingency pages where no product fits, policy pages and so on.
9. `lawdepot`: keep the offer keys given to you for the page (from the existing affiliate map) only if they still fit the rewritten content; add or remove keys from the offer list only where relevant. Never present LawDepot as legal advice or as our product.

## Verified facts files (read them first)
- /home/claude/work/research/Federal_facts_and_topic_verification.txt: federal fees, SSA cap, USPTO, USCIS, Camp Lejeune, Roundup, talc, FTCA, LSC, med-mal caps, notary, Clio, BLS.
- /home/claude/repo/data/states.json: per-state small claims limits and fees, filing fees, divorce fees, PI statute of limitations, contingency fee caps, fee-dispute programs, referral services, legal aid. Each item has source URLs.
- The audit of the current pages, listing their errors: /home/claude/work/research/Audit_batch_*.txt.
- The current page HTML: /home/claude/repo/pages/<slug>.html. Reuse only material that is correct and useful.

## Site slugs you may link to
Topic pages: how-much-does-a-lawyer-cost, lawyer-consultation-fee, contingency-fee-explained, hourly-vs-flat-fee-lawyer, can-i-afford-a-lawyer, legal-aid-guide, how-much-does-a-lawsuit-cost, mediation-cost-guide, notary-cost-guide, power-of-attorney-cost, will-cost-guide, estate-planning-lawyer-cost, real-estate-lawyer-cost, landlord-tenant-lawyer-cost, small-claims-court-cost, business-lawyer-cost, trademark-lawyer-cost, patent-lawyer-cost, divorce-lawyer-cost, child-custody-lawyer-cost, criminal-defense-lawyer-cost, dui-lawyer-cost, federal-criminal-defense-lawyer-cost, white-collar-crime-lawyer-cost, drug-trafficking-lawyer-cost, employment-lawyer-cost, immigration-lawyer-cost, bankruptcy-lawyer-cost, social-security-disability-lawyer-cost, workers-comp-lawyer-cost, personal-injury-lawyer-cost, motorcycle-accident-lawyer-cost, truck-accident-lawyer-cost, uber-lyft-accident-lawyer-cost, medical-malpractice-lawyer-cost, birth-injury-lawyer-cost, mesothelioma-lawyer-cost, camp-lejeune-lawsuit-cost, roundup-lawsuit-cost, talcum-powder-lawsuit-cost, class-action-lawsuit-cost, contingency-fee-lawyer-finder.
Tools: lawyer-cost-calculator, contingency-fee-calculator, small-claims-filing-fee-calculator, personal-injury-settlement-calculator, mesothelioma-settlement-calculator.
State pages: /states/<state-slug>-lawyer-costs (for example new-york, north-carolina), plus the index at /states/.

These pages are merged into another page; fold their useful unique content into the target:
- 18-wheeler-accident-lawyer-cost → truck-accident-lawyer-cost
- asbestos-lawsuit-cost → mesothelioma-lawyer-cost
- surgical-error-lawyer-cost → medical-malpractice-lawyer-cost
- wrongful-termination-lawyer-cost → employment-lawyer-cost
- legal-fee-calculator → lawyer-cost-calculator (handled separately)
