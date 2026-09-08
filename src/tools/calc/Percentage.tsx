import { useState } from 'react';
import { Card, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { isPercentOf, percentChange, percentOf } from '../../lib/units';
import { formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

type Mode = 'of' | 'what' | 'change';

export default function Percentage() {
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('20');
  const [b, setB] = useState('50000');

  const na = parseFloat(a);
  const nb = parseFloat(b);
  const valid = Number.isFinite(na) && Number.isFinite(nb);

  let answer: string | null = null;
  let explanation: string | null = null;

  if (valid) {
    if (mode === 'of') {
      const v = percentOf(na, nb);
      answer = formatNumber(v, 4);
      explanation = `${formatNumber(na)}% of ${formatNumber(nb)} is ${formatNumber(v, 4)}  ( ${formatNumber(na)} ÷ 100 × ${formatNumber(nb)} )`;
    } else if (mode === 'what') {
      const v = isPercentOf(na, nb);
      if (v == null) {
        explanation = 'The whole (second number) cannot be zero.';
      } else {
        answer = `${formatNumber(v, 4)}%`;
        explanation = `${formatNumber(na)} is ${formatNumber(v, 4)}% of ${formatNumber(nb)}  ( ${formatNumber(na)} ÷ ${formatNumber(nb)} × 100 )`;
      }
    } else {
      const { change, direction } = percentChange(na, nb);
      if (change == null) explanation = 'The starting value cannot be zero for a percentage change.';
      else if (direction === 'same') {
        answer = '0%';
        explanation = 'Both values are equal — no change.';
      } else {
        answer = `${formatNumber(Math.abs(change), 4)}% ${direction}`;
        explanation = `From ${formatNumber(na)} to ${formatNumber(nb)}: a ${direction} of ${formatNumber(Math.abs(change), 4)}%  ( |${formatNumber(nb)} − ${formatNumber(na)}| ÷ ${formatNumber(Math.abs(na))} × 100 )`;
      }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <Field label="I want to know…" className="mb-4">
          <Select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              track('tool_completed', 'percentage-calculator');
            }}
            aria-label="Percentage mode"
          >
            <option value="of">What is X% of Y?</option>
            <option value="what">X is what percent of Y?</option>
            <option value="change">Percent change from X to Y?</option>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label={mode === 'of' ? 'Percent (X%)' : mode === 'what' ? 'Part (X)' : 'From (X)'}
          >
            <Input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} aria-label="First value" />
          </Field>
          <Field label={mode === 'of' ? 'Of (Y)' : mode === 'what' ? 'Whole (Y)' : 'To (Y)'}>
            <Input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} aria-label="Second value" />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Answer</h2>
        <div className="mt-3 flex-1">
          {!valid ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Enter both numbers to see the result.</p>
          ) : explanation ? (
            <SuccessNote className="!my-0">
              <p className="text-2xl font-bold tabular-nums">{answer ?? '—'}</p>
              <p className="mt-2 text-sm opacity-90">{explanation}</p>
              {answer ? (
                <span className="mt-3 block">
                  <CopyButton text={answer} label="Copy answer" />
                </span>
              ) : null}
            </SuccessNote>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
