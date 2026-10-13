import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const officialOrigin = 'https://amakudari.jp';
const base = process.argv[2] || officialOrigin;
const paths = ['/', '/about', '/data-policy', '/faq', '/privacy', '/terms', '/link-to-us', '/corporations', '/persons', '/topics', '/search', '/rankings', '/retirement-estimator', '/news', '/news/go-waymo-nihon-kotsu-robotaxi-tokyo-2027', '/organizations'];
const decode = (value = '') => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, decode(value)]));
}
function summarize(html, pathname) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attrs(tag));
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attrs(tag));
  const getMeta = (name) => meta.find((m) => m.name === name || m.property === name)?.content;
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => {
    try { return JSON.parse(json); } catch { return { invalidJson: true }; }
  });
  return {pathname, title: decode(html.match(/<title>(.*?)<\/title>/)?.[1]), description: getMeta('description'), canonical: links.find((l) => l.rel === 'canonical')?.href, robots: getMeta('robots'), ogTitle: getMeta('og:title'), ogUrl: getMeta('og:url'), ogSiteName: getMeta('og:site_name'), ogImage: getMeta('og:image'), twitterCard: getMeta('twitter:card'), twitterTitle: getMeta('twitter:title'), icons: links.filter((l) => ['icon', 'shortcut icon', 'apple-touch-icon'].includes(l.rel)).map(({rel,href,type,sizes}) => ({rel,href,type,sizes})), h1Count: [...html.matchAll(/<h1\b/g)].length, schemaTypes: schemas.flatMap((s) => (s['@graph'] || [s]).map((v) => v['@type'])), gaIds: [...new Set(html.match(/G-[A-Z0-9]{6,}/g) || [])]};
}

const pages = [];
for (const pathname of paths) {
  const response = await fetch(new URL(pathname, base), {signal: AbortSignal.timeout(20000)});
  const html = await response.text();
  pages.push({status: response.status, finalUrl: response.url, ...summarize(html, pathname)});
}
const assets = [];
for (const pathname of ['/robots.txt', '/sitemap.xml', '/favicon.jpg', '/favicon-96.png', '/favicon.ico', '/brand-icon-96.png', '/brand-icon-192.png', '/ogp.png', '/ogp.webp', '/3725674dc455444b8328b0609657f6ab.txt', '/audit-missing-page-20261013']) {
  const response = await fetch(new URL(pathname, base), {signal: AbortSignal.timeout(20000)});
  const bytes = Buffer.from(await response.arrayBuffer());
  assets.push({pathname, status: response.status, type: response.headers.get('content-type'), bytes: bytes.length, ...(pathname === '/robots.txt' ? {body: bytes.toString()} : {})});
}
const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
const report = {base, checkedAt: new Date().toISOString(), pages, assets, sitemap: {count: sitemapUrls.length, foreignUrls: sitemapUrls.filter((u) => !u.startsWith(officialOrigin + '/')), utilityUrls: sitemapUrls.filter((u) => /\/(search|topics|organizations)$/.test(u))}};

// Scan every generated HTML page locally, including href fragments. No external
// source requests or analytics credentials are needed for this regression check.
if (process.argv[3]) {
  const exportDir = path.resolve(process.argv[3]);
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== '_next') await walk(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file);
    }
  }
  await walk(exportDir);
  const htmlByPath = new Map();
  for (const file of files) {
    const relative = path.relative(exportDir, file).replaceAll('\\', '/');
    const pathname = relative === 'index.html' ? '/' : '/' + relative.replace(/\.html$/, '').replace(/\/index$/, '');
    htmlByPath.set(pathname, await readFile(file, 'utf8'));
  }
  const brokenLinks = new Set();
  const dynamicFragments = new Set();
  const metadataProblems = [];
  for (const [pathname, html] of htmlByPath) {
    if (['/404', '/_not-found', '/organizations'].includes(pathname)) continue;
    const summary = summarize(html, pathname);
    const matchesPath = (url) => url && new URL(url).origin === officialOrigin && new URL(url).pathname === pathname;
    if (!summary.title || !summary.description || !matchesPath(summary.canonical) || summary.h1Count !== 1 || !summary.ogTitle || !matchesPath(summary.ogUrl) || summary.ogSiteName !== '天下りマップ' || !summary.ogImage || !summary.twitterTitle) metadataProblems.push(summary);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const target = new URL(decode(href), officialOrigin + pathname);
      if (target.origin !== officialOrigin) continue;
      const destination = target.pathname.replace(/\/$/, '') || '/';
      if (/\.[a-z0-9]+$/i.test(destination)) continue;
      const targetHtml = htmlByPath.get(destination);
      if (!targetHtml) brokenLinks.add(`${pathname} -> ${target.pathname}`);
      else if (target.hash && !targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`)) {
        if (target.search) dynamicFragments.add(`${pathname} -> ${target.pathname}${target.search}${target.hash}`);
        else brokenLinks.add(`${pathname} -> ${target.pathname}${target.hash}`);
      }
    }
  }
  report.export = {pageCount: htmlByPath.size, metadataProblems, brokenLinks: [...brokenLinks], dynamicFragmentsToCheckInBrowser: [...dynamicFragments]};
}
if (process.argv[4]) {
  await writeFile(path.resolve(process.argv[4]), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({reportFile: path.resolve(process.argv[4]), checkedAt: report.checkedAt, statuses: pages.map(({pathname,status}) => ({pathname,status})), sitemap: report.sitemap, export: report.export}, null, 2));
} else console.log(JSON.stringify(report, null, 2));
