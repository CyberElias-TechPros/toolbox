import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Checkbox, Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { WORLD_CLOCK_CITIES, timeInZone, utcOffsetLabel } from '../../lib/timezones';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

const PRESETS: Array<{ label: string; zone: string }> = [
  { label: 'Lagos (WAT)', zone: 'Africa/Lagos' },
  { label: 'London (GMT/BST)', zone: 'Europe/London' },
  { label: 'New York (EST)', zone: 'America/New_York' },
  { label: 'Dubai (GST)', zone: 'Asia/Dubai' },
  { label: 'Singapore (SGT)', zone: 'Asia/Singapore' },
];

export default function TimezoneConverter() {
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [source, setSource] = useState('Africa/Lagos');
  const [targets, setTargets] = useState<Set<string>>(
    new Set(['Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Singapore']),
  );

  const parsed = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [dateStr]);

  const toggle = (zone: string) =>
    setTargets((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });

  const rows = useMemo(() => {
    if (!parsed) return [];
    const all = new Map<string, string>();
    for (const z of [source, ...targets]) {
      if (!all.has(z)) all.set(z, z);
    }
    return [...all.values()].map((zone) => ({
      zone,
      label:
        zone === source
          ? `${zone} (source)`
          : zone === 'Africa/Lagos'
            ? 'Lagos'
            : zone.split('/').pop()?.replace(/_/g, ' ') ?? zone,
      time: timeInZone(parsed, zone),
      offset: utcOffsetLabel(parsed, zone),
    }));
  }, [parsed, source, targets]);

  const tableText = rows.map((r) => `${r.time} ${r.offset} — ${r.zone}`).join('\n');

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date & time">
            <Input type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} aria-label="Date and time" />
          </Field>
          <Field label="That time is in">
            <Input
              list="tz-options"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              aria-label="Source time zone"
              placeholder="Africa/Lagos"
            />
            <datalist id="tz-options">
              {WORLD_CLOCK_CITIES.map((c) => (
                <option key={c.zone} value={c.zone}>
                  {c.city}
                </option>
              ))}
            </datalist>
          </Field>
        </div>
        <h2 className="mb-2 mt-5 text-sm font-semibold">Convert to</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <Checkbox key={p.zone} label={p.label} checked={targets.has(p.zone)} onChange={() => toggle(p.zone)} />
          ))}
        </div>
      </Card>

      {parsed ? (
        <Card className="divide-y divide-zinc-100 overflow-hidden dark:divide-zinc-800">
          <div className="flex items-center justify-between bg-zinc-50 px-5 py-2.5 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short', timeZone: source }).format(parsed)} in {source}
            </p>
            <div className="flex gap-2">
              <CopyButton text={tableText} label="Copy table" />
              <button
                type="button"
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  downloadText(tableText, 'times.txt');
                  track('download_clicked', 'timezone-converter');
                }}
              >
                ⬇
              </button>
            </div>
          </div>
          {rows.map((r) => (
            <div key={r.zone} className="flex items-center gap-4 px-5 py-3">
              <span className="w-44 shrink-0 text-sm font-medium">{r.label}</span>
              <span className="font-mono text-lg font-bold tabular-nums">{r.time}</span>
              <span className="font-mono text-xs text-zinc-500">{r.offset}</span>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="p-6 text-sm text-zinc-500">Pick a valid date and time to see the conversions.</Card>
      )}
    </div>
  );
}
