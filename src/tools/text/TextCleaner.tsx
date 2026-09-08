import { useState } from 'react';
import { Button, Card, InfoNote } from '../../components/ui/primitives';
import { Checkbox, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { countText, cleanText, DEFAULT_CLEANER_OPTIONS, type CleanerOptions } from '../../lib/text';
import { downloadText, formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

const OPTION_LABELS: Array<[keyof CleanerOptions, string]> = [
  ['collapseSpaces', 'Collapse multiple spaces'],
  ['trimLines', 'Trim line starts & ends'],
  ['removeBlankLines', 'Remove blank lines'],
  ['removeDuplicateLines', 'Remove duplicate lines'],
  ['tabsToSpaces', 'Convert tabs → 2 spaces'],
  ['removePunctuation', 'Remove punctuation'],
  ['sortAZ', 'Sort lines A→Z'],
  ['sortZA', 'Sort lines Z→A'],
  ['sortNumeric', 'Sort lines numerically'],
  ['removeNewlines', 'Remove all line breaks'],
];

export default function TextCleaner() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState<CleanerOptions>(DEFAULT_CLEANER_OPTIONS);
  const [output, setOutput] = useState<string | null>(null);

  const inStats = countText(input);
  const outStats = output != null ? countText(output) : null;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Input</h2>
            <Textarea
              aria-label="Messy text to clean"
              placeholder={'HELLO     WORLD\n\n\nThis   is    a   test.'}
              className="min-h-[14rem]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="mt-1.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatNumber(inStats.words, 0)} words · {formatNumber(inStats.lines, 0)} lines
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Cleaning options</h2>
            <div className="grid gap-2">
              {OPTION_LABELS.map(([key, label]) => (
                <Checkbox
                  key={key}
                  label={label}
                  checked={opts[key]}
                  onChange={(v) => setOpts((prev) => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={!input}
            onClick={() => {
              setOutput(cleanText(input, opts));
              track('tool_completed', 'text-cleaner');
            }}
          >
            Clean text
          </Button>
          {output != null ? (
            <Button variant="secondary" size="lg" onClick={() => setOutput(null)}>
              Clear result
            </Button>
          ) : null}
        </div>
      </Card>

      {output != null ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Cleaned text</h2>
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(output, 'cleaned.txt')}>
                ⬇ .txt
              </Button>
            </div>
          </div>
          <Textarea aria-label="Cleaned text result" readOnly className="mt-3 min-h-[10rem] bg-zinc-50 dark:bg-zinc-950" value={output} />
          {outStats ? (
            <p className="mt-1.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatNumber(outStats.words, 0)} words · {formatNumber(outStats.lines, 0)} lines
            </p>
          ) : null}
        </Card>
      ) : (
        <InfoNote>Paste messy text, pick your fixes, and clean it. Your text is processed only in this tab.</InfoNote>
      )}
    </div>
  );
}
