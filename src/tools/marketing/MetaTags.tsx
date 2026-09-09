import { useMemo, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

export interface MetaInput {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  twitter: string;
}

/** Generate a ready-to-paste <head> snippet (SEO + Open Graph + Twitter/X). */
export function buildMetaTags(i: MetaInput): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const lines: string[] = [];
  if (i.title.trim()) lines.push(`  <title>${esc(i.title.trim())}</title>`);
  if (i.description.trim()) lines.push(`  <meta name="description" content="${esc(i.description.trim())}" />`);
  if (i.url.trim()) {
    lines.push(`  <link rel="canonical" href="${esc(i.url.trim())}" />`);
    lines.push(`  <meta property="og:url" content="${esc(i.url.trim())}" />`);
  }
  if (i.siteName.trim()) lines.push(`  <meta property="og:site_name" content="${esc(i.siteName.trim())}" />`);
  if (i.title.trim()) lines.push(`  <meta property="og:title" content="${esc(i.title.trim())}" />`);
  if (i.description.trim()) lines.push(`  <meta property="og:description" content="${esc(i.description.trim())}" />`);
  if (i.image.trim()) lines.push(`  <meta property="og:image" content="${esc(i.image.trim())}" />`);
  if (i.title.trim()) lines.push(`  <meta name="twitter:card" content="summary_large_image" />`);
  if (i.title.trim()) lines.push(`  <meta name="twitter:title" content="${esc(i.title.trim())}" />`);
  if (i.description.trim()) lines.push(`  <meta name="twitter:description" content="${esc(i.description.trim())}" />`);
  if (i.image.trim()) lines.push(`  <meta name="twitter:image" content="${esc(i.image.trim())}" />`);
  if (i.twitter.trim()) lines.push(`  <meta name="twitter:site" content="${esc(i.twitter.trim())}" />`);
  return `<!-- ToolBox meta tags -->\n${lines.join('\n')}`;
}

export default function MetaTags() {
  const [i, setI] = useState<MetaInput>({ title: '', description: '', url: '', image: '', siteName: '', twitter: '' });

  const output = useMemo(() => (i.title || i.description ? buildMetaTags(i) : ''), [i]);

  const set = (k: keyof MetaInput) => (e: React.ChangeEvent<HTMLInputElement>) => setI((prev) => ({ ...prev, [k]: e.target.value }));

  const len = (n: number, ideal: [number, number]) => (
    <span className={n > 0 && (n < ideal[0] || n > ideal[1]) ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}>
      {n} chars
    </span>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <div className="space-y-4">
          <Field label="Page title" hint={len(i.title.length, [30, 60])}>
            <Input value={i.title} onChange={set('title')} placeholder="Invoice Generator — Free Online Tool" aria-label="Page title" />
          </Field>
          <Field label="Meta description" hint={len(i.description.length, [120, 160])}>
            <Input value={i.description} onChange={set('description')} placeholder="Create a professional invoice in minutes — free, private, in your browser." aria-label="Meta description" />
          </Field>
          <Field label="Canonical URL">
            <Input value={i.url} onChange={set('url')} placeholder="https://example.com/invoice-generator" aria-label="Canonical URL" className="font-mono" />
          </Field>
          <Field label="Social preview image (absolute URL)">
            <Input value={i.image} onChange={set('image')} placeholder="https://example.com/og.png" aria-label="Social image URL" className="font-mono" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Site name">
              <Input value={i.siteName} onChange={set('siteName')} placeholder="ToolBox" aria-label="Site name" />
            </Field>
            <Field label="Twitter/X handle">
              <Input value={i.twitter} onChange={set('twitter')} placeholder="@yoursite" aria-label="Twitter handle" />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Generated tags</h2>
          {output ? (
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy all" />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  downloadText(output, 'meta-tags.html', 'text/html');
                  track('download_clicked', 'meta-tag-generator');
                }}
              >
                ⬇ .html
              </Button>
            </div>
          ) : null}
        </div>
        <pre className="mt-4 max-h-[26rem] overflow-auto rounded-xl bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
          {output || '<!-- Fill in the form to generate your tags -->'}
        </pre>
      </Card>
    </div>
  );
}
