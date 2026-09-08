import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner } from '../../components/ui/primitives';
import { baseName, uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

interface PageRow {
  index: number;
  width: number;
  height: number;
}

export default function PageOrganizer() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [pages, setPages] = useState<PageRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const load = async (file: File) => {
    setError(null);
    setResult(null);
    setPages(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      const rows = doc.getPages().map((p, i) => {
        const { width, height } = p.getSize();
        return { index: i, width, height, };
      });
      setPages(rows);
    } catch (e) {
      setError(`Could not open this PDF: ${(e as Error).message}`);
    }
  };

  const onFiles = (next: DropFile[]) => {
    setFiles(next);
    if (next[0]?.file) void load(next[0].file);
  };

  const move = (i: number, delta: -1 | 1) => {
    setPages((prev) => {
      if (!prev) return prev;
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const remove = (i: number) => {
    setPages((prev) => (prev && prev.length > 1 ? prev.filter((_, k) => k !== i) : prev));
  };

  const resetOrder = () => {
    setPages((prev) => (prev ? [...prev].sort((a, b) => a.index - b.index) : prev));
  };

  const changed = (pages ?? []).some((p, i) => p.index !== i);

  const save = async () => {
    const file = files[0]?.file;
    if (!file || !pages || pages.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.index));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      setResult({ blob: uint8ToBlob(bytes, 'application/pdf'), name: `${baseName(file.name)}-reordered.pdf` });
      track('tool_completed', 'pdf-page-organizer');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop accept={['application/pdf']} multiple={false} files={files} onFiles={onFiles} emptyLabel="Drop a PDF" emptySub="or click to browse" />
      </Card>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {pages ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {pages.length} pages — drag the order with the arrows
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetOrder} disabled={!changed}>
                ↺ Reset order
              </Button>
              <Button onClick={save} disabled={busy || !changed}>
                {busy ? <Spinner label="Saving…" /> : '💾 Save reordered PDF'}
              </Button>
            </div>
          </div>
          {!changed ? <InfoNote>Move a page (or remove one) to enable saving.</InfoNote> : null}
          <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {pages.map((p, i) => (
              <li key={p.index} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-10 shrink-0 font-mono text-xs text-zinc-400">#{i + 1}</span>
                <span className="flex-1 text-sm">
                  Page {p.index + 1}
                  <span className="ml-2 text-xs text-zinc-500">
                    {Math.round(p.width)}×{Math.round(p.height)} pt
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  ▲
                </Button>
                <Button variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === pages.length - 1} aria-label="Move down">
                  ▼
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(i)} disabled={pages.length === 1} aria-label="Remove page">
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {result ? (
        <Card className="flex items-center justify-between p-5">
          <h2 className="text-sm font-semibold">{result.name}</h2>
          <DownloadButton blob={result.blob} filename={result.name} />
        </Card>
      ) : null}
    </div>
  );
}
