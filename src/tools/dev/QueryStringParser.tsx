import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/primitives';
import { downloadText } from '../../lib/utils';

export default function QueryStringParser() {
  const [input, setInput] = useState('https://example.com/products?category=shoes&size=42&ref=instagram');

  type Parsed = { ok: true; entries: Array<{ key: string; value: string }> } | { ok: false; error: string };

  const parsed: Parsed | null = useMemo(() => {
    const raw = input.trim();
    if (!raw) return null;
    let qs: string;
    try {
      if (raw.includes('://')) {
        const u = new URL(raw);
        qs = u.search.replace(/^\?/, '');
      } else {
        qs = raw.startsWith('?') ? raw.slice(1) : raw;
      }
    } catch {
      return { ok: false, error: 'That URL could not be parsed. Check the format (https://host/path?key=value).' };
    }
    const params = new URLSearchParams(qs);
    const entries: Array<{ key: string; value: string }> = [];
    params.forEach((value, key) => entries.push({ key, value }));
    return { ok: true, entries };
  }, [input]);

  const jsonView = useMemo(() => {
    if (!parsed?.ok || !parsed.entries.length) return '';
    const obj: Record<string, string | string[]> = {};
    for (const { key, value } of parsed.entries) {
      if (obj[key] === undefined) obj[key] = value;
      else if (Array.isArray(obj[key])) (obj[key] as string[]).push(value);
      else obj[key] = [obj[key] as string, value];
    }
    return JSON.stringify(obj, null, 2);
  }, [parsed]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="qs-input">
          Full URL or raw query string
        </label>
        <Input
          id="qs-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?a=1&b=two"
          className="font-mono"
          aria-label="URL or query string"
        />
      </Card>

      {parsed && !parsed.ok ? <ErrorNote>{parsed.error}</ErrorNote> : null}

      {parsed?.ok && parsed.entries.length > 0 ? (
        <>
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">
              {parsed.entries.length} parameter{parsed.entries.length > 1 ? 's' : ''}
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-[11px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                    <th className="px-3 py-2">Key</th>
                    <th className="px-3 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.entries.map((e, i) => (
                    <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                      <td className="px-3 py-2 font-mono text-indigo-600 dark:text-indigo-400">{e.key}</td>
                      <td className="break-all px-3 py-2 font-mono">{e.value || <span className="text-zinc-400">(empty)</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">As JSON</h2>
              <div className="flex gap-2">
                <CopyButton text={jsonView} label="Copy JSON" />
                <Button variant="secondary" size="sm" onClick={() => downloadText(jsonView, 'query-params.json', 'application/json')}>
                  ⬇ .json
                </Button>
              </div>
            </div>
            <pre className="mt-3 max-h-[20rem] overflow-auto rounded-xl bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
              {jsonView}
            </pre>
          </Card>
        </>
      ) : null}

      {input.trim() && parsed?.ok && parsed.entries.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No query parameters found in that input.</p>
      ) : null}
    </div>
  );
}
