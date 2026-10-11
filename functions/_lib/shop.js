// Shared helpers for the shop Functions. No secrets in this file: secrets come from env.
export const CATALOG = {
  toolkit: { name: 'Lawyer Quote & Fee Agreement Toolkit', amount: 2400, files: ['toolkit/LCG-Lawyer-Quote-Toolkit.xlsx', 'toolkit/LCG-Lawyer-Quote-Toolkit-Worksheets.pdf'] },
  divorce: { name: 'Divorce Cost & Lawyer Budget Planner', amount: 2700, files: ['divorce/LCG-Divorce-Budget-Planner.xlsx', 'divorce/LCG-Divorce-Budget-Planner-Workbook.pdf'] },
  estate: { name: '"If Something Happens" Family Information Binder', amount: 1900, files: ['estate/LCG-If-Something-Happens-Binder.pdf', 'estate/LCG-Family-Information-Inventory.xlsx'] },
  smallclaims: { name: 'Small Claims Filing Kit', amount: 1900, files: ['smallclaims/LCG-Small-Claims-Organizer.xlsx', 'smallclaims/LCG-Small-Claims-Worksheets.pdf'] },
};
CATALOG.bundle = { name: 'Legal Cost Planning Bundle (all 4 kits)', amount: 5900, files: [...CATALOG.toolkit.files, ...CATALOG.divorce.files, ...CATALOG.estate.files, ...CATALOG.smallclaims.files] };
export const CURRENCY = 'usd';
export const DOWNLOAD_LIMIT = 25;          // per file per order
export const LINK_TTL_SECONDS = 15 * 60;   // signed download URL lifetime
export const ACCESS_DAYS = 365;            // access page validity after purchase

export const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });

const enc = new TextEncoder();
export async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function sha256Hex(msg) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(msg));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Stripe-Signature: t=timestamp,v1=hex[,v1=hex]
export async function verifyStripeSignature(payload, header, secret, toleranceSec = 300, nowSec = Math.floor(Date.now() / 1000)) {
  if (!header || !secret) return { ok: false, reason: 'missing' };
  const parts = Object.create(null); const v1 = [];
  for (const kv of header.split(',')) { const [k, v] = kv.split('='); if (k === 'v1') v1.push(v); else parts[k] = v; }
  const t = Number(parts.t);
  if (!t || !v1.length) return { ok: false, reason: 'malformed' };
  if (Math.abs(nowSec - t) > toleranceSec) return { ok: false, reason: 'timestamp' };
  const expected = await hmacHex(secret, `${t}.${payload}`);
  return v1.some((s) => safeEqual(s, expected)) ? { ok: true } : { ok: false, reason: 'signature' };
}

export function skuForPaymentLink(env, plink) {
  try { return JSON.parse(env.PAYMENT_LINKS || '{}')[plink] || null; } catch { return null; }
}
export function paymentLinkUrl(env, sku) {
  try { return JSON.parse(env.PAYMENT_LINK_URLS || '{}')[sku] || null; } catch { return null; }
}

export function orderCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = crypto.getRandomValues(new Uint8Array(8));
  const s = [...b].map((x) => a[x % a.length]).join('');
  return `LCG-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const SESSION_RE = /^cs_(live|test)_[A-Za-z0-9]{10,200}$/;

export async function bump(env, { event, path = '', sku = '', placement = '' }) {
  if (!env.DB) return;
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare('INSERT INTO funnel (day, event, path, sku, placement, count) VALUES (?1, ?2, ?3, ?4, ?5, 1) ON CONFLICT(day, event, path, sku, placement) DO UPDATE SET count = count + 1')
    .bind(day, event, path.slice(0, 200), String(sku || '').slice(0, 40), String(placement || '').slice(0, 40)).run();
}
