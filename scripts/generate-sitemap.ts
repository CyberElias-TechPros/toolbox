/**
 * Build-time sitemap generator.
 * Reads the tool registry (single source of truth) and emits public/sitemap.xml.
 * Set SITE_URL to override the origin (default: production placeholder).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../src/registry/index.ts';
import { CATEGORIES } from '../src/registry/categories.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const origin = (process.env.SITE_URL || 'https://toolbox.example.com').replace(/\/$/, '');

const urls: Array<{ loc: string; title: string; description: string }> = [
  { loc: '/', title: 'Toolbox — Everyday Tools, All in One Place', description: 'Free, fast, private browser tools: images, PDF, text, developer, calculators, marketing and business.' },
  { loc: '/tools', title: 'All Tools | Toolbox', description: `Browse all ${TOOLS.length} free online tools.` },
  ...CATEGORIES.map((c) => ({
    loc: `/category/${c.id}`,
    title: `${c.name} | Toolbox`,
    description: c.description,
  })),
  ...TOOLS.map((t) => ({
    loc: `/tools/${t.slug}`,
    title: `${t.name} — Free Online Tool | Toolbox`,
    description: t.description,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${origin}${u.loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u.loc === '/' ? '1.0' : u.loc === '/tools' ? '0.9' : u.loc.startsWith('/category/') ? '0.8' : '0.7'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const outPath = join(root, 'public', 'sitemap.xml');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, xml);
console.log(`[sitemap] wrote ${urls.length} URLs → public/sitemap.xml (origin: ${origin})`);
