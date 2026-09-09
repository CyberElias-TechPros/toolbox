import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field } from '../../components/ui/fields';
import { contrastRatio } from '../../lib/color';

function Verdict({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={
        pass
          ? 'inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
          : 'inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      }
    >
      {pass ? '✓' : '✕'} {label}
    </span>
  );
}

export default function ContrastChecker() {
  const [fg, setFg] = useState('#18181b');
  const [bg, setBg] = useState('#ffffff');

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);

  const checks =
    ratio == null
      ? null
      : {
          aaNormal: ratio >= 4.5,
          aaLarge: ratio >= 3,
          aaaNormal: ratio >= 7,
          aaaLarge: ratio >= 4.5,
        };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Text color">
            <div className="flex gap-2">
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                aria-label="Text color"
                className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                aria-label="Text color hex"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </Field>
          <Field label="Background color">
            <div className="flex gap-2">
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                aria-label="Background color"
                className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                aria-label="Background color hex"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </Field>
        </div>
        <button
          onClick={() => {
            setFg(bg);
            setBg(fg);
          }}
          className="mt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ⇄ Swap colors
        </button>
      </Card>

      <Card className="p-6 text-center sm:p-10">
        <div
          className="mx-auto max-w-lg rounded-2xl border border-zinc-200 p-8 dark:border-zinc-700"
          style={{ backgroundColor: bg, color: fg }}
        >
          <p className="text-3xl font-bold">The quick brown fox</p>
          <p className="mt-2 text-base leading-relaxed">
            Aa — sample paragraph at normal size. WCAG AA requires a contrast ratio of at least 4.5:1.
          </p>
        </div>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Contrast ratio: <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-50">{ratio?.toFixed(2) ?? '—'}:1</span>
        </p>
      </Card>

      {checks ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">WCAG 2.1</h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <Verdict pass={checks.aaNormal} label="AA — Normal text (4.5:1)" />
            <Verdict pass={checks.aaLarge} label="AA — Large text (3:1)" />
            <Verdict pass={checks.aaaNormal} label="AAA — Normal text (7:1)" />
            <Verdict pass={checks.aaaLarge} label="AAA — Large text (4.5:1)" />
          </div>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            “Large text” means ≥ 18pt (24px), or ≥ 14pt (≈18.66px) bold.
          </p>
        </Card>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Enter valid HEX colors (e.g. #ffffff) to check contrast.</p>
      )}
    </div>
  );
}
