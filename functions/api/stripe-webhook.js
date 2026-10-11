// Stripe webhook: signature-verified, idempotent. The ONLY place an order becomes "paid".
import { CATALOG, CURRENCY, json, verifyStripeSignature, skuForPaymentLink, orderCode, bump } from '../_lib/shop.js';

export async function onRequestPost({ request, env }) {
  const payload = await request.text();
  const v = await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!v.ok) return json({ error: 'invalid signature' }, 400);

  let event;
  try { event = JSON.parse(payload); } catch { return json({ error: 'bad json' }, 400); }
  const live = env.STRIPE_LIVEMODE === 'true';
  if (Boolean(event.livemode) !== live) return json({ ignored: 'mode mismatch' }, 200);

  // Idempotency: record the event id first; if it already exists, acknowledge without reprocessing.
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO stripe_events (id, type, livemode) VALUES (?1, ?2, ?3)').bind(event.id, event.type, event.livemode ? 1 : 0).run();
  if (!ins.meta || ins.meta.changes === 0) return json({ received: true, duplicate: true });

  try {
    await handle(event, env);
  } catch (e) {
    // Let Stripe retry: remove the idempotency marker so the retry is processed.
    await env.DB.prepare('DELETE FROM stripe_events WHERE id = ?1').bind(event.id).run();
    return json({ error: 'processing failed' }, 500);
  }
  return json({ received: true });
}

// The Stripe account is shared with other projects: only objects that belong to this site are processed.
function isOurs(o, env) {
  return o?.metadata?.site === 'legalcostguides' || Boolean(skuForPaymentLink(env, o?.payment_link));
}

async function handle(event, env) {
  const o = event.data?.object || {};
  const now = new Date().toISOString();
  const charge = event.type.startsWith('charge.');
  if (!charge && !isOurs(o, env)) return;            // another product's checkout: store nothing
  if (charge && o?.metadata?.site !== 'legalcostguides' && event.type !== 'charge.refunded') return;
  switch (event.type) {
    case 'checkout.session.completed': {
      const sku = skuForPaymentLink(env, o.payment_link);
      const item = sku ? CATALOG[sku] : null;
      let status = o.payment_status === 'paid' ? 'paid' : 'pending';
      let note = null;
      if (!item) { status = 'review'; note = 'unknown payment link'; }
      else if (o.currency !== CURRENCY || (o.amount_total ?? -1) < item.amount) { status = 'review'; note = `amount/currency mismatch ${o.amount_total} ${o.currency}`; }
      const email = (o.customer_details?.email || o.customer_email || '').toLowerCase() || null;
      await env.DB.prepare(`INSERT INTO orders (session_id, sku, status, email, amount, currency, payment_intent, payment_link, order_code, livemode, note, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
        ON CONFLICT(session_id) DO UPDATE SET sku = excluded.sku, status = CASE WHEN orders.status IN ('refunded','paid') THEN orders.status ELSE excluded.status END,
          email = excluded.email, amount = excluded.amount, currency = excluded.currency, payment_intent = excluded.payment_intent, order_code = COALESCE(orders.order_code, excluded.order_code), note = excluded.note, updated_at = excluded.updated_at`)
        .bind(o.id, sku, status, email, o.amount_total ?? null, o.currency ?? null, o.payment_intent ?? null, o.payment_link ?? null, orderCode(), event.livemode ? 1 : 0, note, now).run();
      if (status === 'paid') await bump(env, { event: 'purchase_confirmed', path: '/webhook', sku });
      break;
    }
    case 'checkout.session.async_payment_succeeded':
      await env.DB.prepare("UPDATE orders SET status = 'paid', updated_at = ?2 WHERE session_id = ?1 AND status IN ('pending')").bind(o.id, now).run();
      await bump(env, { event: 'purchase_confirmed', path: '/webhook', sku: skuForPaymentLink(env, o.payment_link) || '' });
      break;
    case 'checkout.session.async_payment_failed':
      await env.DB.prepare("UPDATE orders SET status = 'failed', updated_at = ?2 WHERE session_id = ?1 AND status = 'pending'").bind(o.id, now).run();
      break;
    case 'checkout.session.expired':
      await env.DB.prepare("INSERT INTO orders (session_id, sku, status, livemode, updated_at) VALUES (?1, ?2, 'expired', ?3, ?4) ON CONFLICT(session_id) DO UPDATE SET status = CASE WHEN orders.status = 'pending' THEN 'expired' ELSE orders.status END, updated_at = excluded.updated_at")
        .bind(o.id, skuForPaymentLink(env, o.payment_link), event.livemode ? 1 : 0, now).run();
      break;
    case 'charge.refunded':
      if (o.payment_intent) await env.DB.prepare("UPDATE orders SET status = 'refunded', updated_at = ?2 WHERE payment_intent = ?1").bind(o.payment_intent, now).run();
      break;
    case 'charge.succeeded':
      if (o.payment_intent && o.receipt_number) await env.DB.prepare('INSERT INTO receipts (payment_intent, receipt_number) VALUES (?1, ?2) ON CONFLICT(payment_intent) DO UPDATE SET receipt_number = excluded.receipt_number').bind(o.payment_intent, o.receipt_number).run();
      break;
    case 'charge.updated':
      if (o.payment_intent && o.receipt_number) await env.DB.prepare('INSERT INTO receipts (payment_intent, receipt_number) VALUES (?1, ?2) ON CONFLICT(payment_intent) DO UPDATE SET receipt_number = excluded.receipt_number').bind(o.payment_intent, o.receipt_number).run();
      break;
    default:
      break; // ignored event types are acknowledged
  }
}
