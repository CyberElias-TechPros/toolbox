import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { cronDescribe, cronNext, parseCron } from '../../lib/cron';

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Daily at 09:00', expr: '0 9 * * *' },
  { label: 'Weekdays at 09:00', expr: '0 9 * * 1-5' },
  { label: 'Every hour on the hour', expr: '0 * * * *' },
  { label: 'Every Sunday 00:00', expr: '0 0 * * 0' },
  { label: '1st of every month 00:00', expr: '0 0 1 * *' },
];

const fmt = (d: Date) =>
  d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function CronHelper() {
  const [expr, setExpr] = useState('0 9 * * 1-5');

  const parsed = useMemo(() => parseCron(expr), [expr]);
  const next = useMemo(() => (parsed.ok ? cronNext(expr, new Date(), 5) : { ok: false as const, error: parsed.error }), [parsed, expr]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Cron expression (5 fields: minute hour day-of-month month day-of-week)">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              className="w-full max-w-sm font-mono"
              aria-label="Cron expression"
              placeholder="0 9 * * 1-5"
            />
            <CopyButton text={expr} label="Copy" />
          </div>
        </Field>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => setExpr(p.expr)}
              className={`rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                expr === p.expr
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'border-zinc-200 text-zinc-600 hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {parsed.ok ? (
        <>
          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 text-sm font-semibold">What it does</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{cronDescribe(expr)}</p>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold">Next 5 runs (your local time)</h2>
            <ol className="space-y-2">
              {next.ok
                ? next.dates.map((d, i) => (
                    <li key={i} className="rounded-xl bg-zinc-50 px-4 py-2.5 font-mono text-sm tabular-nums dark:bg-zinc-950">
                      {fmt(d)}
                    </li>
                  ))
                : null}
              {next.ok && next.dates.length === 0 ? <li className="text-sm text-zinc-500">No runs in the next year.</li> : null}
            </ol>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Note: cron runs on your scheduler (e.g. Cloudflare Cron Triggers) in its own timezone — usually UTC, while this preview uses your local time.
            </p>
          </Card>
        </>
      ) : (
        <ErrorNote>{parsed.error}</ErrorNote>
      )}
    </div>
  );
}
