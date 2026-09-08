import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Field, Input, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { jsonToTypes } from '../../lib/tsinfer';

export default function JsonToTypeScript() {
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "Sample",\n  "active": true,\n  "tags": ["a", "b"]\n}');
  const [rootName, setRootName] = useState('Sample');

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, code: '' };
    return jsonToTypes(input, /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(rootName.trim()) ? rootName.trim() : 'Root');
  }, [input, rootName]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Field label="JSON" hint="Paste any JSON object, array, or primitive.">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[16rem] font-mono text-sm"
              aria-label="JSON input"
            />
          </Field>
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Field label="Interface name" className="w-40">
              <Input value={rootName} onChange={(e) => setRootName(e.target.value)} aria-label="Interface name" />
            </Field>
            <CopyButton text={result.ok ? result.code : ''} label="Copy TypeScript" className="mb-7" />
          </div>
          {result.ok ? (
            result.code ? (
              <pre className="max-h-[20rem] overflow-auto rounded-xl bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
                {result.code}
              </pre>
            ) : (
              <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-400 dark:bg-zinc-950">Types appear here as you paste JSON.</p>
            )
          ) : (
            <ErrorNote>{result.error}</ErrorNote>
          )}
        </Card>
      </div>
      {result.ok && result.code ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tip: paste the output into a .ts file. Nested objects get their own generated interfaces (Item0, Item1, …).
        </p>
      ) : null}
    </div>
  );
}
