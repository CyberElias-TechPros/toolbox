import { useMemo, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Checkbox, Field, Select, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { sortLines } from '../../lib/textops';
import { track } from '../../lib/track';

export default function SortLines() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [unique, setUnique] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [numeric, setNumeric] = useState(false);

  const output = useMemo(
    () => (input ? sortLines(input, { direction, unique, caseSensitive, numeric }) : ''),
    [input, direction, unique, caseSensitive, numeric],
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Lines to sort (one per line)" hint="Numbers are sorted by value when “numeric” is on.">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'banana\napple\ncherry'}
            className="min-h-[10rem] font-mono text-sm"
            aria-label="Lines to sort"
          />
        </Field>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="Direction">
            <Select value={direction} onChange={(e) => setDirection(e.target.value as 'asc' | 'desc')} aria-label="Direction">
              <option value="asc">A → Z (ascending)</option>
              <option value="desc">Z → A (descending)</option>
            </Select>
          </Field>
          <Checkbox label="Remove duplicates" checked={unique} onChange={setUnique} />
          <Checkbox label="Case sensitive" checked={caseSensitive} onChange={setCaseSensitive} />
          <Checkbox label="Numeric order" checked={numeric} onChange={setNumeric} />
        </div>
      </Card>

      {output ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              Result <span className="text-zinc-400">({output.split('\n').length} lines)</span>
            </h2>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  downloadText(output, 'sorted-lines.txt');
                  track('download_clicked', 'sort-lines');
                }}
              >
                ⬇ Download
              </Button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
            {output}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
