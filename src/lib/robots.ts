/** robots.txt builder. Pure and tested. */

export interface RobotsOptions {
  allowAll: boolean;
  disallowPaths: string[];
  sitemapUrls: string[];
  comment?: string;
}

export function buildRobotsTxt(o: RobotsOptions): string {
  const lines: string[] = [];
  if (o.comment?.trim()) {
    for (const c of o.comment.split('\n').map((s) => s.trim()).filter(Boolean)) lines.push(`# ${c}`);
  }
  lines.push('User-agent: *');
  if (o.allowAll) lines.push('Allow: /');
  for (const p of o.disallowPaths) {
    const path = p.trim();
    if (!path) continue;
    const withSlash = path.startsWith('/') ? path : `/${path}`;
    lines.push(`Disallow: ${withSlash}`);
  }
  for (const s of o.sitemapUrls) {
    const url = s.trim();
    if (url) lines.push(`Sitemap: ${url}`);
  }
  return lines.join('\n') + '\n';
}
