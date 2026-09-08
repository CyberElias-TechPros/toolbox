import { useState } from 'react';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { Field, Range, Select } from '../../components/ui/fields';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, formatBytes, formatPercent, uid } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

interface Result {
  id: string;
  name: string;
  thumbUrl: string;
  originalSize: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

const FORMATS = [
  { id: 'webp', label: 'WebP (smallest, lossy)', mime: 'image/webp', ext: 'webp' },
  { id: 'jpeg', label: 'JPEG (max compatibility)', mime: 'image/jpeg', ext: 'jpg' },
  { id: 'png', label: 'PNG (lossless)', mime: 'image/png', ext: 'png' },
];

export default function Compressor() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [formatId, setFormatId] = useState('webp');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const format = FORMATS.find((f) => f.id === formatId)!;

  async function process() {
    setBusy(true);
    setError(null);
    const out: Result[] = [];
    try {
      for (const df of files) {
        const image = await loadImageFile(df.file);
        const canvas = drawToCanvas(image.bitmap, image.width, image.height);
        const blob = await canvasToBlob(canvas, format.mime, format.mime === 'image/png' ? undefined : quality / 100);
        const thumbUrl = URL.createObjectURL(blob);
        out.push({
          id: uid(),
          name: `${baseName(df.file.name)}-compressed.${format.ext}`,
          thumbUrl,
          originalSize: df.file.size,
          blob,
          url: thumbUrl,
          width: image.width,
          height: image.height,
        });
      }
      setResults(out);
      track('tool_completed', 'image-compressor');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong while processing the image. Try another file.');
    } finally {
      setBusy(false);
    }
  }

  const totalOriginal = results?.reduce((s, r) => s + r.originalSize, 0) ?? 0;
  const totalNew = results?.reduce((s, r) => s + r.blob.size, 0) ?? 0;
  const saved = totalOriginal > 0 ? ((totalOriginal - totalNew) / totalOriginal) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResults(null);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="JPG, PNG, WebP, GIF or BMP — processed locally, never uploaded"
          emptyLabel="Drop images here"
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label={`Quality — ${quality}%`} hint={format.mime === 'image/png' ? 'PNG is lossless; quality does not apply.' : 'Lower = smaller file, less detail.'}>
            <Range value={quality} min={10} max={100} step={5} onChange={setQuality} label="Quality" />
            <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
              <span>10%</span>
              <span>100%</span>
            </div>
          </Field>
          <Field label="Output format">
            <Select value={formatId} onChange={(e) => setFormatId(e.target.value)} aria-label="Output format">
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={process} disabled={files.length === 0 || busy}>
            {busy ? 'Compressing…' : `Compress ${files.length > 0 ? `${files.length} image${files.length > 1 ? 's' : ''}` : 'images'}`}
          </Button>
          {results ? (
            <Button variant="secondary" size="lg" onClick={() => setResults(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Compressing in your browser…" /> : null}

      {results && !busy ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              Results — {formatBytes(totalOriginal)} → {formatBytes(totalNew)}
            </h2>
            {saved >= 0 ? (
              <SuccessNote className="!my-0">
                {saved >= 0.5 ? `Saved ${formatPercent(saved)} overall` : 'Output is similar in size — try a lower quality or WebP.'}
              </SuccessNote>
            ) : null}
          </div>

          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((r) => {
              const pct = ((r.blob.size - r.originalSize) / r.originalSize) * 100;
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                  <img
                    src={r.thumbUrl}
                    alt={`Compressed preview of ${r.name}`}
                    className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {r.width}×{r.height}px · {formatBytes(r.originalSize)} → <span className="font-medium">{formatBytes(r.blob.size)}</span>{' '}
                      <span className={pct <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        ({pct >= 0 ? '+' : ''}
                        {formatPercent(pct)})
                      </span>
                    </p>
                  </div>
                  <DownloadButton blob={r.blob} filename={r.name} />
                </li>
              );
            })}
          </ul>

          {results.some((r) => r.blob.size > r.originalSize) ? (
            <InfoNote>
              Some files got bigger — this happens with already-compressed images. Re-download the originals for those, or pick WebP at a lower quality.
            </InfoNote>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
