import { useState } from 'react';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, Spinner } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, formatBytes, formatPercent } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

type OutFormat = 'png' | 'jpeg' | 'webp';
const FORMAT_META: Record<OutFormat, { mime: string; ext: string; label: string }> = {
  png: { mime: 'image/png', ext: 'png', label: 'PNG — lossless, supports transparency' },
  jpeg: { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG — small files, no transparency' },
  webp: { mime: 'image/webp', ext: 'webp', label: 'WebP — modern, small, supports transparency' },
};

interface Result {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  originalSize: number;
  origExt: string;
}

export default function Converter() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [format, setFormat] = useState<OutFormat>('webp');
  const [quality, setQuality] = useState(85);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const meta = FORMAT_META[format];
  const lossy = format !== 'png';

  async function process() {
    setBusy(true);
    setError(null);
    const out: Result[] = [];
    try {
      for (const df of files) {
        const image = await loadImageFile(df.file);
        const canvas = drawToCanvas(image.bitmap, image.width, image.height);
        const blob = await canvasToBlob(canvas, meta.mime, lossy ? quality / 100 : undefined);
        const url = URL.createObjectURL(blob);
        out.push({
          id: `${df.id}-${out.length}`,
          name: `${baseName(df.file.name)}.${meta.ext}`,
          url,
          blob,
          originalSize: df.file.size,
          origExt: df.file.name.split('.').pop()?.toLowerCase() ?? '',
        });
      }
      setResults(out);
      track('tool_completed', 'image-converter');
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
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResults(null);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="Batch supported — convert many files at once"
          emptyLabel="Drop images here"
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Target format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)} aria-label="Target format">
              {(Object.keys(FORMAT_META) as OutFormat[]).map((k) => (
                <option key={k} value={k}>
                  {FORMAT_META[k].label}
                </option>
              ))}
            </Select>
          </Field>
          {lossy ? (
            <Field label={`Quality — ${quality}%`}>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
                aria-label="Quality"
              />
            </Field>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={process} disabled={files.length === 0 || busy}>
            {busy ? 'Converting…' : `Convert to ${format.toUpperCase()}`}
          </Button>
          {results ? (
            <Button variant="secondary" size="lg" onClick={() => setResults(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Converting in your browser…" /> : null}

      {results ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Converted files</h2>
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((r) => {
              const pct = ((r.blob.size - r.originalSize) / r.originalSize) * 100;
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                  <img src={r.url} alt={`Converted preview of ${r.name}`} className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      .{r.origExt} → .{meta.ext} · {formatBytes(r.originalSize)} → {formatBytes(r.blob.size)}{' '}
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
        </Card>
      ) : null}
    </div>
  );
}
