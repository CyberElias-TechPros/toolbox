import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { convertCase, type CaseStyle } from '../../lib/text';

const STYLES: Array<{ id: CaseStyle; label: string; sample: string }> = [
  { id: 'upper', label: 'UPPERCASE', sample: 'UPPERCASE' },
  { id: 'lower', label: 'lowercase', sample: 'lowercase' },
  { id: 'title', label: 'Title Case', sample: 'Title Case' },
  { id: 'sentence', label: 'Sentence case', sample: 'Sentence case' },
  { id: 'camel', label: 'camelCase', sample: 'camelCase' },
  { id: 'pascal', label: 'PascalCase', sample: 'PascalCase' },
  { id: 'snake', label: 'snake_case', sample: 'snake_case' },
  { id: 'kebab', label: 'kebab-case', sample: 'kebab-case' },
  { id: 'constant', label: 'CONSTANT_CASE', sample: 'CONSTANT_CASE' },
];

export default function CaseConverter() {
  const [text, setText] = useState('');
  const converted = useMemo(() => STYLES.map((s) => ({ ...s, value: convertCase(text, s.id) })), [text]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Textarea
          aria-label="Text to convert"
          placeholder="Paste your text here, e.g. the quick brown fox jumps over the lazy dog"
          className="font-sans text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Card>

      {text.trim() ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {converted.map((s) => (
            <Card key={s.id} className="flex flex-col p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{s.label}</h3>
                <CopyButton text={s.value} label="Copy" copiedLabel="✓" />
              </div>
              <p className="mt-2 break-words text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{s.value || '—'}</p>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">All nine styles will appear here as you type.</p>
      )}
    </div>
  );
}
