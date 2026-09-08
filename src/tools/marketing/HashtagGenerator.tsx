import { useState } from 'react';
import { Button, Card, InfoNote } from '../../components/ui/primitives';
import { Field, Input, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { extractHashtags } from '../../lib/hashtag';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

export default function HashtagGenerator() {
  const [text, setText] = useState(
    'We are launching our new web design and branding studio in Lagos. Fast websites, modern design, affordable prices for small businesses and startups.',
  );
  const [limit, setLimit] = useState('10');
  const [tags, setTags] = useState<string[] | null>(null);

  const n = Math.max(1, Math.min(30, parseInt(limit, 10) || 10));

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field label="Your content, bio or product description">
          <Textarea
            aria-label="Source text"
            className="min-h-[10rem] font-sans text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="How many (1–30)" className="w-36">
            <Input type="number" min={1} max={30} value={limit} onChange={(e) => setLimit(e.target.value)} aria-label="How many hashtags" />
          </Field>
          <Button size="lg" onClick={() => {
            setTags(extractHashtags(text, n));
            track('tool_completed', 'hashtag-generator');
          }} disabled={!text.trim()}>
            # Generate hashtags
          </Button>
        </div>
      </Card>

      {tags ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{tags.length} hashtags</h2>
            <div className="flex gap-2">
              <CopyButton text={tags.join(' ')} label="Copy all" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(tags.join('\n'), 'hashtags.txt')}>
                ⬇ .txt
              </Button>
            </div>
          </div>
          {tags.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Not enough meaningful words found — try a longer description with more specific words.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-indigo-50 px-3.5 py-1.5 font-mono text-sm text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5">
            <InfoNote>
              Tip: mix your generated tags with 1–2 very specific niche tags for better discoverability — and keep the total under ~30 on most platforms.
            </InfoNote>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
