import { useMemo, useState } from 'react';
import { Card, Stat } from '../../components/ui/primitives';
import { Field, Textarea } from '../../components/ui/fields';
import { countText } from '../../lib/text';
import { formatNumber } from '../../lib/utils';

export default function CharacterCounter() {
  const [input, setInput] = useState('');
  const stats = useMemo(() => countText(input), [input]);

  const readTime =
    stats.readingMinutes > 0
      ? `${stats.readingMinutes} min ${stats.readingSeconds % 60} s`
      : `${stats.readingSeconds} seconds`;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Your text" hint="Counts update as you type.">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start typing or paste text here…"
            className="min-h-[14rem] text-sm"
            aria-label="Your text"
          />
        </Field>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Characters" value={formatNumber(stats.characters, 0)} accent />
        <Stat label="No spaces" value={formatNumber(stats.charactersNoSpaces, 0)} />
        <Stat label="Words" value={formatNumber(stats.words, 0)} />
        <Stat label="Sentences" value={formatNumber(stats.sentences, 0)} />
        <Stat label="Paragraphs" value={formatNumber(stats.paragraphs, 0)} />
        <Stat label="Lines" value={formatNumber(stats.lines, 0)} />
        <Stat label="Reading time" value={input.trim() ? readTime : '—'} sub="at 200 wpm" />
      </div>
    </div>
  );
}
