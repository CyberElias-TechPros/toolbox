import { useEffect, useMemo, useState } from 'react';
import { Button, Card, ErrorNote } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, clamp, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

export default function BlurImage() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [radius, setRadius] = useState(8);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [result, setResult] = useState<{ url: string; name: string; blob: Blob; original: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!files[0]) {
      setPreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(files[0].file);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [files]);

  const process = async () => {
    const file = files[0]?.file;
    if (!file) return;
    setError(null);
    try {
      const img = await loadImageFile(file);
      const canvas = drawToCanvas(img.bitmap, img.width, img.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D is not available.');
      // Re-draw with the blur filter onto a fresh canvas so the source stays clean.
      const out = document.createElement('canvas');
      out.width = canvas.width;
      out.height = canvas.height;
      const octx = out.getContext('2d');
      if (!octx) throw new Error('Canvas 2D is not available.');
      octx.filter = `blur(${clamp(radius, 0, 60)}px)`;
      octx.drawImage(canvas, 0, 0);
      const blob = await canvasToBlob(out, format, 0.92);
      setResult({
        url: URL.createObjectURL(blob),
        name: `${baseName(file.name)}-blurred.${format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : 'webp'}`,
        blob,
        original: file.size,
      });
      track('tool_completed', 'image-blur');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const sizeDelta = useMemo(() => {
    if (!result) return null;
    const pct = ((result.blob.size - result.original) / result.original) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% (${formatBytes(result.blob.size)})`;
  }, [result]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['image/png', 'image/jpeg', 'image/webp']}
          multiple={false}
          files={files}
          onFiles={setFiles}
          emptyLabel="Drop an image to blur"
          emptySub="or click to browse"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={`Blur strength: ${radius}px`}>
            <input
              type="range"
              min={0}
              max={60}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Blur strength"
              className="mt-3 w-full accent-indigo-600"
            />
          </Field>
          <Field label="Output format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} aria-label="Output format">
              <option value="image/png">PNG (lossless)</option>
              <option value="image/jpeg">JPEG (smaller)</option>
              <option value="image/webp">WebP (smaller)</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5">
          <Button onClick={process} disabled={!files.length} size="lg">
            ⚙ Blur image
          </Button>
        </div>
      </Card>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {result.name}
              {sizeDelta ? <span className="ml-2 text-xs font-normal text-zinc-500">size: {sizeDelta}</span> : null}
            </h2>
            <DownloadButton blob={result.blob} filename={result.name} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {previewUrl ? (
              <div>
                <p className="mb-1 text-xs text-zinc-500">Original</p>
                <img src={previewUrl} alt="Original" className="max-h-72 w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-700" />
              </div>
            ) : null}
            <div>
              <p className="mb-1 text-xs text-zinc-500">Blurred</p>
              <img src={result.url} alt="Blurred result" className="max-h-72 w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-700" />
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
