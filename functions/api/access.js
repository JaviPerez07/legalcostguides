// Returns the order status and short-lived signed download links for a Checkout Session id.
// Access is granted only for orders the signed webhook marked as paid; the session id in the URL is not proof of payment by itself.
import { CATALOG, json, hmacHex, SESSION_RE, LINK_TTL_SECONDS, ACCESS_DAYS, DOWNLOAD_LIMIT, bump } from '../_lib/shop.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sid = url.searchParams.get('session_id') || '';
  if (!SESSION_RE.test(sid)) return json({ status: 'invalid' }, 400);
  const o = await env.DB.prepare('SELECT session_id, sku, status, order_code, created_at FROM orders WHERE session_id = ?1').bind(sid).first();
  if (!o) return json({ status: 'unknown' });              // webhook not received yet (or not a real purchase)
  if (o.status !== 'paid') return json({ status: o.status });
  const created = Date.parse(o.created_at.replace(' ', 'T') + 'Z');
  if (Date.now() - created > ACCESS_DAYS * 864e5) return json({ status: 'access_expired' });
  const item = CATALOG[o.sku];
  if (!item) return json({ status: 'review' });
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  const counts = Object.fromEntries((await env.DB.prepare('SELECT file_key, count FROM downloads WHERE session_id = ?1').bind(sid).all()).results.map((r) => [r.file_key, r.count]));
  const listed = await env.FILES.list({ prefix: o.sku === 'bundle' ? '' : o.sku + '/' });
  const metaByKey = Object.fromEntries(listed.keys.map((k) => [k.name, k.metadata || {}]));
  const files = [];
  for (const key of item.files) {
    const sig = await hmacHex(env.DOWNLOAD_SIGNING_KEY, `${sid}|${key}|${exp}`);
    const meta = metaByKey[key] || {};
    files.push({ name: key.split('/').pop(), size: meta.size || null, remaining: Math.max(DOWNLOAD_LIMIT - (counts[key] || 0), 0),
      url: `/api/download?s=${encodeURIComponent(sid)}&f=${encodeURIComponent(key)}&e=${exp}&sig=${sig}` });
  }
  await bump(env, { event: 'access_view', path: '/access/', sku: o.sku });
  return json({ status: 'paid', sku: o.sku, product: item.name, code: o.order_code, linkExpiresAt: exp, files });
}
