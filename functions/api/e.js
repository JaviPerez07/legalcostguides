// Anonymous funnel counters: event name, page path, product and placement. No cookies, IPs or identifiers are stored.
import { json, bump, CATALOG } from '../_lib/shop.js';
const EVENTS = new Set(['cta_view', 'cta_click', 'affiliate_view', 'affiliate_click', 'offer_view', 'calc_use', 'free_download']);
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return new Response(null, { status: 204 }); }
  if (!EVENTS.has(b.e)) return new Response(null, { status: 204 });
  const path = typeof b.p === 'string' && b.p.startsWith('/') ? b.p.replace(/[^a-z0-9/_-]/gi, '').slice(0, 120) : '';
  const sku = typeof b.sku === 'string' ? b.sku.replace(/[^a-z0-9-]/gi, '').slice(0, 40) : '';
  const pl = typeof b.pl === 'string' ? b.pl.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) : '';
  try { await bump(env, { event: b.e, path, sku, placement: pl }); } catch { /* never break the page */ }
  return new Response(null, { status: 204 });
}
