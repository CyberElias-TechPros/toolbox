/** XML sitemap builder + URL list validation. Pure and tested. */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `    <lastmod>${esc(u.lastmod)}</lastmod>\n` : '';
      const cf = u.changefreq ? `    <changefreq>${esc(u.changefreq)}</changefreq>\n` : '';
      const pr = u.priority ? `    <priority>${esc(u.priority)}</priority>\n` : '';
      return `  <url>\n    <loc>${esc(u.loc)}</loc>\n${lastmod}${cf}${pr}  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export type UrlListResult = { ok: true; urls: string[] } | { ok: false; error: string };

/** Parse a newline/comma separated list of absolute http(s) URLs. */
export function parseUrlList(text: string): UrlListResult {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const raw of text.split(/[\n,]+/)) {
    const url = raw.trim();
    if (!url) continue;
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      return { ok: false, error: `"${url}" is not a valid absolute URL (it needs https://…)` };
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { ok: false, error: `"${url}" must be an http(s) URL.` };
    }
    if (!seen.has(u.href)) {
      seen.add(u.href);
      urls.push(u.href);
    }
  }
  if (urls.length === 0) return { ok: false, error: 'No URLs found. Paste one URL per line.' };
  return { ok: true, urls };
}

export const isIsoDate = (s: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());
