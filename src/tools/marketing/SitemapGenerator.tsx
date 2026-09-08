import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Checkbox, Field, Input, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { buildSitemapXml, isIsoDate, parseUrlList } from '../../lib/sitemaptxt';
import { track } from '../../lib/track';

export default function SitemapGenerator() {
  const [urls, setUrls] = useState('https://example.com/\nhttps://example.com/about\nhttps://example.com/pricing');
  const [lastmod, setLastmod] = useState('');
  const [withMeta, setWithMeta] = useState(false);

  const parsed = useMemo(() => parseUrlList(urls), [urls]);
  const lastmodOk = lastmod === '' || isIsoDate(lastmod);

  const xml = useMemo(() => {
    if (!parsed.ok || !lastmodOk) return '';
    return buildSitemapXml(
      parsed.urls.map((loc) => ({
        loc,
        ...(withMeta && lastmod ? { lastmod } : {}),
        ...(withMeta ? { changefreq: 'monthly', priority: loc.endsWith('/') ? '1.0' : '0.8' } : {}),
      })),
    );
  }, [parsed, lastmod, lastmodOk, withMeta]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Field label="URLs (one per line)" hint="Include the https:// — relative paths are not valid sitemap entries.">
              <Textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[10rem] font-mono text-sm"
                aria-label="URLs"
              />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label="lastmod (optional, YYYY-MM-DD)" hint="Same date for every URL.">
              <Input type="date" value={lastmod} onChange={(e) => setLastmod(e.target.value)} aria-label="Last modified date" />
            </Field>
            <Checkbox
              label="Add changefreq + priority hints"
              checked={withMeta}
              onChange={setWithMeta}
            />
            {parsed.ok ? (
              <p className="text-xs text-zinc-500">
                {parsed.urls.length} valid URL{parsed.urls.length === 1 ? '' : 's'} found.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      {!parsed.ok ? <ErrorNote>{parsed.error}</ErrorNote> : null}
      {!lastmodOk ? <ErrorNote>That date isn’t a valid YYYY-MM-DD calendar date.</ErrorNote> : null}

      {xml ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">sitemap.xml</h2>
            <div className="flex gap-2">
              <CopyButton text={xml} />
              <button
                type="button"
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  downloadText(xml, 'sitemap.xml', 'application/xml');
                  track('download_clicked', 'sitemap-generator');
                }}
              >
                ⬇ Download
              </button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl bg-zinc-50 p-4 font-mono text-xs dark:bg-zinc-950">{xml}</pre>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Upload to /sitemap.xml and reference it from robots.txt with “Sitemap: https://yourdomain.com/sitemap.xml”.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
