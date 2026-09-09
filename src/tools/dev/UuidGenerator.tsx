import { useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Checkbox, Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

export default function UuidGenerator() {
  const [count, setCount] = useState('10');
  const [upper, setUpper] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const n = Math.max(1, Math.min(100, parseInt(count, 10) || 1));

  function generate() {
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(crypto.randomUUID());
    setIds(out.map((id) => (upper ? id.toUpperCase() : id)));
    track('tool_completed', 'uuid-generator');
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="How many (1–100)">
            <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} aria-label="How many UUIDs" />
          </Field>
          <div className="flex items-end sm:col-span-2">
            <Checkbox label="UPPERCASE" checked={upper} onChange={(v) => {
              setUpper(v);
              if (ids.length) setIds((prev) => prev.map((x) => (v ? x.toUpperCase() : x.toLowerCase())));
            }} />
          </div>
        </div>
        <div className="mt-5">
          <Button size="lg" onClick={generate}>
            🆔 Generate UUIDs
          </Button>
        </div>
      </Card>

      {ids.length > 0 ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{ids.length} UUID{ids.length > 1 ? 's' : ''}</h2>
            <div className="flex gap-2">
              <CopyButton text={ids.join('\n')} label="Copy all" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(ids.join('\n'), 'uuids.txt')}>
                ⬇ .txt
              </Button>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {ids.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-2.5 font-mono text-[13px] dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                <span className="break-all">{id}</span>
                <CopyButton text={id} label="Copy" copiedLabel="✓" className="shrink-0" />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
