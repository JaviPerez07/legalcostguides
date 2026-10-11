// Access recovery without email infrastructure: email used at checkout + order code (shown on the access page)
// or the receipt number from Stripe's emailed receipt. Rate limited per hashed IP per hour.
import { json, sha256Hex } from '../_lib/shop.js';

export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return json({ ok: false, message: 'Invalid request.' }, 400); }
  const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  const code = String(body.code || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 40);
  if (!email.includes('@') || code.length < 6) return json({ ok: false, message: 'Enter the email you used at checkout and your order code or receipt number.' }, 400);
  const ip = request.headers.get('CF-Connecting-IP') || '0';
  const hour = new Date().toISOString().slice(0, 13);
  const key = await sha256Hex(`${ip}|${hour}|${env.DOWNLOAD_SIGNING_KEY}`);
  await env.DB.prepare('INSERT INTO recover_attempts (key, hour, n) VALUES (?1, ?2, 1) ON CONFLICT(key, hour) DO UPDATE SET n = n + 1').bind(key, hour).run();
  const att = await env.DB.prepare('SELECT n FROM recover_attempts WHERE key = ?1 AND hour = ?2').bind(key, hour).first();
  if (att && att.n > 10) return json({ ok: false, message: 'Too many attempts. Please try again in an hour or email javiperezguides@gmail.com.' }, 429);
  const row = await env.DB.prepare(`SELECT o.session_id FROM orders o LEFT JOIN receipts r ON r.payment_intent = o.payment_intent
     WHERE o.email = ?1 AND o.status = 'paid' AND (UPPER(o.order_code) = ?2 OR REPLACE(UPPER(r.receipt_number),' ','') = ?2) ORDER BY o.created_at DESC LIMIT 1`).bind(email, code).first();
  if (!row) return json({ ok: false, message: 'We could not match that email and code. Check both, or email javiperezguides@gmail.com from the address you used at checkout.' });
  return json({ ok: true, url: `/access/?session_id=${encodeURIComponent(row.session_id)}` });
}
