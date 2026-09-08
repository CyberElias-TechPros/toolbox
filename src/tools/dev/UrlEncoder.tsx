import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { Button } from '../../components/ui/primitives';
import { downloadText } from '../../lib/utils';

type Dir = 'encode' | 'decode';
type Scope = 'full' | 'component';

export default function UrlEncoder() {
  const [dir, setDir] = useState<Dir>('encode');
  const [scope, setScope] = useState<Scope>('component');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!input) return '';
    try {
      if (dir === 'encode') return scope === 'full' ? encodeURI(input) : encodeURIComponent(input);
      return scope === 'full' ? decodeURI(input) : decodeURIComponent(input);
    } catch {
      setError('Could not decode — the input contains an invalid percent-escape sequence (e.g. “%GG”).');
      return null;
    }
  }, [input, dir, scope]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            items={[
              { id: 'encode', label: 'Encode' },
              { id: 'decode', label: 'Decode' },
            ]}
            value={dir}
            onChange={(v) => {
              setDir(v as Dir);
              setError(null);
            }}
          />
          <div className="ml-auto flex items-center gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <input
                type="radio"
                name="scope"
                className="accent-indigo-600"
                checked={scope === 'component'}
                onChange={() => setScope('component')}
              />
              Component
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <input
                type="radio"
                name="scope"
                className="accent-indigo-600"
                checked={scope === 'full'}
                onChange={() => setScope('full')}
              />
              Full URL
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Input</h2>
            <Textarea
              aria-label="URL input"
              placeholder={scope === 'full' ? 'https://example.com/search?q=hello world' : 'hello world & friends'}
              className="min-h-[8rem]"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
            />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Result</h2>
            <Textarea aria-label="Result" readOnly className="min-h-[8rem] bg-zinc-50 dark:bg-zinc-950" value={output ?? ''} />
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        {output ? (
          <div className="mt-4 flex gap-2">
            <CopyButton text={output} label="Copy result" size="md" />
            <Button variant="secondary" size="md" onClick={() => downloadText(output, 'url.txt')}>
              ⬇ .txt
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
