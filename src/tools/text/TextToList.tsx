import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field, Select, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { textToList } from '../../lib/textops';
import { track } from '../../lib/track';

export default function TextToList() {
  const [input, setInput] = useState('');
  const [splitBy, setSplitBy] = useState<'line' | 'comma' | 'semicolon'>('comma');
  const [marker, setMarker] = useState<'bullet' | 'dash' | 'numbered'>('bullet');

  const output = useMemo(
    () => (input ? textToList(input, { marker, splitBy }) : ''),
    [input, marker, splitBy],
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field
          label="Your text"
          hint={
            splitBy === 'line' ? 'One item per line.' : splitBy === 'comma' ? 'Items separated by commas.' : 'Items separated by semicolons.'
          }
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'milk, eggs, bread'}
            className="min-h-[8rem] text-sm"
            aria-label="Your text"
          />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Split items by">
            <Select value={splitBy} onChange={(e) => setSplitBy(e.target.value as typeof splitBy)} aria-label="Split by">
              <option value="comma">Commas (,)</option>
              <option value="semicolon">Semicolons (;)</option>
              <option value="line">New lines</option>
            </Select>
          </Field>
          <Field label="List style">
            <Select value={marker} onChange={(e) => setMarker(e.target.value as typeof marker)} aria-label="List style">
              <option value="bullet">Bulleted (•)</option>
              <option value="dash">Dashed (-)</option>
              <option value="numbered">Numbered (1. 2. 3.)</option>
            </Select>
          </Field>
        </div>
      </Card>

      {output ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              List <span className="text-zinc-400">({output.split('\n').length} items)</span>
            </h2>
            <CopyButton
              text={output}
              onClick={() => track('copy_clicked', 'text-to-list')}
            />
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
            {output}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
