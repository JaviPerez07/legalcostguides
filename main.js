/* LegalCostGuides front-end (2026-10 rebuild). No third-party analytics; funnel counters are first-party and anonymous. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (v) => (v < 0 ? '−$' : '$') + Math.round(Math.abs(v)).toLocaleString('en-US');
  const num = (el) => { const v = parseFloat(String(el?.value ?? '').replace(/[$,%\s]/g, '')); return Number.isFinite(v) ? v : 0; };

  // ---- anonymous funnel events (no personal data, no cookies) ----
  const sent = new Set();
  function track(e, data = {}) {
    try {
      const payload = JSON.stringify({ e, p: location.pathname, sku: data.sku || null, pl: data.placement || null });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/e', new Blob([payload], { type: 'application/json' }));
      else fetch('/api/e', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    } catch (_) { /* ignore */ }
  }
  window.lcgTrack = track;

  function initTracking() {
    const boxes = $$('[data-track]');
    if ('IntersectionObserver' in window && boxes.length) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target; const key = el.dataset.track + (el.dataset.sku || el.dataset.provider || '') + (el.dataset.placement || '');
        if (sent.has(key)) return; sent.add(key);
        track(el.dataset.track === 'cta' ? 'cta_view' : 'affiliate_view', { sku: el.dataset.sku || el.dataset.provider, placement: el.dataset.placement });
        io.unobserve(el);
      }), { threshold: 0.5 });
      boxes.forEach((b) => io.observe(b));
    }
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-track-click]');
      if (!a) return;
      const box = a.closest('[data-track]');
      track(a.dataset.trackClick, { sku: a.dataset.sku || a.dataset.offer || box?.dataset.sku, placement: box?.dataset.placement });
    });
    const offer = $('[data-offer-view]');
    if (offer) track('offer_view', { sku: offer.dataset.offerView });
  }

  // ---- navigation ----
  function initNav() {
    const t = $('.mobile-nav-toggle'), m = $('.mobile-nav');
    if (t && m) t.addEventListener('click', () => { const o = m.classList.toggle('open'); t.setAttribute('aria-expanded', String(o)); t.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
    const dd = $('.nav-dropdown'), tr = $('.nav-trigger');
    if (dd && tr) {
      tr.addEventListener('click', () => { const o = dd.classList.toggle('open'); tr.setAttribute('aria-expanded', String(o)); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dd.classList.remove('open'); tr.setAttribute('aria-expanded', 'false'); } });
      document.addEventListener('click', (e) => { if (!dd.contains(e.target)) { dd.classList.remove('open'); tr.setAttribute('aria-expanded', 'false'); } });
    }
  }

  function initTOC() {
    const toc = $('.toc'), art = $('.article-content');
    if (!toc || !art) return;
    const hs = $$('section[id] > h2', art).filter((h) => !h.closest('.product-cta,.ld-widget'));
    if (hs.length < 3) { toc.remove(); return; }
    const ol = document.createElement('ol');
    hs.forEach((h) => { const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#' + h.parentElement.id; a.textContent = h.textContent; li.appendChild(a); ol.appendChild(li); });
    toc.appendChild(ol);
  }

  function initSortable() {
    $$('table.sortable').forEach((table) => {
      $$('thead th', table).forEach((th, idx) => {
        th.setAttribute('aria-sort', 'none');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'sort-btn'; b.textContent = th.textContent; th.textContent = ''; th.appendChild(b);
        b.addEventListener('click', () => {
          const asc = th.getAttribute('aria-sort') !== 'ascending';
          $$('thead th', table).forEach((x) => x.setAttribute('aria-sort', 'none'));
          th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
          const rows = $$('tbody tr', table);
          const val = (r) => { const t = r.children[idx].textContent.trim(); const n = parseFloat(t.replace(/[^0-9.]/g, '')); return t === '—' ? (asc ? Infinity : -Infinity) : (Number.isFinite(n) && /\d/.test(t) ? n : t.toLowerCase()); };
          rows.sort((a, c) => { const x = val(a), y = val(c); return (x > y ? 1 : x < y ? -1 : 0) * (asc ? 1 : -1); });
          rows.forEach((r) => table.tBodies[0].appendChild(r));
        });
      });
    });
  }

  function initPrivacyChoices() {
    const btn = $('#lcg-privacy-choices');
    if (!btn) return;
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (typeof window.googlefc !== 'undefined' && typeof window.googlefc.showRevocationMessage === 'function') {
        btn.hidden = false; btn.addEventListener('click', () => { try { window.googlefc.showRevocationMessage(); } catch (_) {} }); clearInterval(t);
      } else if (tries > 40) clearInterval(t);
    }, 250);
  }

  // ---- calculators ----
  function out(id, html) { const el = document.getElementById(id); if (el) { el.innerHTML = html; el.hidden = false; } }

  function lawyerCostCalc() {
    const f = $('#calc-lawyer-cost'); if (!f) return;
    const model = $('#lc-model', f);
    const sync = () => $$('[data-model]', f).forEach((el) => { el.hidden = !el.dataset.model.split(' ').includes(model.value); });
    model.addEventListener('change', sync); sync();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const m = model.value, exp = num($('#lc-expenses', f)), fees = num($('#lc-courtfees', f)), buf = num($('#lc-buffer', f)) / 100;
      let low = 0, high = 0, lines = [];
      if (m === 'hourly') {
        const rate = num($('#lc-rate', f)), hl = num($('#lc-hours-low', f)), hh = Math.max(num($('#lc-hours-high', f)), hl);
        low = rate * hl; high = rate * hh * (1 + buf);
        lines.push(`Lawyer time: ${hl}–${hh} hours × ${money(rate)} = ${money(rate * hl)}–${money(rate * hh)}`);
        if (buf) lines.push(`Overrun buffer on the high end: +${Math.round(buf * 100)}% = ${money(rate * hh * buf)}`);
      } else if (m === 'flat') {
        const flat = num($('#lc-flat', f)); low = flat; high = flat * (1 + buf);
        lines.push(`Flat fee: ${money(flat)}`); if (buf) lines.push(`Buffer for work outside the flat-fee scope: +${Math.round(buf * 100)}%`);
      } else {
        const rec = num($('#lc-recovery', f)), pct = num($('#lc-pct', f)) / 100;
        low = high = rec * pct; lines.push(`Contingency fee: ${money(rec)} × ${Math.round(pct * 1000) / 10}% = ${money(rec * pct)} (only if you recover)`);
      }
      low += exp + fees; high += exp + fees;
      if (exp) lines.push(`Expenses (copies, records, experts, travel): ${money(exp)}`);
      if (fees) lines.push(`Court filing and service fees: ${money(fees)}`);
      out('lc-result', `<p>Estimated total: <span class="big">${low === high ? money(low) : money(low) + ' – ' + money(high)}</span></p><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul><p class="calc-formula">This is arithmetic on the numbers you entered, not a quote. Ask each lawyer for a written estimate and compare them on the same basis.</p>`);
      track('calc_use', { sku: 'lawyer-cost' });
    });
  }

  function contingencyCalc() {
    const f = $('#calc-contingency'); if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const gross = num($('#cf-gross', f)), pct = num($('#cf-pct', f)) / 100, costs = num($('#cf-costs', f)), liens = num($('#cf-liens', f)), order = $('#cf-order', f).value;
      const base = order === 'before' ? Math.max(gross - costs, 0) : gross;
      const fee = base * pct;
      const net = gross - fee - costs - liens;
      const alt = order === 'before' ? gross * pct : Math.max(gross - costs, 0) * pct;
      out('cf-result', `<table class="data-table"><tbody><tr><th scope="row">Gross recovery</th><td>${money(gross)}</td></tr><tr><th scope="row">Lawyer's fee (${Math.round(pct * 1000) / 10}% of ${order === 'before' ? 'recovery minus costs' : 'gross recovery'})</th><td>−${money(fee)}</td></tr><tr><th scope="row">Case costs reimbursed</th><td>−${money(costs)}</td></tr><tr><th scope="row">Medical liens / bills paid from recovery</th><td>−${money(liens)}</td></tr><tr><th scope="row">You receive</th><td class="big">${money(net)}</td></tr></tbody></table><p class="calc-formula">If costs were taken ${order === 'before' ? 'after' : 'before'} the fee instead, the fee would be ${money(alt)} and you would receive ${money(gross - alt - costs - liens)}. Your written fee agreement decides which method applies.</p>`);
      track('calc_use', { sku: 'contingency' });
    });
  }

  function smallClaimsCalc() {
    const f = $('#calc-small-claims'); if (!f) return;
    const data = JSON.parse($('#sc-data').textContent);
    const sel = $('#sc-state', f);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = data[sel.value]; if (!s) return;
      const amt = num($('#sc-amount', f));
      let limitMsg = 'We have not verified this state\'s limit yet; ask the court clerk.';
      if (s.limit) limitMsg = amt > s.limit ? `<strong>Your claim of ${money(amt)} is above the ${money(s.limit)} limit.</strong> You would usually have to give up the excess to stay in small claims, or file in a higher court.` : `Your claim of ${money(amt)} is within the ${money(s.limit)} limit.`;
      out('sc-result', `<h3>${s.name}</h3><ul><li><strong>Limit:</strong> ${s.limitText || 'not verified'} — ${limitMsg}</li><li><strong>Filing fee:</strong> ${s.feeText || 'not verified; ask the clerk'}${s.feeVaries ? ' (varies by county)' : ''}</li><li><strong>Service:</strong> ${s.serviceText || 'not listed in official sources we checked'}</li></ul><p><a href="/states/${sel.value}-lawyer-costs">Full ${s.name} guide with sources →</a></p>`);
      track('calc_use', { sku: 'small-claims' });
    });
  }

  function netOfferCalc() {
    const f = $('#calc-net-offer'); if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const offer = num($('#no-offer', f)), pct = num($('#no-pct', f)) / 100, costs = num($('#no-costs', f)), med = num($('#no-med', f)), liens = num($('#no-liens', f)), wages = num($('#no-wages', f));
      const fee = offer * pct, net = offer - fee - costs - liens;
      const docLoss = med + wages;
      out('no-result', `<table class="data-table"><tbody><tr><th scope="row">Offer or settlement</th><td>${money(offer)}</td></tr><tr><th scope="row">Lawyer's fee (${Math.round(pct * 1000) / 10}%)</th><td>−${money(fee)}</td></tr><tr><th scope="row">Case costs</th><td>−${money(costs)}</td></tr><tr><th scope="row">Liens and unpaid bills repaid from it</th><td>−${money(liens)}</td></tr><tr><th scope="row">Estimated amount you keep</th><td class="big">${money(net)}</td></tr></tbody></table>${docLoss ? `<p>Your documented medical bills plus lost wages total ${money(docLoss)}. After fees, costs and liens, you would keep ${net >= docLoss ? money(net - docLoss) + ' more than' : money(docLoss - net) + ' less than'} that figure.</p>` : ''}<p class="calc-formula">This shows what an amount would leave you after deductions. It does not estimate what a claim is worth; only the evidence, the law in your state and the negotiation decide that.</p>`);
      track('calc_use', { sku: 'net-offer' });
    });
  }


  // ---- purchase access page ----
  function initAccess() {
    const box = $('#access-app'); if (!box) return;
    const params = new URLSearchParams(location.search);
    const sid = params.get('session_id') || '';
    const show = (cls, html) => { box.innerHTML = `<div class="status ${cls}" role="status">${html}</div>`; };
    if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sid)) { show('err', 'This page needs the link you were sent to after checkout. If you bought a kit, <a href="/access/recover">recover your access here</a>.'); return; }
    let tries = 0;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const load = async () => {
      tries++;
      let d;
      try { const r = await fetch('/api/access?session_id=' + encodeURIComponent(sid), { cache: 'no-store' }); d = await r.json(); } catch (_) { d = { status: 'network' }; }
      if (d.status === 'paid') {
        const size = (n) => n ? ' · ' + (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB') : '';
        box.innerHTML = `<div class="status ok" role="status"><strong>Payment confirmed.</strong> Thank you! Your files are ready.</div>
          <div class="access-box"><h2>${esc(d.product)}</h2><ul class="access-files">${d.files.map((f) => `<li><span><strong>${esc(f.name)}</strong><span class="calc-formula">${size(f.size)} · ${f.remaining} downloads left</span></span><a class="button-primary" href="${f.url}" rel="nofollow">Download</a></li>`).join('')}</ul>
          <p class="calc-formula">Download links refresh each time you open this page (they expire after 15 minutes for security).</p></div>
          <div class="access-box"><h2>Keep your access</h2><p><strong>Bookmark this page</strong>: you can come back to it for 12 months. Your order code is <strong><code>${esc(d.code)}</code></strong>. With it and your checkout email you can <a href="/access/recover">recover access</a> on any device.</p><p>Questions or a refund (within 14 days): <a href="mailto:javiperezguides@gmail.com">javiperezguides@gmail.com</a>. We do not add you to any mailing list.</p></div>`;
        return;
      }
      if (d.status === 'unknown' || d.status === 'network') {
        if (tries < 20) { show('wait', `<strong>Confirming your payment with Stripe…</strong> This usually takes a few seconds. This page updates automatically.`); setTimeout(load, tries < 6 ? 2000 : 5000); return; }
        show('err', 'We have not received a payment confirmation for this checkout yet. If you completed payment, wait a minute and reload this page. If it still does not work, email javiperezguides@gmail.com with your checkout email.'); return;
      }
      const msg = { pending: '<strong>Your payment is processing.</strong> Some payment methods take time to confirm. Your files will appear here once Stripe confirms the payment; you can bookmark this page and come back.',
        failed: 'The payment did not go through, so no files are available. You have not been charged for this order. You can <a href="/products/">try again</a>.',
        expired: 'This checkout expired before payment was completed, so no files are available. You can <a href="/products/">start again</a>.',
        refunded: 'This order was refunded, so its download access has ended.',
        access_expired: 'Access to this order has ended (12 months after purchase). Email javiperezguides@gmail.com if you need the files again.',
        review: 'We need to check this order manually. Please email javiperezguides@gmail.com and we will sort it out quickly.',
        invalid: 'This link is not valid.' }[d.status] || 'Something went wrong. Please email javiperezguides@gmail.com.';
      show(d.status === 'pending' ? 'wait' : 'err', msg);
      if (d.status === 'pending' && tries < 60) setTimeout(load, 10000);
    };
    load();
  }

  function initRecover() {
    const f = $('#recover-form'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const out = $('#recover-result');
      out.innerHTML = '<div class="status wait">Checking…</div>';
      try {
        const r = await fetch('/api/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: $('#rc-email').value, code: $('#rc-code').value }) });
        const d = await r.json();
        if (d.ok) { location.href = d.url; return; }
        out.innerHTML = `<div class="status err">${d.message}</div>`;
      } catch (_) { out.innerHTML = '<div class="status err">Network error. Please try again.</div>'; }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav(); initTOC(); initSortable(); initPrivacyChoices(); initTracking();
    lawyerCostCalc(); contingencyCalc(); smallClaimsCalc(); netOfferCalc(); initAccess(); initRecover();
  });
})();
