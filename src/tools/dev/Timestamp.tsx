import { useEffect, useState } from 'react';
import { Card, Stat } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

function fmt(date: Date): { local: string; utc: string } {
  return {
    local: new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'medium' }).format(date),
    utc: date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC'),
  };
}

export default function Timestamp() {
  const now = useNow();
  const [tsInput, setTsInput] = useState('');
  const [tsUnit, setTsUnit] = useState<'s' | 'ms'>('s');
  const [dateInput, setDateInput] = useState('');
  const [dateOutUnit, setDateOutUnit] = useState<'s' | 'ms'>('s');

  type TsResult = { ok: true; date: Date } | { ok: false; error: string };

  const tsParsed: TsResult | null = (() => {
    const raw = tsInput.trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, error: 'Enter a number (e.g. 1757500000).' };
    const ms = tsUnit === 'ms' ? n : n * 1000;
    if (!Number.isFinite(ms) || Math.abs(ms) > 1e15) return { ok: false, error: 'That timestamp is outside the representable range.' };
    return { ok: true, date: new Date(ms) };
  })();

  const dateParsed: TsResult | null = (() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return { ok: false, error: 'Pick a valid date and time.' };
    return { ok: true, date: d };
  })();

  const nowF = fmt(new Date(now));
  let dateOut: number | null = null;
  if (dateParsed?.ok) {
    dateOut = dateOutUnit === 's' ? Math.floor(dateParsed.date.getTime() / 1000) : dateParsed.date.getTime();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Now (Unix seconds)" value={Math.floor(now / 1000)} accent />
        <Stat label="Now (Unix ms)" value={now} />
        <Stat label="Now (ISO)" value={<span className="text-sm">{nowF.utc}</span>} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Timestamp → date</h2>
          <div className="mt-4 space-y-4">
            <Field label="Unix timestamp">
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  placeholder={tsUnit === 's' ? 'e.g. 1757500000' : 'e.g. 1757500000000'}
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  aria-label="Unix timestamp"
                  className="font-mono"
                />
                <Select value={tsUnit} onChange={(e) => setTsUnit(e.target.value as 's' | 'ms')} aria-label="Timestamp unit" className="w-24">
                  <option value="s">sec</option>
                  <option value="ms">ms</option>
                </Select>
              </div>
            </Field>
            {tsParsed ? (
              !tsParsed.ok ? (
                <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{tsParsed.error}</p>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-zinc-800 dark:text-zinc-200">{fmt(tsParsed.date).local}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{fmt(tsParsed.date).utc}</p>
                  <div className="mt-3">
                    <CopyButton text={tsParsed.date.toISOString()} label="Copy ISO 8601" />
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Seconds (default) or milliseconds.</p>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Date → timestamp</h2>
          <div className="mt-4 space-y-4">
            <Field label="Local date & time">
              <Input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} aria-label="Date and time" />
            </Field>
            {dateParsed ? (
              !dateParsed.ok ? (
                <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{dateParsed.error}</p>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stat label={dateOutUnit === 's' ? 'Unix seconds' : 'Unix ms'} value={dateOut ?? '—'} accent className="!min-w-[12rem]" />
                    <Select value={dateOutUnit} onChange={(e) => setDateOutUnit(e.target.value as 's' | 'ms')} aria-label="Output unit" className="w-24">
                      <option value="s">sec</option>
                      <option value="ms">ms</option>
                    </Select>
                    {dateOut != null ? <CopyButton text={String(dateOut)} label="Copy" /> : null}
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Uses your device’s local time zone.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
