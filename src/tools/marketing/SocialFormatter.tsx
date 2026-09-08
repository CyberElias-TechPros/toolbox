import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { STYLES } from '../../lib/unicode';

export default function SocialFormatter() {
  const [text, setText] = useState('Welcome to ToolBox');
  const styles = useMemo(() => STYLES.map((s) => ({ ...s, value: s.sample(text) })), [text]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="social-text">
          Your text
        </label>
        <Textarea
          id="social-text"
          aria-label="Text to stylize"
          className="min-h-[6rem] font-sans text-base"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Letters and numbers get the fancy Unicode style. Punctuation stays normal. Best for bios, posts and captions.
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {styles.map((s) => (
          <Card key={s.id} className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{s.label}</h3>
              <CopyButton text={s.value} label="Copy" copiedLabel="✓" />
            </div>
            <p className="mt-2 break-words text-lg leading-relaxed">{s.value || '—'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
