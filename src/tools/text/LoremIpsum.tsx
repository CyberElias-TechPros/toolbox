import { useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Checkbox, Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { loremIpsum } from '../../lib/text';
import { track } from '../../lib/track';

type Unit = 'words' | 'sentences' | 'paragraphs';
const UNIT_LABELS: Record<Unit, string> = {
  words: 'words',
  sentences: 'sentences',
  paragraphs: 'paragraphs',
};

export default function LoremIpsum() {
  const [count, setCount] = useState('3');
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [classic, setClassic] = useState(true);
  const [output, setOutput] = useState('');

  const n = Math.max(1, Math.min(500, parseInt(count, 10) || 1));

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Amount">
            <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(e.target.value)} aria-label="Amount" />
          </Field>
          <Field label="Unit">
            <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} aria-label="Unit">
              <option value="words">words</option>
              <option value="sentences">sentences</option>
              <option value="paragraphs">paragraphs</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Checkbox label="Start with “Lorem ipsum…”" checked={classic} onChange={setClassic} />
          </div>
        </div>
        <div className="mt-5">
          <Button
            size="lg"
            onClick={() => {
              setOutput(loremIpsum(n, unit, classic));
              track('tool_completed', 'lorem-ipsum');
            }}
          >
            Generate
          </Button>
        </div>
      </Card>

      {output ? (
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {n} {UNIT_LABELS[unit]}
            </h2>
            <CopyButton text={output} label="Copy" />
          </div>
          <div className="mt-3 max-w-none space-y-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{output}</div>
        </Card>
      ) : null}
    </div>
  );
}
