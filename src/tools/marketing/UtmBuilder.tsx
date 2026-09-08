import { useMemo, useState } from 'react';
import { Card, InfoNote } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';

/** Append UTM params to a URL, keeping any existing query string intact. */
export function buildUtms(baseUrl: string, utm: Record<string, string>): string {
  const url = baseUrl.trim();
  if (!url) return '';
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url; // not a valid absolute URL — return as-is
  }
  const map = new URLSearchParams(parsed.search);
  for (const [k, v] of Object.entries(utm)) {
    if (v.trim()) map.set(k, v.trim());
  }
  const qs = map.toString();
  return `${parsed.origin}${parsed.pathname}${qs ? `?${qs}` : ''}${parsed.hash}`;
}

const FIELDS: Array<{ key: string; label: string; placeholder: string; hint?: string }> = [
  { key: 'utm_source', label: 'Source', placeholder: 'instagram', hint: 'Where the link lives' },
  { key: 'utm_medium', label: 'Medium', placeholder: 'social', hint: 'Type of link (social, email, cpc…)' },
  { key: 'utm_campaign', label: 'Campaign', placeholder: 'spring-sale-2026', hint: 'Name of the promotion' },
  { key: 'utm_term', label: 'Term (optional)', placeholder: 'running shoes' },
  { key: 'utm_content', label: 'Content (optional)', placeholder: 'feed-ad-variant-b' },
];

export default function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('');
  const [utm, setUtm] = useState<Record<string, string>>({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  });

  const result = useMemo(() => buildUtms(baseUrl, utm), [baseUrl, utm]);
  const anyParam = Object.values(utm).some((v) => v.trim());
  const validUrl = useMemo(() => {
    if (!baseUrl.trim()) return null;
    try {
      new URL(baseUrl.trim());
      return true;
    } catch {
      return false;
    }
  }, [baseUrl]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <Field label="Destination URL">
          <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com/promo" aria-label="Destination URL" className="font-mono" />
        </Field>
        {baseUrl.trim() && validUrl === false ? (
          <p role="alert" className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            That doesn’t look like a full URL — include the https:// part.
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Input
                value={utm[f.key]}
                onChange={(e) => setUtm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                aria-label={f.label}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Your tracking link</h2>
        <div className="mt-4 flex-1 rounded-2xl bg-zinc-950 p-5">
          {result ? (
            <>
              <a href={result} target="_blank" rel="noopener noreferrer" className="block break-all text-sm leading-relaxed text-emerald-300 hover:underline">
                {result}
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={result} label="Copy link" variant="primary" />
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center rounded-xl border border-zinc-700 px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Open ↗
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Paste a destination URL to get started.</p>
          )}
        </div>
        <div className="mt-4">
          <InfoNote>
            {anyParam
              ? 'Only the fields you filled are added. Paste this link in your posts, emails or ads — clicks will be attributed in your analytics.'
              : 'Fill in at least source and medium so your analytics can attribute clicks.'}
          </InfoNote>
        </div>
      </Card>
    </div>
  );
}
