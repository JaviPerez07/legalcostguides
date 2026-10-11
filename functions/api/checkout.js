// Counts a checkout start and redirects to the Stripe Payment Link for the product.
import { CATALOG, paymentLinkUrl, bump } from '../_lib/shop.js';
export async function onRequestGet({ request, env }) {
  const sku = new URL(request.url).searchParams.get('sku') || '';
  const target = CATALOG[sku] && paymentLinkUrl(env, sku);
  if (!target) return Response.redirect(new URL('/products/', request.url).toString(), 302);
  try { await bump(env, { event: 'checkout_start', path: '/api/checkout', sku }); } catch {}
  return new Response(null, { status: 303, headers: { Location: target, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
