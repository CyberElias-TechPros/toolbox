import { useMemo, useState } from 'react';
import { Card, Stat, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { ageBetween, daysUntilBirthday } from '../../lib/dates';
import { formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

type Mode = 'age' | 'between';

function toDate(input: string): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function AgeCalculator() {
  const [mode, setMode] = useState<Mode>('age');
  const [from, setFrom] = useState('2000-01-01');
  const [to, setTo] = useState('');

  const fromD = toDate(from);
  const toD = mode === 'between' ? toDate(to) : new Date();
  const valid = fromD != null && toD != null && toD.getTime() >= fromD.getTime();

  const result = useMemo(() => {
    if (!valid || !fromD || !toD) return null;
    const age = ageBetween(fromD, toD);
    const bday = mode === 'age' ? daysUntilBirthday(fromD, new Date()) : null;
    return { age, bday };
  }, [valid, fromD, toD, mode]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={mode === 'age' ? 'Date of birth' : 'Start date'}>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Start date" max={new Date().toISOString().slice(0, 10)} />
          </Field>
          {mode === 'between' ? (
            <Field label="End date">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="End date" />
            </Field>
          ) : (
            <Field label="Up to">
              <div className="flex h-[42px] items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
                Today ({new Date().toLocaleDateString()})
              </div>
            </Field>
          )}
        </div>
        <div className="mt-4">
          <Select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              track('tool_completed', 'age-calculator');
            }}
            aria-label="Mode"
            className="sm:w-72"
          >
            <option value="age">My exact age (from a date of birth)</option>
            <option value="between">Days between two dates</option>
          </Select>
        </div>
      </Card>

      {result ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Years" value={formatNumber(result.age.years, 0)} accent />
            <Stat label="Months" value={formatNumber(result.age.months, 0)} accent />
            <Stat label="Days" value={formatNumber(result.age.days, 0)} accent />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total days" value={formatNumber(result.age.totalDays, 0)} />
            <Stat label="Total weeks" value={formatNumber(result.age.totalWeeks, 0)} />
            <Stat label="Total hours" value={formatNumber(result.age.totalHours, 0)} />
          </div>
          {result.bday != null ? (
            <SuccessNote>
              {result.bday === 0
                ? '🎂 Happy birthday! It’s your birthday today.'
                : `Next birthday is in ${result.bday} day${result.bday > 1 ? 's' : ''}.`}
            </SuccessNote>
          ) : null}
        </>
      ) : (
        !valid && fromD && toD ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">The end date must be on or after the start date.</p>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Pick dates to see the result.</p>
        )
      )}
    </div>
  );
}
