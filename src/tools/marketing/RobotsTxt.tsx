import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Checkbox, Field, Input, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { buildRobotsTxt } from '../../lib/robots';
import { track } from '../../lib/track';

export default function RobotsTxt() {
  const [allowAll, setAllowAll] = useState(true);
  const [disallow, setDisallow] = useState('/admin\n/private');
  const [sitemaps, setSitemaps] = useState('https://example.com/sitemap.xml');
  const [comment, setComment] = useState('Generated with ToolBox');

  const output = useMemo(
    () =>
      buildRobotsTxt({
        allowAll,
        disallowPaths: disallow.split('\n'),
        sitemapUrls: sitemaps.split('\n'),
        comment,
      }),
    [allowAll, disallow, sitemaps, comment],
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox label="Allow all crawlers (Add Disallow rules below as needed)" checked={allowAll} onChange={setAllowAll} />
          <Field label="Comment (optional)">
            <Input value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
          </Field>
          <Field label="Disallow paths (one per line)">
            <Textarea
              value={disallow}
              onChange={(e) => setDisallow(e.target.value)}
              className="min-h-[6rem] font-mono text-sm"
              aria-label="Disallow paths"
              placeholder={'/admin\n/private'}
            />
          </Field>
          <Field label="Sitemap URLs (one per line)">
            <Textarea
              value={sitemaps}
              onChange={(e) => setSitemaps(e.target.value)}
              className="min-h-[6rem] font-mono text-sm"
              aria-label="Sitemap URLs"
              placeholder="https://example.com/sitemap.xml"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">robots.txt</h2>
          <div className="flex gap-2">
            <CopyButton text={output} />
            <button
              type="button"
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
              onClick={() => {
                downloadText(output, 'robots.txt');
                track('download_clicked', 'robots-txt');
              }}
            >
              ⬇ Download
            </button>
          </div>
        </div>
        <pre className="overflow-auto rounded-xl bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">{output}</pre>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Upload the file to your site’s root (https://yourdomain.com/robots.txt). “Disallow: /” blocks a path entirely.
        </p>
      </Card>
    </div>
  );
}
