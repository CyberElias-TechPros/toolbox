import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { formatBytes, uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

export default function Merger() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null);

  const move = (i: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  async function merge() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const out = await PDFDocument.create();
      let total = 0;
      for (const df of files) {
        const bytes = await df.file.arrayBuffer();
        let src: PDFDocument;
        try {
          src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        } catch {
          throw new Error(`“${df.file.name}” is not a valid PDF (or is corrupted). Remove it and try again.`);
        }
        const indices = src.getPageIndices();
        total += indices.length;
        const pages = await out.copyPages(src, indices);
        pages.forEach((p) => out.addPage(p));
      }
      const outBytes = await out.save();
      setResult({ blob: uint8ToBlob(outBytes, 'application/pdf'), pages: total });
      track('tool_completed', 'pdf-merger');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merging failed. Check that all files are valid PDFs.');
    } finally {
      setBusy(false);
    }
  }

  const totalPages = files.length;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['pdf']}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResult(null);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="Add 2 or more PDF files"
          emptyLabel="Drop PDF files here"
        />

        {files.length > 0 ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {files.length} file{files.length > 1 ? 's' : ''} · merged in this order
            </p>
            <div className="flex gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                disabled={files.length < 2}
                onClick={() => setFiles((prev) => [...prev].reverse())}
              >
                ⇅ Reverse order
              </Button>
            </div>
          </div>
        ) : null}

        {files.length > 1 ? (
          <ul className="mt-3 space-y-2">
            {files.map((df, i) => (
              <li key={df.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium">{df.file.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{formatBytes(df.file.size)}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" aria-label={`Move ${df.file.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Move ${df.file.name} down`} disabled={i === files.length - 1} onClick={() => move(i, 1)}>
                    ↓
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={merge} disabled={files.length < 2 || busy}>
            {busy ? 'Merging…' : 'Merge PDFs'}
          </Button>
          {result ? (
            <Button variant="secondary" size="lg" onClick={() => setResult(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Merging in your browser…" /> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>
            Merged {totalPages} PDF file{totalPages > 1 ? 's' : ''} into one document ({result.pages} pages).
          </SuccessNote>
          <div className="mt-4 flex justify-end">
            <DownloadButton blob={result.blob} filename="merged.pdf" />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
