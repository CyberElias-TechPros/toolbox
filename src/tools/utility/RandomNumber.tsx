import { useState } from 'react';
import { Button, Card, ErrorNote } from '../../components/ui/primitives';
import { Checkbox, Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { generateNumbers } from '../../lib/random';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

export default function RandomNumber() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(true);
  const [decimals, setDecimals] = useState('0');
  const [values, setValues] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    const res = generateNumbers({
      min: parseFloat(min),
      max: parseFloat(max),
      count: parseInt(count, 10),
      unique,
      decimals: parseInt(decimals, 10),
    });
    if (!res.ok) {
      setError(res.error);
      setValues(null);
      return;
    }
    setError(null);
    setValues(res.values);
    track('tool_completed', 'random-number-generator');
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Min">
            <Input type="number" step="any" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum" className="font-mono" />
          </Field>
          <Field label="Max">
            <Input type="number" step="any" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum" className="font-mono" />
          </Field>
          <Field label="How many (1–1000)">
            <Input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(e.target.value)} aria-label="Count" className="font-mono" />
          </Field>
          <Field label="Decimal places">
            <Input type="number" min={0} max={6} value={decimals} onChange={(e) => setDecimals(e.target.value)} aria-label="Decimal places" className="font-mono" />
          </Field>
        </div>
        <div className="mt-4">
          <Checkbox label="Unique values only" checked={unique} onChange={setUnique} />
        </div>
        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
        <div className="mt-5">
          <Button size="lg" onClick={generate}>
            🎲 Generate numbers
          </Button>
        </div>
      </Card>

      {values ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{values.length} number{values.length > 1 ? 's' : ''}</h2>
            <div className="flex gap-2">
              <CopyButton text={values.join(', ')} label="Copy all" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(values.join('\n'), 'random-numbers.txt')}>
                ⬇ .txt
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {values.map((v, i) => (
              <span
                key={i}
                className="rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2 font-mono text-sm tabular-nums dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                {v}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
