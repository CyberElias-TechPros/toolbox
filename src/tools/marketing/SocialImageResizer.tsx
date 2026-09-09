import { useState } from 'react';
import { Button, Card, ErrorNote, Spinner } from '../../components/ui/primitives';
import { Checkbox } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { baseName, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

const SIZES: Array<{ id: string; label: string; w: number; h: number }> = [
  { id: 'ig-square', label: 'Instagram post (square)', w: 1080, h: 1080 },
  { id: 'ig-portrait', label: 'Instagram portrait', w: 1080, h: 1350 },
  { id: 'ig-story', label: 'Instagram / TikTok story', w: 1080, h: 1920 },
  { id: 'fb-post', label: 'Facebook post', w: 1200, h: 630 },
  { id: 'x-post', label: 'X (Twitter) post', w: 1600, h: 900 },
  { id: 'linkedin', label: 'LinkedIn post', w: 1200, h: 625 },
  { id: 'yt', label: 'YouTube thumbnail', w: 1280, h: 720 },
];

interface Out {
  id: string;
  label: string;
  w: number;
  h: number;
  blob: Blob;
}

export default function SocialImageResizer() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(SIZES.slice(0, 3).map((s) => s.id)));
  const [outs, setOuts] = useState<Out[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const process = async () => {
    const file = files[0]?.file;
    if (!file || selected.size === 0) return;
    setBusy(true);
    setError(null);
    setOuts([]);
    try {
      const img = await loadImageFile(file);
      const targets = SIZES.filter((s) => selected.has(s.id));
      const results: Out[] = [];
      for (const t of targets) {
        // Cover-crop to the target aspect ratio, centered.
        const target = t.w / t.h;
        const srcRatio = img.width / img.height;
        let sw = img.width;
        let sh = img.height;
        if (srcRatio > target) sw = img.height * target;
        else sh = img.width / target;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        const canvas = drawToCanvas(img.bitmap, t.w, t.h, sx, sy, sw, sh);
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
        results.push({ ...t, blob });
      }
      setOuts(results);
      track('tool_completed', 'social-image-resizer');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => {
    const stem = files[0] ? baseName(files[0].file.name) : 'image';
    outs.forEach((o, i) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(o.blob);
      a.download = `${stem}-${o.id}.jpg`;
      setTimeout(() => a.click(), i * 250);
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    });
    track('download_clicked', 'social-resize-all');
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['image/png', 'image/jpeg', 'image/webp']}
          multiple={false}
          files={files}
          onFiles={setFiles}
          emptyLabel="Drop the image you’re sharing"
          emptySub="or click to browse"
        />
        <h2 className="mb-2 mt-5 text-sm font-semibold">Platforms</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SIZES.map((s) => (
            <Checkbox
              key={s.id}
              label={`${s.label} · ${s.w}×${s.h}`}
              checked={selected.has(s.id)}
              onChange={() => toggle(s.id)}
            />
          ))}
        </div>
        <div className="mt-5">
          <Button onClick={process} disabled={!files.length || selected.size === 0 || busy} size="lg">
            {busy ? <Spinner label="Resizing…" /> : `📐 Resize for ${selected.size || '…'} platform${selected.size === 1 ? '' : 's'}`}
          </Button>
        </div>
      </Card>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {outs.length > 0 ? (
        <>
          <Card className="flex items-center justify-between p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{outs.length} images ready</p>
            <Button variant="secondary" size="sm" onClick={downloadAll}>
              ⬇ Download all
            </Button>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outs.map((o) => (
              <Card key={o.id} className="overflow-hidden">
                <img src={URL.createObjectURL(o.blob)} alt={o.label} className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800" style={{ maxHeight: 260, objectFit: 'contain' }} />
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.label}</p>
                    <p className="text-xs text-zinc-500">
                      {o.w}×{o.h} · {formatBytes(o.blob.size)}
                    </p>
                  </div>
                  <DownloadButton blob={o.blob} filename={baseName(files[0]?.file.name ?? 'image') + `-${o.id}.jpg`} />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
