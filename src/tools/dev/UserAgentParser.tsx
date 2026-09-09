import { useMemo, useState } from 'react';
import { Card, Stat } from '../../components/ui/primitives';
import { Field, Textarea } from '../../components/ui/fields';
import { parseUserAgent } from '../../lib/httphelp';

const SAMPLES = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

const DEVICE_ICON: Record<string, string> = {
  desktop: '💻',
  phone: '📱',
  tablet: '📲',
  unknown: '❓',
};

export default function UserAgentParser() {
  const [ua, setUa] = useState(SAMPLES[0]);

  const parsed = useMemo(() => (ua.trim() ? parseUserAgent(ua.trim()) : null), [ua]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="User-Agent string" hint="From your server logs or an API request header.">
          <Textarea
            value={ua}
            onChange={(e) => setUa(e.target.value)}
            className="min-h-[6rem] break-all font-mono text-xs"
            aria-label="User-Agent string"
          />
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setUa(s)}
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
            >
              {parseUserAgent(s).browser} / {parseUserAgent(s).os}
            </button>
          ))}
        </div>
      </Card>

      {parsed ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Browser" value={parsed.browser} sub={parsed.browserVersion ? `v${parsed.browserVersion}` : undefined} accent />
          <Stat label="Operating system" value={parsed.os} sub={parsed.osVersion || undefined} />
          <Stat label="Device" value={`${DEVICE_ICON[parsed.device]} ${parsed.device}`} />
          <Stat label="Length" value={`${ua.trim().length} chars`} />
        </div>
      ) : (
        <Card className="p-6 text-sm text-zinc-500">Paste a User-Agent string to see the parsed result.</Card>
      )}
    </div>
  );
}
