import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { MIME_TYPES } from '../../lib/httphelp';

export default function MimeLookup() {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return MIME_TYPES;
    return MIME_TYPES.filter((m) => m.ext.includes(needle) || m.name.toLowerCase().includes(needle) || m.type.toLowerCase().includes(needle));
  }, [q]);

  const first = rows[0];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Search" hint="Type an extension (png) or a type (video/).">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. png, json, video" aria-label="Search MIME types" />
        </Field>
        {first ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50/60 p-4 dark:bg-indigo-950/30">
            <span className="font-mono text-lg font-bold text-indigo-700 dark:text-indigo-300">{first.type}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              .{first.ext} — {first.name}
            </span>
            <CopyButton text={first.type} className="ml-auto" />
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No matches.</p>
        )}
      </Card>

      <Card className="divide-y divide-zinc-100 overflow-hidden dark:divide-zinc-800">
        {rows.map((m) => (
          <div key={m.ext} className="flex items-center gap-4 px-5 py-2.5">
            <span className="w-16 shrink-0 font-mono text-sm font-semibold">.{m.ext}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-600 dark:text-zinc-300">{m.type}</span>
            <span className="hidden w-52 shrink-0 truncate text-xs text-zinc-500 sm:block">{m.name}</span>
            <CopyButton text={m.type} label="Copy" className="shrink-0" />
          </div>
        ))}
        {rows.length === 0 ? <p className="p-6 text-sm text-zinc-500">Nothing found.</p> : null}
      </Card>
    </div>
  );
}
