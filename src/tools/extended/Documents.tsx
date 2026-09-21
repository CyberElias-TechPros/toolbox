import PdfPreview from '../../components/PdfPreview';
import { useRef, useState } from 'react';
import { ArrowUp, ArrowDown, X, Download, Check, Sparkles, Play } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Field, Input, Textarea } from '../../components/ui/fields';
import {
  combineDocuments,
  createWord,
  extractPdfText,
  renderTextPdf,
  validateFiles,
} from '../../lib/documents';
import { baseName, downloadBlob, formatBytes } from '../../lib/utils';
export default function Documents({ spec }: { spec: ExtraSpec }) {
  const [files, setFiles] = useState<DropFile[]>([]),
    [text, setText] = useState(''),
    [name, setName] = useState('my-document'),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(0),
    [error, setError] = useState('');
  const [result, setResult] = useState<{
    blob: Blob;
    pages?: number;
    text?: string;
    extension: string;
  } | null>(null);
  const host = useRef<HTMLDivElement>(null),
    isText = ['text-to-word', 'text-to-pdf', 'markdown-to-pdf'].includes(spec.slug),
    multi = ['combine-word-to-pdf', 'documents-to-pdf'].includes(spec.slug);
  const accept =
    spec.slug === 'documents-to-pdf'
      ? ['docx', 'pdf', 'png', 'jpg', 'jpeg', 'webp']
      : spec.slug === 'pdf-to-word'
        ? ['pdf']
        : ['docx'];
  const updateFiles = (next: DropFile[]) => {
    setFiles(next);
    setResult(null);
    setError('');
  };
  const move = (i: number, dir: number) => {
    const next = [...files];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    updateFiles(next);
  };
  const run = async () => {
    setBusy(true);
    setDone(0);
    setError('');
    setResult(null);
    try {
      if (!isText) validateFiles(files.map((f) => f.file));
      else if (!text.trim()) throw Error('Add some text first.');
      if (spec.slug === 'text-to-word') setResult({ blob: await createWord(text), extension: 'docx' });
      else if (spec.slug === 'text-to-pdf' || spec.slug === 'markdown-to-pdf')
        setResult({
          blob: await renderTextPdf(text, host.current!, spec.slug === 'markdown-to-pdf'),
          extension: 'pdf',
        });
      else if (spec.slug === 'word-to-text') {
        const { extractRawText } = await import('mammoth');
        const out = await extractRawText({ arrayBuffer: await files[0].file.arrayBuffer() });
        setResult({
          blob: new Blob([out.value], { type: 'text/plain;charset=utf-8' }),
          text: out.value,
          extension: 'txt',
        });
      } else if (spec.slug === 'pdf-to-word') {
        const out = await extractPdfText(await files[0].file.arrayBuffer());
        if (!out.trim())
          throw Error('No selectable text found. This PDF may be a scan; OCR is not included.');
        setResult({ blob: await createWord(out), text: out, extension: 'docx' });
      } else {
        if (spec.slug === 'combine-word-to-pdf' && files.length < 2)
          throw Error('Add at least two Word documents to combine.');
        const out = await combineDocuments(
          files.map((f) => f.file),
          host.current!,
          setDone,
        );
        setResult({ ...out, extension: 'pdf' });
      }
    } catch (e) {
      setError((e as Error).message || 'Could not process this file. Please check its format.');
    } finally {
      host.current?.replaceChildren();
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <Card className="tool-workspace">
        <div className="flex items-center justify-between mb-5">
          <span className="eyebrow muted">
            {multi ? 'MANY FILES. ONE HAPPY ENDING.' : 'FROM ONE FORMAT TO YOUR NEXT.'}
          </span>
          {isText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setText(
                  spec.slug === 'markdown-to-pdf'
                    ? '# Small tools. Big possibilities.\n\nA little less busywork. A little more **flow**.\n\n## The plan\n- Keep it simple\n- Make it useful\n- Enjoy the process'
                    : 'Small tools. Big possibilities.\n\nA little less busywork. A little more flow.\n\nMade with Toolbox.',
                );
                setResult(null);
              }}
            >
              <Sparkles size={14} />
              Try an example
            </Button>
          )}
        </div>
        {spec.note && <InfoNote className="mb-5">{spec.note}</InfoNote>}
        <fieldset disabled={busy} className="min-w-0">
          {isText ? (
            <Field label={spec.slug === 'markdown-to-pdf' ? 'Markdown content' : 'Your text'}>
              <Textarea
                aria-label="Document content"
                rows={12}
                placeholder="Start with a few words…"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setResult(null);
                }}
              />
            </Field>
          ) : (
            <>
              <FileDrop
                accept={accept}
                files={files}
                onFiles={updateFiles}
                onRemove={(id) => updateFiles(files.filter((f) => f.id !== id))}
                multiple={multi}
                showFileList={!multi}
                emptyLabel={multi ? 'Drop your documents here' : 'Drop your document here'}
                hint={`${accept.map((a) => a.toUpperCase()).join(', ')} · Up to 50 MB total · Never uploaded`}
              />
              {multi && files.length > 0 && (
                <div className="document-order">
                  <p className="text-xs text-zinc-500">Your final document order</p>
                  {files.map((f, i) => (
                    <div key={f.id}>
                      <span className="text-zinc-400">{String(i + 1).padStart(2, '0')}</span>
                      <span>{f.file.name}</span>
                      <button onClick={() => move(i, -1)} disabled={!i} aria-label={`Move ${f.file.name} up`}>
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === files.length - 1}
                        aria-label={`Move ${f.file.name} down`}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        onClick={() => updateFiles(files.filter((x) => x.id !== f.id))}
                        aria-label={`Remove ${f.file.name} from order`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <Field label="Output filename" className="mt-5">
            <Input
              aria-label="Output filename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-document"
            />
          </Field>
        </fieldset>
        <div className="workbench-toolbar">
          <Button
            size="lg"
            onClick={run}
            disabled={
              busy ||
              (isText ? !text.trim() : spec.slug === 'combine-word-to-pdf' ? files.length < 2 : !files.length)
            }
          >
            <Play size={15} />
            {busy
              ? 'Working on your device…'
              : multi
                ? 'Combine & create PDF'
                : spec.slug === 'word-to-text'
                  ? 'Extract text'
                  : spec.slug === 'text-to-word' || spec.slug === 'pdf-to-word'
                    ? 'Create Word document'
                    : 'Create PDF'}
          </Button>
          {files.length > 0 && (
            <Button variant="ghost" disabled={busy} onClick={() => updateFiles([])}>
              Clear files
            </Button>
          )}
        </div>
        {spec.slug === 'combine-word-to-pdf' && files.length === 1 && (
          <p className="text-xs text-zinc-500 mb-3">Add one more Word document to combine your files.</p>
        )}
        {busy && (
          <div role="status">
            <p className="text-xs text-zinc-500">
              {files.length
                ? `Processed ${done} of ${files.length} file${files.length === 1 ? '' : 's'}`
                : 'Rendering your document…'}
            </p>
            <div className="conversion-progress">
              <div style={{ width: `${files.length ? Math.max(5, (done / files.length) * 100) : 30}%` }} />
            </div>
          </div>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
      </Card>
      {result && (
        <div className="result-panel" role="status">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h3 className="flex items-center gap-2">
                <Check size={18} className="text-emerald-600" />
                All done. Ready for your next step.
              </h3>
              <p className="text-xs text-zinc-500 mt-2">
                {result.pages ? `${result.pages} pages · ` : ''}
                {formatBytes(result.blob.size)} · {result.extension.toUpperCase()}
              </p>
            </div>
            <Button
              onClick={() =>
                downloadBlob(
                  result.blob,
                  `${baseName(name.trim() || 'my-document').replace(/[<>:"/\\|?*]/g, '-')}.${result.extension}`,
                )
              }
            >
              <Download size={15} />
              Download {result.extension.toUpperCase()}
            </Button>
          </div>
          {result.text && <pre>{result.text}</pre>}
          {result.extension === 'pdf' && <PdfPreview blob={result.blob} />}
        </div>
      )}
      <div ref={host} className="docx-render-host" aria-hidden="true" />
    </div>
  );
}
