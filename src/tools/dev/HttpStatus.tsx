import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { HTTP_STATUS } from '../../lib/httphelp';

const classOf = (code: number): 'info' | 'success' | 'redir' | 'client' | 'server' => {
  const c = Math.floor(code / 100);
  if (c === 1) return 'info';
  if (c === 2) return 'success';
  if (c === 3) return 'redir';
  if (c === 4) return 'client';
  return 'server';
};

const CLASS_STYLE: Record<string, string> = {
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  redir: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  client: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  server: 'bg-rose-100 text-rose-700 dark:bg-rose-950 text-rose-300 dark:text-rose-300',
};

export default function HttpStatus() {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return HTTP_STATUS;
    return HTTP_STATUS.filter(
      (s) =>
        String(s.code).includes(needle) ||
        s.name.toLowerCase().includes(needle) ||
        s.meaning.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Search" hint="Filter by code, name or description — e.g. “429” or “rate”.">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search codes…" aria-label="Search status codes" />
        </Field>
      </Card>

      <Card className="divide-y divide-zinc-100 overflow-hidden dark:divide-zinc-800">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No codes match “{q}”.</p>
        ) : (
          rows.map((s) => (
            <div key={s.code} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-start sm:gap-4">
              <span className={`w-24 shrink-0 rounded-lg px-2.5 py-1 text-center font-mono text-sm font-bold ${CLASS_STYLE[classOf(s.code)]}`}>
                {s.code}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{s.meaning}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{s.hint}</p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
