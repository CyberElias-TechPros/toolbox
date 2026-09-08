import { useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, Spinner } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { baseName, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

GlobalWorkerOptions.workerSrc = workerUrl;

interface PageImage {
  pageNo: number;
  url: string;
  blob: Blob;
}

export default function PdfToImage() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [images, setImages] = useState<PageImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = (next: DropFile[]) => {
    setFiles(next);
    setImages([]);
    setError(null);
  };

  const convert = async () => {
    const file = files[0]?.file;
    if (!file) return;
    setBusy(true);
    setError(null);
    setImages([]);
    try {
      const bytes = await file.arrayBuffer();
      const loadingTask = getDocument({ data: new Uint8Array(bytes) });
      const doc = await loadingTask.promise;
      const out: PageImage[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D is not available.');
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
        await renderTask.promise;
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('Image encoding failed.'))), format, 0.92),
        );
        out.push({ pageNo: i, url: URL.createObjectURL(blob), blob });
        setImages([...out]);
      }
      await loadingTask.destroy();
      track('tool_completed', 'pdf-to-image');
    } catch (e) {
      setError(`Could not render this PDF: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => {
    const stem = files[0] ? baseName(files[0].file.name) : 'page';
    const ext = format === 'image/png' ? 'png' : 'jpg';
    images.forEach(({ pageNo, blob }) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${stem}-page-${pageNo}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    track('download_clicked', 'pdf-to-image-all');
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop accept={['application/pdf']} multiple={false} files={files} onFiles={onFiles} emptyLabel="Drop a PDF" emptySub="or click to browse" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={`Resolution: ${scale}×`} hint="2× ≈ 144 DPI, good for most uses.">
            <input type="range" min={1} max={4} step={0.5} value={scale} onChange={(e) => setScale(Number(e.target.value))} aria-label="Resolution scale" className="mt-3 w-full accent-indigo-600" />
          </Field>
          <Field label="Format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} aria-label="Image format">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG (smaller)</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={convert} disabled={!files.length || busy} size="lg" className="w-full">
              {busy ? <Spinner label="Rendering…" /> : '🖼 Convert to images'}
            </Button>
          </div>
        </div>
      </Card>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {images.length > 0 ? (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {images.length} page{images.length === 1 ? '' : 's'} rendered
              {busy ? ' (still going…)' : ''}
            </p>
            <Button variant="secondary" size="sm" onClick={downloadAll} disabled={busy}>
              ⬇ Download all
            </Button>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <Card key={img.pageNo} className="overflow-hidden">
                <img src={img.url} alt={`Page ${img.pageNo}`} className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800" />
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium">Page {img.pageNo}</span>
                  <span className="mr-2 text-xs text-zinc-500">{formatBytes(img.blob.size)}</span>
                  <DownloadButton blob={img.blob} filename={baseName(files[0]?.file.name ?? 'page') + `-page-${img.pageNo}.${format === 'image/png' ? 'png' : 'jpg'}`} />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
