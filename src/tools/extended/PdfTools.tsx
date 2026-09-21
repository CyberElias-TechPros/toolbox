import PdfPreview from '../../components/PdfPreview';
import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Card, Button, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { processPdf, type PdfOptions } from '../../lib/pdf-tools';
import { extractPdfText, validateFiles } from '../../lib/documents';
import { baseName, uint8ToBlob, downloadBlob, formatBytes } from '../../lib/utils';
export default function PdfTools({ spec }: { spec: ExtraSpec }) {
  const [files, setFiles] = useState<DropFile[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<{ blob: Blob; pages?: number; text?: string } | null>(null);
  const [opts, setOpts] = useState<PdfOptions>({
    text: 'DRAFT',
    opacity: 0.25,
    size: 'A4',
    copies: 2,
    start: 1,
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });
  const update = (key: keyof PdfOptions, value: string | number) => {
    setOpts((o) => ({ ...o, [key]: value }));
    setResult(null);
  };
  const run = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      validateFiles(files.map((f) => f.file));
      const data = await files[0].file.arrayBuffer();
      if (spec.slug === 'pdf-to-text') {
        const text = await extractPdfText(data);
        if (!text.trim())
          throw Error('No selectable text found. This may be a scanned PDF; OCR is not included.');
        setResult({ blob: new Blob([text], { type: 'text/plain;charset=utf-8' }), text });
      } else {
        const out = await processPdf(spec.slug, data, opts);
        setResult({ blob: uint8ToBlob(out.bytes, 'application/pdf'), pages: out.pages });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="tool-workspace">
      {spec.note && <InfoNote className="mb-5">{spec.note}</InfoNote>}
      <fieldset disabled={busy}>
        <FileDrop
          accept={['pdf']}
          multiple={false}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResult(null);
          }}
          onRemove={() => {
            setFiles([]);
            setResult(null);
          }}
          hint="PDF · Up to 50 MB · Processed locally"
        />
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {spec.slug === 'pdf-watermark' && (
            <>
              <Field label="Watermark (Latin characters)">
                <Input
                  aria-label="Watermark"
                  maxLength={100}
                  value={opts.text}
                  onChange={(e) => update('text', e.target.value)}
                />
              </Field>
              <Field label={`Opacity: ${Math.round((opts.opacity || 0) * 100)}%`}>
                <input
                  aria-label="Opacity"
                  className="w-full accent-indigo-600"
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={opts.opacity}
                  onChange={(e) => update('opacity', +e.target.value)}
                />
              </Field>
            </>
          )}
          {spec.slug === 'pdf-page-numbers' && (
            <Field label="Start numbering at">
              <Input
                aria-label="Start numbering at"
                type="number"
                min={0}
                value={opts.start}
                onChange={(e) => update('start', +e.target.value)}
              />
            </Field>
          )}
          {spec.slug === 'pdf-duplicate' && (
            <Field label="Number of copies">
              <Input
                aria-label="Number of copies"
                type="number"
                min={1}
                max={10}
                value={opts.copies}
                onChange={(e) => update('copies', +e.target.value)}
              />
            </Field>
          )}
          {spec.slug === 'pdf-resize' && (
            <Field label="Page size">
              <Select
                aria-label="Page size"
                value={opts.size}
                onChange={(e) => update('size', e.target.value)}
              >
                {['A4', 'Letter', 'A3'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          )}
          {spec.slug === 'pdf-metadata-editor' &&
            (['title', 'author', 'subject', 'keywords'] as const).map((key) => (
              <Field
                key={key}
                label={
                  key === 'keywords' ? 'Keywords (comma separated)' : key[0].toUpperCase() + key.slice(1)
                }
              >
                <Input aria-label={key} value={opts[key]} onChange={(e) => update(key, e.target.value)} />
              </Field>
            ))}
        </div>
      </fieldset>
      <div className="workbench-toolbar">
        <Button onClick={run} disabled={!files.length || busy}>
          {busy ? 'Working…' : spec.slug === 'pdf-to-text' ? 'Extract text' : 'Process PDF'}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {result && (
        <div className="result-panel" role="status">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h3 className="flex items-center gap-2">
                <Check size={17} />
                Your document is ready.
              </h3>
              <p className="text-xs text-zinc-500 mt-2">
                {result.pages ? `${result.pages} pages · ` : ''}
                {formatBytes(result.blob.size)}
              </p>
            </div>
            <Button
              onClick={() =>
                downloadBlob(
                  result.blob,
                  `${baseName(files[0].file.name)}-${spec.slug}.${spec.slug === 'pdf-to-text' ? 'txt' : 'pdf'}`,
                )
              }
            >
              <Download size={14} />
              Download result
            </Button>
          </div>
          {result.text && <pre>{result.text}</pre>}
          {!result.text && <PdfPreview blob={result.blob} />}
        </div>
      )}
    </Card>
  );
}
