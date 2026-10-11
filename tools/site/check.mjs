// QA checks over dist/: internal links, canonicals, titles, meta, JSON-LD, citations, forbidden text.
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.html')) files.push(p); } })(DIST);
const redirects = fs.readFileSync(path.join(DIST, '_redirects'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/)[0]);
const exists = (u) => {
  u = u.split('#')[0].split('?')[0];
  if (u === '/' ) return true;
  const cands = [path.join(DIST, u), path.join(DIST, u + '.html'), path.join(DIST, u, 'index.html')];
  return cands.some((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || redirects.includes(u) || u.startsWith('/api/');
};
const problems = []; const titles = new Map(); const descs = new Map();
const FORBIDDEN = [/cited individually/i, /city tier/i, /lorem ipsum/i, /\bTODO\b/, /\bplaceholder text\b/i, /\[placeholder\]/i, /\bfetcher\b/i, /could not be fetched/i, /planning estimate \(derived\)/i, /\{\{|\}\}/, /undefined/, /\bNaN\b/];
for (const f of files) {
  const rel = '/' + path.relative(DIST, f);
  const h = fs.readFileSync(f, 'utf8');
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(h);
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const c = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!t) problems.push([rel, 'missing title']); else if (!noindex) { if (titles.has(t)) problems.push([rel, 'duplicate title with ' + titles.get(t)]); titles.set(t, rel); if (t.length > 75) problems.push([rel, `title ${t.length} chars`]); }
  if (!d) problems.push([rel, 'missing description']); else if (!noindex) { if (descs.has(d)) problems.push([rel, 'duplicate description']); descs.set(d, rel); if (d.length > 165) problems.push([rel, `description ${d.length} chars`]); }
  if (!c) problems.push([rel, 'missing canonical']);
  else { const cp = c.replace('https://legalcostguides.com', ''); const expect = rel.replace(/index\.html$/, '').replace(/\.html$/, ''); if (cp !== expect && !(expect === '/404')) problems.push([rel, `canonical ${cp} != ${expect}`]); }
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) problems.push([rel, 'h1 count ' + (h.match(/<h1[\s>]/g) || []).length]);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push([rel, 'bad JSON-LD']); } }
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) if (!exists(m[1])) problems.push([rel, 'broken link ' + m[1]]);
  for (const m of h.matchAll(/href="#(src-\d+)"/g)) if (!h.includes(`id="${m[1]}"`)) problems.push([rel, 'missing citation target ' + m[1]]);
  for (const m of h.matchAll(/href="(#[^"]+)"/g)) { const id = m[1].slice(1); if (!h.includes(`id="${id}"`) && id !== 'main') problems.push([rel, 'missing anchor ' + id]); }
  const text = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  for (const re of FORBIDDEN) if (re.test(text)) problems.push([rel, 'forbidden text ' + re]);
  if (/rel="sponsored/.test(h) === false && /lawdepot\.com/.test(h)) problems.push([rel, 'lawdepot link without rel=sponsored']);
  for (const m of h.matchAll(/<a [^>]*href="https:\/\/www\.lawdepot\.com[^"]*"[^>]*>/g)) { if (!/sponsored/.test(m[0])) problems.push([rel, 'affiliate link missing sponsored']); if (!/pid=pg-SZ1ARYBWQS/.test(m[0])) problems.push([rel, 'affiliate link missing tracking id']); }
  for (const m of h.matchAll(/<img [^>]*>/g)) if (!/ alt="/.test(m[0])) problems.push([rel, 'img without alt']);
}
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
for (const m of sm.matchAll(/<loc>https:\/\/legalcostguides\.com([^<]*)<\/loc>/g)) if (!exists(m[1])) problems.push(['sitemap', 'missing ' + m[1]]);
for (const r of redirects) if (!['/index', '/states/index'].includes(r) && exists(r) && !r.startsWith('http') && fs.existsSync(path.join(DIST, r + '.html'))) problems.push(['_redirects', 'source still exists as page ' + r]);
console.log(`${files.length} HTML files checked, ${problems.length} problems`);
for (const p of problems) console.log(' -', p.join(': '));
process.exit(problems.length ? 1 : 0);
