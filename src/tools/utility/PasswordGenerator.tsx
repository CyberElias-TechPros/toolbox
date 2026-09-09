import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Checkbox, Field, Range } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/',
};
const AMBIGUOUS = new Set('Il1O0oB8S5Z2'.split(''));

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}

function poolFor(o: Options): string {
  let chars = '';
  if (o.lower) chars += SETS.lower;
  if (o.upper) chars += SETS.upper;
  if (o.digits) chars += SETS.digits;
  if (o.symbols) chars += SETS.symbols;
  if (o.noAmbiguous) chars = [...chars].filter((c) => !AMBIGUOUS.has(c)).join('');
  return chars;
}

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export function generatePassword(o: Options): string {
  const pool = poolFor(o);
  if (!pool) return '';
  const out: string[] = [];
  for (let i = 0; i < o.length; i++) out.push(pool[randomInt(pool.length)]);
  return out.join('');
}

function strengthLabel(bits: number): { label: string; tone: string } {
  if (bits >= 100) return { label: 'Excellent', tone: 'text-emerald-600 dark:text-emerald-400' };
  if (bits >= 70) return { label: 'Strong', tone: 'text-emerald-600 dark:text-emerald-400' };
  if (bits >= 45) return { label: 'Good', tone: 'text-amber-600 dark:text-amber-400' };
  if (bits >= 28) return { label: 'Fair', tone: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Weak', tone: 'text-rose-600 dark:text-rose-400' };
}

export default function PasswordGenerator() {
  const [o, setO] = useState<Options>({ length: 20, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false });
  const [passwords, setPasswords] = useState<string[]>([]);

  const pool = poolFor(o);
  const bits = pool ? Math.round(o.length * Math.log2(pool.length)) : 0;
  const strength = strengthLabel(bits);

  const generate = useCallback(
    (n = 4) => {
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        const p = generatePassword(o);
        if (p) out.push(p);
      }
      if (out.length) setPasswords((prev) => [...out, ...prev].slice(0, 8));
    },
    [o],
  );

  useEffect(() => {
    generate(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o]);

  const setOpt = <K extends keyof Options>(k: K, v: Options[K]) => setO((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <Field label={`Length — ${o.length} characters`} hint="16+ is a strong target for important accounts">
          <Range value={o.length} min={8} max={64} onChange={(v) => setOpt('length', v)} label="Password length" />
        </Field>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Checkbox label="Uppercase (A–Z)" checked={o.upper} onChange={(v) => setOpt('upper', v)} />
          <Checkbox label="Lowercase (a–z)" checked={o.lower} onChange={(v) => setOpt('lower', v)} />
          <Checkbox label="Digits (0–9)" checked={o.digits} onChange={(v) => setOpt('digits', v)} />
          <Checkbox label="Symbols (!@#…)" checked={o.symbols} onChange={(v) => setOpt('symbols', v)} />
          <Checkbox label="Avoid ambiguous (l, 1, O, 0…)" checked={o.noAmbiguous} onChange={(v) => setOpt('noAmbiguous', v)} />
        </div>
        {!pool ? (
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            Select at least one character set.
          </p>
        ) : null}
        <div className="mt-5">
          <Button size="lg" onClick={() => generate(4)} disabled={!pool}>
            🔐 Generate passwords
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Generated</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ~{bits} bits entropy · <span className={strength.tone}>{strength.label}</span>
          </p>
        </div>
        {passwords.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">Press “Generate passwords” to start.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {passwords.map((p, i) => (
              <li key={`${p}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <code className="min-w-0 break-all font-mono text-sm">{p}</code>
                <CopyButton text={p} label="Copy" copiedLabel="✓" className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
          Generated locally with your browser’s cryptographic random number generator. Nothing is transmitted or stored — close the tab and they’re gone.
        </p>
      </Card>
    </div>
  );
}
