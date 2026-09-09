import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';
import { parsePageRanges } from './Splitter';

export default function PageDeleter() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; kept: number; deleted: number } | null>(null);

  const file = files[0]?.file ?? null;

  async function del() {
    if (!file || !pageCount) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const deleted = parsePageRanges(pagesToDelete, pageCount);
      const keep: number[] = [];
      for (let p = 0; p < pageCount; p++) {
        if (!deleted.includes(p + 1)) keep.push(p);
      }
      if (keep.length === 0) throw new Error('You are deleting every page — there would be nothing left.');
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, keep);
      pages.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      setResult({ blob: uint8ToBlob(outBytes, 'application/pdf'), kept: keep.length, deleted: deleted.length });
      track('tool_completed', 'pdf-page-deleter');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the pages. The file may not be a valid PDF.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['pdf']}
          multiple={false}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResult(null);
            setError(null);
            if (f[0]) {
              f[0].file
                .arrayBuffer()
                .then((bytes) => PDFDocument.load(bytes, { ignoreEncryption: true }))
                .then((d) => setPageCount(d.getPageCount()))
                .catch(() => setPageCount(null));
            } else {
              setPageCount(null);
            }
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="One PDF at a time"
          emptyLabel="Drop a PDF here"
        />

        {pageCount ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            This document has <span className="font-medium text-zinc-800 dark:text-zinc-200">{pageCount} page{pageCount > 1 ? 's' : ''}</span>.
          </p>
        ) : null}

        <div className="mt-5 max-w-md">
          <Field label="Pages to delete" hint='Comma-separated, e.g. "2, 5-8"'>
            <Input
              value={pagesToDelete}
              onChange={(e) => setPagesToDelete(e.target.value)}
              placeholder={pageCount ? `e.g. 1 or ${pageCount}` : '2, 5-8'}
              aria-label="Pages to delete"
            />
          </Field>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={del} disabled={!file || !pageCount || !pagesToDelete.trim() || busy}>
            {busy ? 'Deleting…' : 'Delete pages'}
          </Button>
          {result ? (
            <Button variant="secondary" size="lg" onClick={() => setResult(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Working in your browser…" /> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>
            Deleted {result.deleted} page{result.deleted > 1 ? 's' : ''} — {result.kept} page{result.kept > 1 ? 's' : ''} kept.
          </SuccessNote>
          <div className="mt-4 flex justify-end">
            <DownloadButton blob={result.blob} filename="without-deleted-pages.pdf" />
          </div>
          <div className="mt-3">
            <InfoNote>Tip: to keep only a few pages instead, use the PDF Splitter.</InfoNote>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
