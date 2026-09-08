import { useState } from 'react';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, cn, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

type Mode = 'pixels' | 'percent';
type OutFormat = 'png' | 'jpeg' | 'webp';

const FORMAT_META: Record<OutFormat, { mime: string; ext: string }> = {
  png: { mime: 'image/png', ext: 'png' },
  jpeg: { mime: 'image/jpeg', ext: 'jpg' },
  webp: { mime: 'image/webp', ext: 'webp' },
};

interface Result {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  originalSize: number;
  width: number;
  height: number;
  origWidth: number;
  origHeight: number;
}

export default function Resizer() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [mode, setMode] = useState<Mode>('pixels');
  const [width, setWidth] = useState('1080');
  const [height, setHeight] = useState('');
  const [lockRatio, setLockRatio] = useState(true);
  const [percent, setPercent] = useState('50');
  const [format, setFormat] = useState<OutFormat>('png');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  async function process() {
    setBusy(true);
    setError(null);
    const out: Result[] = [];
    try {
      for (const df of files) {
        const image = await loadImageFile(df.file);
        let tw: number;
        let th: number;
        if (mode === 'percent') {
          const p = parseFloat(percent);
          if (!Number.isFinite(p) || p <= 0 || p > 2000) throw new Error('Enter a percentage between 1 and 2000.');
          tw = image.width * (p / 100);
          th = image.height * (p / 100);
        } else {
          const w = parseInt(width, 10);
          const h = height ? parseInt(height, 10) : NaN;
          if (!Number.isFinite(w) || w <= 0) throw new Error('Enter a valid width in pixels.');
          tw = w;
          th = Number.isFinite(h) && h > 0 && !lockRatio ? h : (w * image.height) / image.width;
        }
        tw = Math.max(1, Math.min(20000, Math.round(tw)));
        th = Math.max(1, Math.min(20000, Math.round(th)));
        const canvas = drawToCanvas(image.bitmap, tw, th);
        const meta = FORMAT_META[format];
        const blob = await canvasToBlob(canvas, meta.mime, format === 'png' ? undefined : 0.9);
        const url = URL.createObjectURL(blob);
        out.push({
          id: `${df.id}-${out.length}`,
          name: `${baseName(df.file.name)}-${tw}x${th}.${meta.ext}`,
          url,
          blob,
          originalSize: df.file.size,
          width: tw,
          height: th,
          origWidth: image.width,
          origHeight: image.height,
        });
      }
      setResults(out);
      track('tool_completed', 'image-resizer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try another file.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']}
          multiple={false}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResults(null);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="One image at a time"
          emptyLabel="Drop an image here"
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Resize mode" className="lg:col-span-2">
            <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label="Resize mode">
              <option value="pixels">Exact pixels</option>
              <option value="percent">Percentage</option>
            </Select>
          </Field>

          {mode === 'pixels' ? (
            <>
              <Field label="Width (px)">
                <Input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)} aria-label="Width in pixels" />
              </Field>
              <Field label="Height (px)" hint={lockRatio ? 'Locked to aspect ratio' : undefined}>
                <Input
                  type="number"
                  min={1}
                  value={height}
                  disabled={lockRatio}
                  onChange={(e) => setHeight(e.target.value)}
                  aria-label="Height in pixels"
                  className={cn(lockRatio && 'opacity-50')}
                />
              </Field>
              <label className="flex items-end gap-2 pb-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-indigo-600"
                  checked={lockRatio}
                  onChange={(e) => {
                    setLockRatio(e.target.checked);
                    if (e.target.checked) setHeight('');
                  }}
                />
                Lock aspect ratio
              </label>
            </>
          ) : (
            <Field label="Scale" className="lg:col-span-2" hint="100% keeps the original size">
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={2000} value={percent} onChange={(e) => setPercent(e.target.value)} aria-label="Percentage" />
                <span className="text-sm text-zinc-500">%</span>
              </div>
            </Field>
          )}

          <Field label="Output format" className="sm:col-span-2 lg:col-span-1">
            <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)} aria-label="Output format">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </Select>
          </Field>
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={process} disabled={files.length === 0 || busy}>
            {busy ? 'Resizing…' : 'Resize image'}
          </Button>
          {results ? (
            <Button variant="secondary" size="lg" onClick={() => setResults(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Resizing in your browser…" /> : null}

      {results ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Result</h2>
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                <img src={r.url} alt={`Resized preview of ${r.name}`} className="h-16 w-16 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {r.origWidth}×{r.origHeight}px → {r.width}×{r.height}px · {formatBytes(r.blob.size)}
                  </p>
                </div>
                <DownloadButton blob={r.blob} filename={r.name} />
              </li>
            ))}
          </ul>
          <InfoNote>
            Upscaling (making an image larger) is allowed, but it cannot add detail the original doesn’t contain.
          </InfoNote>
        </Card>
      ) : null}
    </div>
  );
}
