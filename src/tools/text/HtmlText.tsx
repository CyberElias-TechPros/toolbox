import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { Field, Select, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { htmlToText, textToHtml } from '../../lib/htmltext';
import { track } from '../../lib/track';

type Dir = 'html2text' | 'text2html';

export default function HtmlText({ direction }: { direction: Dir }) {
  const toText = direction === 'html2text';
  const [input, setInput] = useState('');
  const [blankLines, setBlankLines] = useState<'paragraph' | 'break'>('paragraph');

  const result = useMemo(() => {
    if (!input.trim()) return { text: '', error: null as string | null };
    try {
      return { text: toText ? htmlToText(input) : textToHtml(input, blankLines), error: null };
    } catch (e) {
      return { text: '', error: (e as Error).message };
    }
  }, [input, toText, blankLines]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Field
          label={toText ? 'Paste HTML' : 'Paste plain text'}
          hint={
            toText
              ? 'Tags are stripped; block elements become line breaks.'
              : 'Blank lines become new paragraphs (or line breaks).'
          }
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={toText ? '<p>Hello <strong>world</strong></p>' : 'Hello world'}
            className="min-h-[10rem] font-mono text-sm"
            aria-label={toText ? 'HTML input' : 'Text input'}
          />
        </Field>
        {!toText ? (
          <div className="mt-4 max-w-xs">
            <Field label="Blank lines become">
              <Select value={blankLines} onChange={(e) => setBlankLines(e.target.value as typeof blankLines)} aria-label="Blank lines become">
                <option value="paragraph">New paragraphs (&lt;p&gt;)</option>
                <option value="break">Line breaks (&lt;br/&gt;)</option>
              </Select>
            </Field>
          </div>
        ) : null}
      </Card>

      {result.error ? <ErrorNote>{result.error}</ErrorNote> : null}

      {result.text ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">{toText ? 'Plain text' : 'HTML'}</h2>
            <div className="flex gap-2">
              <CopyButton text={result.text} />
              <button
                type="button"
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  downloadText(result.text, toText ? 'output.txt' : 'output.html', toText ? 'text/plain' : 'text/html');
                  track('download_clicked', 'html-text');
                }}
              >
                ⬇ Download
              </button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
            {result.text}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
