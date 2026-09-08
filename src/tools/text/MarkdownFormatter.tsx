import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { mdToHtml } from '../../lib/markdown';
import { track } from '../../lib/track';

const PREVIEW_CSS = `
  .md-preview { font-size: 14px; line-height: 1.65; }
  .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4, .md-preview h5, .md-preview h6 { font-weight: 700; margin: 1em 0 .5em; }
  .md-preview h1 { font-size: 1.6em; } .md-preview h2 { font-size: 1.35em; } .md-preview h3 { font-size: 1.15em; }
  .md-preview p { margin: .6em 0; }
  .md-preview ul { list-style: disc; padding-left: 1.4em; margin: .6em 0; }
  .md-preview ol { list-style: decimal; padding-left: 1.4em; margin: .6em 0; }
  .md-preview li { margin: .25em 0; }
  .md-preview code { background: rgba(120,120,128,.15); border-radius: 6px; padding: .1em .35em; font-family: ui-monospace, monospace; font-size: .9em; }
  .md-preview pre { background: rgba(120,120,128,.12); border-radius: 10px; padding: 12px; overflow: auto; }
  .md-preview pre code { background: none; padding: 0; }
  .md-preview blockquote { border-left: 3px solid #6366f1; margin: .8em 0; padding: .2em 1em; opacity: .85; }
  .md-preview a { color: #4f46e5; text-decoration: underline; }
  .md-preview hr { border: none; border-top: 1px solid rgba(120,120,128,.3); margin: 1.2em 0; }
`;

export default function MarkdownFormatter() {
  const [input, setInput] = useState(
    '# My document\n\nSome **bold** and *italic* text, plus `code` and a [link](https://example.com).\n\n- first item\n- second item\n\n1. one\n2. two\n\n> A wise quote.',
  );

  const html = useMemo(() => (input.trim() ? mdToHtml(input) : ''), [input]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Field label="Markdown">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[22rem] font-mono text-sm"
              aria-label="Markdown input"
            />
          </Field>
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Preview / HTML</h2>
            <div className="flex gap-2">
              <CopyButton text={html} label="Copy HTML" />
              <button
                type="button"
                className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  downloadText(html, 'document.html', 'text/html');
                  track('download_clicked', 'markdown-formatter');
                }}
              >
                ⬇ HTML
              </button>
            </div>
          </div>
          <style>{PREVIEW_CSS}</style>
          <div
            className="md-preview max-h-[26rem] overflow-auto rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950"
            dangerouslySetInnerHTML={{ __html: html || '<p class="opacity-50">Preview appears here…</p>' }}
          />
        </Card>
      </div>
    </div>
  );
}
