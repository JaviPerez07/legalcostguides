// Streams a private file from KV after checking the signed link, the order status and the per-file download limit.
import { CATALOG, json, hmacHex, safeEqual, SESSION_RE, DOWNLOAD_LIMIT, bump } from '../_lib/shop.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const s = u.searchParams.get('s') || '', f = u.searchParams.get('f') || '', e = Number(u.searchParams.get('e') || 0), sig = u.searchParams.get('sig') || '';
  const fail = (msg, code = 403) => new Response(`${msg}\n\nOpen your access page again to get a fresh link, or visit https://legalcostguides.com/access/recover`, { status: code, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  if (!SESSION_RE.test(s) || !f || !e) return fail('Invalid link.', 400);
  if (Math.floor(Date.now() / 1000) > e) return fail('This download link has expired.');
  const expected = await hmacHex(env.DOWNLOAD_SIGNING_KEY, `${s}|${f}|${e}`);
  if (!safeEqual(sig, expected)) return fail('Invalid link.');
  const o = await env.DB.prepare('SELECT sku, status FROM orders WHERE session_id = ?1').bind(s).first();
  if (!o || o.status !== 'paid') return fail('This order does not have access.');
  if (!CATALOG[o.sku]?.files.includes(f)) return fail('This file is not part of your order.');
  const row = await env.DB.prepare('SELECT count FROM downloads WHERE session_id = ?1 AND file_key = ?2').bind(s, f).first();
  if (row && row.count >= DOWNLOAD_LIMIT) return fail('Download limit reached for this file. Email javiperezguides@gmail.com and we will help.', 429);
  const obj = await env.FILES.getWithMetadata(f, { type: 'arrayBuffer' });
  if (!obj || !obj.value) return fail('File not available right now. Please email javiperezguides@gmail.com.', 503);
  await env.DB.prepare("INSERT INTO downloads (session_id, file_key, count, last_at) VALUES (?1, ?2, 1, datetime('now')) ON CONFLICT(session_id, file_key) DO UPDATE SET count = count + 1, last_at = datetime('now')").bind(s, f).run();
  await bump(env, { event: 'download', path: '/api/download', sku: o.sku });
  const name = f.split('/').pop();
  return new Response(obj.value, { headers: { 'Content-Type': obj.metadata?.contentType || 'application/octet-stream', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' } });
}
