(() => {
  'use strict';

  const lawyerRates = {"personal-injury-lawyer-cost":337,"divorce-lawyer-cost":344,"criminal-defense-lawyer-cost":216,"dui-lawyer-cost":326,"bankruptcy-lawyer-cost":460,"immigration-lawyer-cost":366,"estate-planning-lawyer-cost":371,"real-estate-lawyer-cost":377,"employment-lawyer-cost":387,"business-lawyer-cost":378,"how-much-does-a-lawyer-cost":349,"lawyer-consultation-fee":349,"contingency-fee-explained":337,"hourly-vs-flat-fee-lawyer":349,"can-i-afford-a-lawyer":349,"mediation-cost-guide":371,"power-of-attorney-cost":371,"will-cost-guide":371,"trademark-lawyer-cost":453,"patent-lawyer-cost":453,"mesothelioma-lawyer-cost":337,"truck-accident-lawyer-cost":337,"workers-comp-lawyer-cost":216,"social-security-disability-lawyer-cost":216,"child-custody-lawyer-cost":344,"wrongful-termination-lawyer-cost":387,"landlord-tenant-lawyer-cost":377,"asbestos-lawsuit-cost":337,"18-wheeler-accident-lawyer-cost":337,"uber-lyft-accident-lawyer-cost":337,"motorcycle-accident-lawyer-cost":337,"medical-malpractice-lawyer-cost":405,"birth-injury-lawyer-cost":405,"surgical-error-lawyer-cost":405,"class-action-lawsuit-cost":337,"roundup-lawsuit-cost":337,"talcum-powder-lawsuit-cost":337,"camp-lejeune-lawsuit-cost":337,"federal-criminal-defense-lawyer-cost":425,"white-collar-crime-lawyer-cost":425,"drug-trafficking-lawyer-cost":425,"how-much-does-a-lawsuit-cost":349,"contingency-fee-lawyer-finder":337};

  const stateMultipliers = {"california":1.21,"texas":1.05,"florida":1.01,"new-york":1.22,"illinois":1,"pennsylvania":0.89,"ohio":0.79,"georgia":1.06,"north-carolina":0.91,"michigan":0.85};

  const smallClaimsBands = {
    california: { low: [30, 50, 75], note: 'California small-claims filing fees often increase with the amount claimed and prior filing history.' },
    texas: { low: [54, 54, 54], note: 'Representative Texas justice-court filing fees often start around $54 before service costs.' },
    florida: { low: [55, 80, 175], note: 'Florida county-court small-claims filing fees commonly step up with the amount claimed.' },
    'new-york': { low: [15, 20, 20], note: 'New York small-claims filing fees are often $15 or $20 depending on claim size.' },
    illinois: { low: [90, 150, 250], note: 'Illinois county court fees vary widely, so this calculator shows a planning band rather than a single statewide rule.' },
    pennsylvania: { low: [75, 110, 160], note: 'Pennsylvania magisterial district totals vary by service and claim size.' },
    ohio: { low: [60, 95, 150], note: 'Representative Ohio small-claims courts often use modest filing fees that rise with claim size.' },
    georgia: { low: [55, 75, 110], note: 'Georgia magistrate-court fees vary by county and service details.' },
    'north-carolina': { low: [96, 110, 140], note: 'North Carolina filing plus service often approaches or exceeds about $100 combined.' },
    michigan: { low: [30, 50, 70], note: 'Michigan small-claims filing fees generally scale by the amount of the claim.' }
  };

  function money(value) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }

    const dropdown = document.querySelector('.nav-dropdown');
    const trigger = document.querySelector('.nav-trigger');
    if (dropdown && trigger) {
      trigger.addEventListener('click', () => {
        const open = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
      });
    }

    const toc = document.querySelector('.toc');
    const article = document.querySelector('.article-content');
    if (toc && article) {
      const headings = [...article.querySelectorAll('h2')].filter((heading) => heading.id);
      if (headings.length) {
        const list = document.createElement('ol');
        headings.forEach((heading) => {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = '#' + heading.id;
          link.textContent = heading.textContent;
          li.appendChild(link);
          list.appendChild(li);
        });
        toc.appendChild(list);
      }
    }

    document.querySelectorAll('.faq-question').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach((node) => {
          node.classList.remove('open');
          const q = node.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    const cookieKey = 'legalcostguides_cookie_consent';
    if (!localStorage.getItem(cookieKey)) {
      const banner = document.createElement('div');
      banner.className = 'cookie-banner show';
      banner.innerHTML = '<p><strong>Cookie notice:</strong> LegalCostGuides uses cookies and similar technologies for essential site functions, analytics, and Google AdSense advertising.</p><div class="cookie-actions"><button class="accept" type="button">Accept</button><button class="reject" type="button">Reject non-essential</button></div>';
      document.body.appendChild(banner);
      const dismissBanner = (value) => {
        localStorage.setItem(cookieKey, value);
        banner.classList.remove('show');
        banner.style.display = 'none';
      };
      banner.querySelector('.accept').addEventListener('click', () => {
        dismissBanner('accepted');
      });
      banner.querySelector('.reject').addEventListener('click', () => {
        dismissBanner('rejected');
      });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const params = new URLSearchParams({
          subject: document.getElementById('contact-topic').value + ' - LegalCostGuides',
          body: [
            'Name: ' + document.getElementById('contact-name').value,
            'Email: ' + document.getElementById('contact-email').value,
            'Page: ' + document.getElementById('contact-page').value,
            '',
            document.getElementById('contact-message').value
          ].join('\n')
        });
        window.location.href = 'mailto:focuslocalaiagency@gmail.com?' + params.toString();
      });
    }

    const lawyerButton = document.querySelector('[data-calc-action="lawyer-cost-calculator"]');
    if (lawyerButton) {
      lawyerButton.addEventListener('click', () => {
        const type = document.getElementById('lc-case-type').value;
        const state = document.getElementById('lc-state').value;
        const hours = Number(document.getElementById('lc-hours').value || 0);
        const complexity = Number(document.getElementById('lc-complexity').value || 1);
        const base = lawyerRates[type] || 349;
        const multiplier = stateMultipliers[state] || 1;
        const hourly = base * multiplier * complexity;
        const low = hourly * hours * 0.85;
        const high = hourly * hours * 1.15;
        const result = document.getElementById('lawyer-cost-calculator-result');
        result.innerHTML = '<h3>Estimated attorney-fee range</h3><p><strong>' + money(low) + ' to ' + money(high) + '</strong></p><p>This estimate is based on an effective hourly rate of about ' + money(hourly) + ' across ' + hours + ' projected hours. Filing fees, experts, records, or government charges may still sit outside the estimate.</p>';
      });
    }

    const feeButton = document.querySelector('[data-calc-action="legal-fee-calculator"]');
    if (feeButton) {
      feeButton.addEventListener('click', () => {
        const rate = Number(document.getElementById('lf-rate').value || 0);
        const hours = Number(document.getElementById('lf-hours').value || 0);
        const expenses = Number(document.getElementById('lf-expenses').value || 0);
        const buffer = Number(document.getElementById('lf-buffer').value || 0);
        const subtotal = rate * hours + expenses;
        const total = subtotal * (1 + buffer);
        document.getElementById('legal-fee-calculator-result').innerHTML = '<h3>Total projected spend</h3><p><strong>' + money(total) + '</strong></p><p>Base fees: ' + money(rate * hours) + '. Expenses: ' + money(expenses) + '. Buffer: ' + Math.round(buffer * 100) + '% for overruns and extra scope.</p>';
      });
    }

    const contingencyButton = document.querySelector('[data-calc-action="contingency-fee-calculator"]');
    if (contingencyButton) {
      contingencyButton.addEventListener('click', () => {
        const settlement = Number(document.getElementById('cf-settlement').value || 0);
        const percent = Number(document.getElementById('cf-percent').value || 0);
        const costs = Number(document.getElementById('cf-costs').value || 0);
        const order = document.getElementById('cf-order').value;
        const base = order === 'before' ? settlement - costs : settlement;
        const fee = base * percent;
        const net = order === 'before' ? settlement - costs - fee : settlement - fee - costs;
        document.getElementById('contingency-fee-calculator-result').innerHTML = '<h3>Estimated recovery split</h3><p><strong>Attorney fee:</strong> ' + money(fee) + '</p><p><strong>Client net after listed costs:</strong> ' + money(net) + '</p><p>Costs were deducted ' + (order === 'before' ? 'before' : 'after') + ' the fee calculation in this scenario.</p>';
      });
    }

    const smallClaimsButton = document.querySelector('[data-calc-action="small-claims-filing-fee-calculator"]');
    if (smallClaimsButton) {
      smallClaimsButton.addEventListener('click', () => {
        const state = document.getElementById('sc-state').value;
        const amount = Number(document.getElementById('sc-amount').value || 0);
        const addService = document.getElementById('sc-service').value === 'yes' ? 35 : 0;
        const view = document.getElementById('sc-view').value;
        const record = smallClaimsBands[state];
        let base = record.low[0];
        if (amount > 1500) base = record.low[1];
        if (amount > 5000) base = record.low[2];
        const low = base;
        const high = base + addService + 45;
        const detail = view === 'detail'
          ? '<p>' + record.note + '</p>'
          : '<p>This is a planning band for the featured state-guide market, not a court-certified quote. Always verify with the local court clerk before filing.</p>';
        document.getElementById('small-claims-filing-fee-calculator-result').innerHTML = '<h3>Estimated filing-fee band</h3><p><strong>' + money(low) + ' to ' + money(high) + '</strong></p>' + detail;
      });
    }

    const mesotheliomaButton = document.querySelector('[data-calc-action="mesothelioma-settlement-calculator"]');
    if (mesotheliomaButton) {
      mesotheliomaButton.addEventListener('click', () => {
        const diagnosis = Number(document.getElementById('ms-diagnosis').value || 1);
        const state = document.getElementById('ms-state').value;
        const history = Number(document.getElementById('ms-history').value || 1);
        const track = Number(document.getElementById('ms-track').value || 1);
        const stateFactor = stateMultipliers[state] || 1;
        const base = 1200000;
        const midpoint = base * diagnosis * history * track * (0.92 + stateFactor * 0.18);
        const low = midpoint * 0.78;
        const high = midpoint * 1.22;
        document.getElementById('mesothelioma-settlement-calculator-result').innerHTML =
          '<h3>Estimated mesothelioma claim planning range</h3><p><strong>' + money(low) + ' to ' + money(high) + '</strong></p><p>This estimate reflects the diagnosis profile, a state-market proxy, and whether the facts suggest trust-claim-only handling or a broader civil-plus-trust strategy. It does not account for product-specific trust percentages, liens, or unusual venue leverage.</p>';
      });
    }

    const personalInjurySettlementButton = document.querySelector('[data-calc-action="personal-injury-settlement-calculator"]');
    if (personalInjurySettlementButton) {
      personalInjurySettlementButton.addEventListener('click', () => {
        const type = Number(document.getElementById('pi-type').value || 1);
        const severity = Number(document.getElementById('pi-severity').value || 1);
        const medical = Number(document.getElementById('pi-medical').value || 0);
        const wages = Number(document.getElementById('pi-wages').value || 0);
        const specials = medical + wages;
        const midpoint = Math.max(25000, specials * (1.6 + type * 0.7) * severity);
        const low = midpoint * 0.72;
        const high = midpoint * 1.28;
        document.getElementById('personal-injury-settlement-calculator-result').innerHTML =
          '<h3>Estimated personal injury settlement band</h3><p><strong>' + money(low) + ' to ' + money(high) + '</strong></p><p>The formula starts with economic damages and then applies severity and injury-type multipliers to approximate pain, suffering, impairment, and future-risk value. Liability disputes, policy limits, and liens can still move the real outcome sharply.</p>';
      });
    }
  });
})();