import { useState } from 'react';
import { PageSizes, PDFDocument, type PDFImage } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { formatBytes, uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

type PageSize = 'fit' | 'a4' | 'letter';

/** Convert any decodable image to PNG bytes (needed for WebP → PDF). */
async function toPngBytes(file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), 'image/png'),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { bytes, width: bitmap.width, height: bitmap.height };
}

export default function ImagesToPdf() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('fit');
  const [margin, setMargin] = useState(24);
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

  async function build() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const doc = await PDFDocument.create();
      for (const df of files) {
        let image: PDFImage;
        let width: number;
        let height: number;

        const ext = df.file.name.split('.').pop()?.toLowerCase() ?? '';
        if (ext === 'png') {
          const bytes = new Uint8Array(await df.file.arrayBuffer());
          image = await doc.embedPng(bytes);
          width = image.width;
          height = image.height;
        } else if (ext === 'jpg' || ext === 'jpeg') {
          const bytes = new Uint8Array(await df.file.arrayBuffer());
          image = await doc.embedJpg(bytes);
          width = image.width;
          height = image.height;
        } else {
          const png = await toPngBytes(df.file);
          image = await doc.embedPng(png.bytes);
          width = png.width;
          height = png.height;
        }

        const [stdW, stdH] = pageSize === 'a4' ? PageSizes.A4 : PageSizes.Letter;
        const pageW = pageSize === 'fit' ? width + margin * 2 : stdW;
        const pageH = pageSize === 'fit' ? height + margin * 2 : stdH;
        const scale = pageSize === 'fit' ? 1 : Math.min((pageW - margin * 2) / width, (pageH - margin * 2) / height);
        const drawW = width * scale;
        const drawH = height * scale;

        const page = doc.addPage([pageW, pageH]);
        page.drawImage(image, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }
      const bytes = await doc.save();
      setResult({ blob: uint8ToBlob(bytes, 'application/pdf'), pages: files.length });
      track('tool_completed', 'images-to-pdf');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the PDF. Check that the images are valid.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['jpg', 'jpeg', 'png', 'webp']}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResult(null);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="JPG, PNG or WebP — in page order"
          emptyLabel="Drop images here"
        />

        {files.length > 0 ? (
          <ul className="mt-4 space-y-2">
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

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Page size">
            <Select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)} aria-label="Page size">
              <option value="fit">Fit to image (each page matches its picture)</option>
              <option value="a4">A4</option>
              <option value="letter">Letter (US)</option>
            </Select>
          </Field>
          <Field label={`Margin — ${margin}px`} hint="Applied around images on fixed page sizes">
            <input
              type="range"
              min={0}
              max={96}
              step={8}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
              aria-label="Margin"
            />
          </Field>
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={build} disabled={files.length === 0 || busy}>
            {busy ? 'Creating PDF…' : 'Create PDF'}
          </Button>
          {result ? (
            <Button variant="secondary" size="lg" onClick={() => setResult(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Building your PDF in the browser…" /> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>
            Created a PDF with {result.pages} page{result.pages > 1 ? 's' : ''}.
          </SuccessNote>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <InfoNote className="!my-0">Open it, check the order, then save it.</InfoNote>
            <DownloadButton blob={result.blob} filename="images.pdf" />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
