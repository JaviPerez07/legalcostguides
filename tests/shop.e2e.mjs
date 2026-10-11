// End-to-end test of the purchase/access/download flow against `wrangler pages dev` with synthetic,
// correctly signed Stripe events (same HMAC scheme Stripe uses). Run: BASE=http://127.0.0.1:8788 node tests/shop.e2e.mjs
import crypto from 'node:crypto';
const BASE = process.env.BASE || 'http://127.0.0.1:8788';
const SECRET = process.env.WHSEC || 'whsec_localtest123';
let n = 0, failed = 0;
const ok = (cond, msg) => { n++; if (cond) console.log('  ✓', msg); else { failed++; console.log('  ✗', msg); } };
const rid = (p) => p + crypto.randomBytes(12).toString('hex');

async function send(event, { secret = SECRET, ts = Math.floor(Date.now() / 1000), raw = null } = {}) {
  const body = raw ?? JSON.stringify(event);
  const sig = crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
  const r = await fetch(BASE + '/api/stripe-webhook', { method: 'POST', body, headers: { 'Stripe-Signature': `t=${ts},v1=${sig}`, 'Content-Type': 'application/json' } });
  return { status: r.status, body: await r.json().catch(() => null) };
}
const ev = (type, object, livemode = true) => ({ id: rid('evt_'), type, livemode, data: { object } });
const session = (o = {}) => ({ id: rid('cs_live_'), object: 'checkout.session', metadata: { site: 'legalcostguides', sku: 'toolkit' }, payment_link: 'plink_test_toolkit', payment_status: 'paid', status: 'complete', amount_total: 2400, currency: 'usd', customer_details: { email: 'Buyer@Example.com' }, payment_intent: rid('pi_'), ...o });
const access = async (sid) => (await fetch(BASE + '/api/access?session_id=' + encodeURIComponent(sid))).json();

console.log('1. Unpaid access: a session id that never paid gets no files');
const ghost = rid('cs_live_');
ok((await access(ghost)).status === 'unknown', 'unknown session → status unknown, no files');
ok((await fetch(BASE + '/api/access?session_id=hello')).status === 400, 'malformed session id → 400');

console.log('2. Signature checks');
const s0 = session();
ok((await send(ev('checkout.session.completed', s0), { secret: 'whsec_wrong' })).status === 400, 'wrong secret rejected');
ok((await send(ev('checkout.session.completed', s0), { ts: Math.floor(Date.now() / 1000) - 3600 })).status === 400, 'old timestamp (replay) rejected');
ok((await access(s0.id)).status === 'unknown', 'rejected events grant nothing');
ok((await send(ev('checkout.session.completed', s0, false))).body?.ignored === 'mode mismatch', 'test-mode event ignored by live endpoint');

console.log('3. Successful payment');
const s1 = session();
const e1 = ev('checkout.session.completed', s1);
ok((await send(e1)).status === 200, 'completed event accepted');
let a1 = await access(s1.id);
ok(a1.status === 'paid' && a1.files?.length === 2 && /^LCG-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(a1.code), 'paid → 2 files + order code');
const r1 = await fetch(BASE + a1.files[0].url);
const buf = Buffer.from(await r1.arrayBuffer());
ok(r1.status === 200 && buf.length > 1000 && /attachment/.test(r1.headers.get('content-disposition')), `download works (${buf.length} bytes)`);
ok(buf.slice(0, 2).toString() === 'PK', 'xlsx bytes intact (zip header)');

console.log('4. Duplicate event');
const dup = await send(e1);
ok(dup.status === 200 && dup.body.duplicate === true, 'same event id → acknowledged as duplicate, not reprocessed');
ok((await access(s1.id)).code === a1.code, 'order code unchanged after duplicate');

console.log('5. Tampered / expired download links');
const u = new URL(BASE + a1.files[0].url);
u.searchParams.set('f', 'divorce/LCG-Divorce-Budget-Planner.xlsx');
ok((await fetch(u)).status === 403, 'changing the file parameter breaks the signature');
const u2 = new URL(BASE + a1.files[0].url); u2.searchParams.set('e', String(Number(u2.searchParams.get('e')) + 999));
ok((await fetch(u2)).status === 403, 'extending expiry breaks the signature');
const past = Math.floor(Date.now() / 1000) - 10;
const sigPast = crypto.createHmac('sha256', 'local-signing-key-not-secret').update(`${s1.id}|toolkit/LCG-Lawyer-Quote-Toolkit.xlsx|${past}`).digest('hex');
ok((await fetch(`${BASE}/api/download?s=${s1.id}&f=toolkit/LCG-Lawyer-Quote-Toolkit.xlsx&e=${past}&sig=${sigPast}`)).status === 403, 'expired link (validly signed) refused');
const sigOther = crypto.createHmac('sha256', 'local-signing-key-not-secret').update(`${ghost}|toolkit/LCG-Lawyer-Quote-Toolkit.xlsx|${past + 1000}`).digest('hex');
ok((await fetch(`${BASE}/api/download?s=${ghost}&f=toolkit/LCG-Lawyer-Quote-Toolkit.xlsx&e=${past + 1000}&sig=${sigOther}`)).status === 403, 'signed link for an unpaid session refused');

console.log('6. Wrong product / wrong amount');
const s2 = session({ payment_link: 'plink_unknown' });
await send(ev('checkout.session.completed', s2));
ok((await access(s2.id)).status === 'review', 'our metadata but unknown payment link → review, no files');
const sOther = session({ payment_link: 'plink_other_site', metadata: { site: 'another-site' } });
await send(ev('checkout.session.completed', sOther));
ok((await access(sOther.id)).status === 'unknown', "another project's checkout on the shared account → ignored, nothing stored");
const s3 = session({ amount_total: 100 });
await send(ev('checkout.session.completed', s3));
ok((await access(s3.id)).status === 'review', 'amount lower than catalog → review, no files');

console.log('7. Delayed payment: pending → succeeded, pending → failed');
const s4 = session({ payment_status: 'unpaid' });
await send(ev('checkout.session.completed', s4));
ok((await access(s4.id)).status === 'pending', 'unpaid completion → pending, no files');
await send(ev('checkout.session.async_payment_succeeded', { ...s4, payment_status: 'paid' }));
ok((await access(s4.id)).status === 'paid', 'async success → paid');
const s5 = session({ payment_status: 'unpaid' });
await send(ev('checkout.session.completed', s5));
await send(ev('checkout.session.async_payment_failed', s5));
ok((await access(s5.id)).status === 'failed', 'async failure → failed, no files');

console.log('8. Cancelled / expired checkout');
const s6 = session({ payment_status: 'unpaid', status: 'expired' });
await send(ev('checkout.session.expired', s6));
ok((await access(s6.id)).status === 'expired', 'expired session → no files');

console.log('9. Refund revokes access');
const s7 = session();
await send(ev('checkout.session.completed', s7));
const a7 = await access(s7.id);
await send(ev('charge.refunded', { id: rid('ch_'), payment_intent: s7.payment_intent }));
ok((await access(s7.id)).status === 'refunded', 'refund → status refunded');
ok((await fetch(BASE + a7.files[0].url)).status === 403, 'previously issued link stops working after refund');

console.log('10. Bundle delivers all files');
const s8 = session({ payment_link: 'plink_test_bundle', amount_total: 5900 });
await send(ev('checkout.session.completed', s8));
ok((await access(s8.id)).files?.length === 8, 'bundle → 8 files');

console.log('11. Recovery');
const rec = async (email, code) => (await fetch(BASE + '/api/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) })).json();
ok((await rec('buyer@example.com', a1.code)).url?.includes(s1.id) || (await rec('buyer@example.com', a1.code)).ok, 'email + order code → access link');
ok((await rec('someone@else.com', a1.code)).ok === false, 'wrong email → no access');
await send(ev('charge.succeeded', { id: rid('ch_'), payment_intent: s1.payment_intent, receipt_number: '1234-5678', metadata: { site: 'legalcostguides' } }));
ok((await rec('BUYER@example.com', '1234-5678')).ok === true, 'email + Stripe receipt number → access link');

console.log('12. Funnel endpoint and checkout redirect');
ok((await fetch(BASE + '/api/e', { method: 'POST', body: JSON.stringify({ e: 'cta_click', p: '/pages/x', sku: 'toolkit', pl: 'mid' }) })).status === 204, 'event accepted');
const co = await fetch(BASE + '/api/checkout?sku=toolkit', { redirect: 'manual' });
ok(co.status === 303 && co.headers.get('location').startsWith('https://buy.stripe.com/'), 'checkout redirect to Payment Link');
const co2 = await fetch(BASE + '/api/checkout?sku=nope', { redirect: 'manual' });
ok(co2.status === 302, 'unknown sku → back to products');

console.log(`\n${n - failed}/${n} checks passed`);
process.exit(failed ? 1 : 0);
