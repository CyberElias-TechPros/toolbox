import { useState } from 'react';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

type OutFormat = 'png' | 'jpeg' | 'webp';
const META: Record<OutFormat, { mime: string; ext: string }> = {
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
}

export default function MetadataCleaner() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [format, setFormat] = useState<OutFormat>('png');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  async function clean() {
    setBusy(true);
    setError(null);
    const out: Result[] = [];
    try {
      for (const df of files) {
        const image = await loadImageFile(df.file);
        const canvas = drawToCanvas(image.bitmap, image.width, image.height);
        const m = META[format];
        const blob = await canvasToBlob(canvas, m.mime, format === 'png' ? undefined : 0.92);
        out.push({
          id: df.id,
          name: `${baseName(df.file.name)}-clean.${m.ext}`,
          url: URL.createObjectURL(blob),
          blob,
          originalSize: df.file.size,
        });
      }
      setResults(out);
      track('tool_completed', 'image-metadata-cleaner');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process that image. Try another file.');
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
          hint="JPG, PNG, WebP, GIF or BMP"
          emptyLabel="Drop images here"
        />

        <div className="mt-5 max-w-xs">
          <Field label="Output format" hint="PNG keeps transparency; JPEG/WebP are smaller">
            <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)} aria-label="Output format">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </Select>
          </Field>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={clean} disabled={files.length === 0 || busy}>
            {busy ? 'Cleaning…' : 'Remove metadata'}
          </Button>
          {results ? (
            <Button variant="secondary" size="lg" onClick={() => setResults(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Re-encoding in your browser…" /> : null}

      {results ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Cleaned images</h2>
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                <img src={r.url} alt={`Clean preview of ${r.name}`} className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatBytes(r.originalSize)} → {formatBytes(r.blob.size)}
                  </p>
                </div>
                <DownloadButton blob={r.blob} filename={r.name} />
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <InfoNote>
              Metadata (EXIF, GPS location, camera details, edit history) is removed because the image is re-encoded from pixels only.
              File size may change slightly.
            </InfoNote>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
