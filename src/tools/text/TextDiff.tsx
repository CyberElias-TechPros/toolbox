import { useMemo, useState } from 'react';
import { Card, Stat } from '../../components/ui/primitives';
import { Textarea } from '../../components/ui/fields';
import { diffWords } from '../../lib/text';
import { formatNumber } from '../../lib/utils';

export default function TextDiff() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const segments = useMemo(() => (a && b ? diffWords(a, b) : []), [a, b]);
  const added = segments.filter((s) => s.type === 'added').reduce((n, s) => n + s.text.split(/\s+/).length, 0);
  const removed = segments.filter((s) => s.type === 'removed').reduce((n, s) => n + s.text.split(/\s+/).length, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold">Original text</h2>
          <Textarea aria-label="Original text" placeholder="Paste the original version…" className="min-h-[12rem] font-sans text-sm" value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold">Revised text</h2>
          <Textarea aria-label="Revised text" placeholder="Paste the new version…" className="min-h-[12rem] font-sans text-sm" value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>

      {a && b ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <Stat label="Words added" value={formatNumber(added, 0)} />
            <Stat label="Words removed" value={formatNumber(removed, 0)} />
          </div>
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Comparison</h2>
            <p className="mt-3 text-sm leading-relaxed">
              {segments.map((s, i) => {
                if (s.type === 'same') return <span key={i}>{s.text} </span>;
                if (s.type === 'added')
                  return (
                    <mark key={i} className="rounded bg-emerald-100 px-1 py-0.5 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200">
                      {s.text}
                    </mark>
                  );
                return (
                  <span key={i} className="rounded bg-rose-100 px-1 py-0.5 text-rose-700 line-through dark:bg-rose-950/60 dark:text-rose-300">
                    {s.text}
                  </span>
                );
              })}
            </p>
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="mr-3 inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-emerald-200 dark:bg-emerald-800" /> added</span>
              <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-rose-200 dark:bg-rose-900" /> removed</span>
            </p>
          </Card>
        </>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill both panes to see a word-by-word comparison.</p>
      )}
    </div>
  );
}
