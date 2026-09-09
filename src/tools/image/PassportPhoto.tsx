import { useState } from 'react';
import { Button, Card, ErrorNote } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { canvasToBlob, drawToCanvas, loadImageFile } from '../../lib/image';
import { clamp } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

/** 35×45 mm at 300 DPI = 413×531 px. */
const OUT_W = 413;
const OUT_H = 531;

export default function PassportPhoto() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [dx, setDx] = useState(0); // -100..100 (% of overflow, horizontal)
  const [dy, setDy] = useState(0);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const [results, setResults] = useState<Array<{ name: string; blob: Blob; url: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const file = files[0]?.file;

  const process = async () => {
    if (!file) return;
    setError(null);
    try {
      const img = await loadImageFile(file);
      const target = OUT_W / OUT_H;
      const srcRatio = img.width / img.height;
      let sw = img.width;
      let sh = img.height;
      if (srcRatio > target) {
        sw = img.height * target;
      } else {
        sh = img.width / target;
      }
      const overflowX = img.width - sw;
      const overflowY = img.height - sh;
      const sx = (overflowX / 2) + (dx / 100) * (overflowX / 2);
      const sy = (overflowY / 2) + (dy / 100) * (overflowY / 2);
      const cx = clamp(sx, 0, Math.max(0, overflowX));
      const cy = clamp(sy, 0, Math.max(0, overflowY));

      const single = drawToCanvas(img.bitmap, OUT_W, OUT_H, cx, cy, sw, sh);
      const singleBlob = await canvasToBlob(single, format, 0.92);

      // 2×2 sheet on an A6-ish white card with 5 mm margins (≈59px at 300dpi).
      const m = 59;
      const gap = 19;
      const sheet = document.createElement('canvas');
      sheet.width = m * 2 + OUT_W * 2 + gap;
      sheet.height = m * 2 + OUT_H * 2 + gap;
      const sctx = sheet.getContext('2d');
      if (!sctx) throw new Error('Canvas 2D is not available.');
      sctx.fillStyle = '#ffffff';
      sctx.fillRect(0, 0, sheet.width, sheet.height);
      for (const [col, row] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) {
        sctx.drawImage(single, m + col * (OUT_W + gap), m + row * (OUT_H + gap));
      }
      const sheetBlob = await canvasToBlob(sheet, format, 0.92);

      const ext = format === 'image/png' ? 'png' : 'jpg';
      setResults([
        { name: `passport-35x45.${ext}`, blob: singleBlob, url: URL.createObjectURL(singleBlob) },
        { name: `passport-sheet-2x2.${ext}`, blob: sheetBlob, url: URL.createObjectURL(sheetBlob) },
      ]);
      track('tool_completed', 'passport-photo');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['image/png', 'image/jpeg']}
          multiple={false}
          files={files}
          onFiles={setFiles}
          emptyLabel="Drop your photo"
          emptySub="or click to browse"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={`Horizontal: ${dx > 0 ? '+' : ''}${dx}%`} hint="Center on the face">
            <input type="range" min={-100} max={100} value={dx} onChange={(e) => setDx(Number(e.target.value))} aria-label="Horizontal crop" className="mt-3 w-full accent-indigo-600" />
          </Field>
          <Field label={`Vertical: ${dy > 0 ? '+' : ''}${dy}%`} hint="Top of head near the top edge">
            <input type="range" min={-100} max={100} value={dy} onChange={(e) => setDy(Number(e.target.value))} aria-label="Vertical crop" className="mt-3 w-full accent-indigo-600" />
          </Field>
          <Field label="Format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} aria-label="Format">
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5">
          <Button onClick={process} disabled={!file} size="lg">
            📷 Cut to 35×45 mm
          </Button>
        </div>
      </Card>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {results ? (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((r) => (
            <Card key={r.name} className="p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{r.name}</h2>
                <DownloadButton blob={r.blob} filename={r.name} />
              </div>
              <img src={r.url} alt={r.name} className="w-full rounded-xl border border-zinc-200 bg-white object-contain dark:border-zinc-700" />
            </Card>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Output: 35×45 mm at 300 DPI (413×531 px) — the standard size for Nigerian passports, driver licences and IDs.
      </p>
    </div>
  );
}
