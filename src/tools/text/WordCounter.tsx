import { useMemo, useState } from 'react';
import { Card, Stat } from '../../components/ui/primitives';
import { Textarea } from '../../components/ui/fields';
import { countText } from '../../lib/text';
import { formatNumber } from '../../lib/utils';
import { CopyButton } from '../../components/ui/CopyButton';

export default function WordCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => countText(text), [text]);

  const readingLabel =
    stats.readingSeconds === 0
      ? '—'
      : stats.readingSeconds < 60
        ? `${stats.readingSeconds}s`
        : `${stats.readingMinutes}m ${stats.readingSeconds % 60}s`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <Card className="p-5 sm:p-6">
        <Textarea
          aria-label="Text to count"
          placeholder="Paste or type your text here…"
          className="min-h-[16rem] font-sans text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <CopyButton text={text} label="Copy text" />
        </div>
      </Card>

      <div className="grid grid-cols-2 content-start gap-3">
        <Stat label="Words" value={formatNumber(stats.words, 0)} accent />
        <Stat label="Characters" value={formatNumber(stats.characters, 0)} />
        <Stat label="No spaces" value={formatNumber(stats.charactersNoSpaces, 0)} />
        <Stat label="Sentences" value={formatNumber(stats.sentences, 0)} />
        <Stat label="Paragraphs" value={formatNumber(stats.paragraphs, 0)} />
        <Stat label="Lines" value={formatNumber(stats.lines, 0)} />
        <div className="col-span-2">
          <Stat label="Reading time" value={readingLabel} sub="at 200 words/minute" />
        </div>
      </div>
    </div>
  );
}
