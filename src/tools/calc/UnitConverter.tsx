import { useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import {
  convertValue,
  LENGTH,
  SPEED,
  temperatureC,
  temperatureFromC,
  TIME,
  WEIGHT,
  type Unit,
} from '../../lib/units';
import { formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

type Cat = 'length' | 'weight' | 'temperature' | 'time' | 'speed';

const CATALOG: Record<Exclude<Cat, 'temperature'>, Unit[]> = {
  length: LENGTH,
  weight: WEIGHT,
  time: TIME,
  speed: SPEED,
};

const TEMP_UNITS = [
  { id: 'c', label: 'Celsius (°C)' },
  { id: 'f', label: 'Fahrenheit (°F)' },
  { id: 'k', label: 'Kelvin (K)' },
];

function trimNum(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) return n.toExponential(4);
  return formatNumber(n, 4);
}

export default function UnitConverter() {
  const [cat, setCat] = useState<Cat>('length');
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');

  const n = parseFloat(value);
  const valid = Number.isFinite(n);

  function convert(f: string, t: string, v: number): number {
    if (cat === 'temperature') return temperatureFromC(temperatureC(f as 'c' | 'f' | 'k', v), t as 'c' | 'f' | 'k');
    return convertValue(CATALOG[cat], f, t, v);
  }

  const units = cat === 'temperature' ? TEMP_UNITS : CATALOG[cat];
  const result = valid ? convert(from, to, n) : null;

  const pickCat = (c: Cat) => {
    setCat(c);
    const first = (c === 'temperature' ? TEMP_UNITS : CATALOG[c]).slice(0, 2);
    setFrom(first[0].id);
    setTo(first[1].id);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result != null && Number.isFinite(result)) setValue(String(trimNum(result)));
    track('tool_completed', 'unit-converter');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {(['length', 'weight', 'temperature', 'time', 'speed'] as Cat[]).map((c) => (
          <button
            key={c}
            onClick={() => pickCat(c)}
            aria-pressed={cat === c}
            className={
              cat === c
                ? 'rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium capitalize text-white'
                : 'rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium capitalize text-zinc-600 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
            }
          >
            {c}
          </button>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr_1fr]">
          <Field label="Value">
            <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value" className="font-mono" />
          </Field>
          <Field label="From">
            <Select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From unit">
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-center pb-1">
            <Button variant="secondary" size="sm" onClick={swap} aria-label="Swap units">
              ⇄ Swap
            </Button>
          </div>
          <Field label="To">
            <Select value={to} onChange={(e) => setTo(e.target.value)} aria-label="To unit">
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
          <p className="text-sm text-indigo-100">
            {formatNumber(n, 6)} {units.find((u) => u.id === from)?.label} =
          </p>
          <p className="mt-1 break-all text-3xl font-bold tabular-nums">{result != null ? trimNum(result) : '—'}</p>
          <p className="mt-1 text-sm text-indigo-100">{units.find((u) => u.id === to)?.label}</p>
          {result != null ? (
            <span className="mt-3 inline-block">
              <CopyButton text={trimNum(result)} label="Copy result" variant="primary" className="!bg-white/15 !text-white hover:!bg-white/25" />
            </span>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold">All units at a glance</h2>
        {valid ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {units
              .filter((u) => u.id !== from)
              .map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                  <span className="text-zinc-500 dark:text-zinc-400">{u.label}</span>
                  <span className="font-mono tabular-nums">{trimNum(convert(from, u.id, n))}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Enter a number to see the full conversion table.</p>
        )}
      </Card>
    </div>
  );
}
