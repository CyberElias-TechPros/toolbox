import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, ErrorNote, InfoNote, Spinner } from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/fields';
import { canvasToBlob, drawToCanvas } from '../../lib/image';
import { baseName, clamp, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

type RatioId = 'free' | '1:1' | '4:3' | '16:9' | '3:2';
const RATIOS: Record<RatioId, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '3:2': 3 / 2,
};

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Handle = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const MIN = 0.04;

function cropForRatio(ratio: number | null, prev?: Crop): Crop {
  const W = 1;
  const H = ratio ? 1 : 0.75; // display is 4:3-ish placeholder until image loads
  if (ratio == null) return prev ?? { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
  // Largest centered box with this ratio inside a 1:1 virtual frame
  let w = W;
  let h = w / ratio;
  if (h > H) {
    h = H;
    w = h * ratio;
  }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

export default function Cropper() {
  const [file, setFile] = useState<File | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [ratioId, setRatioId] = useState<RatioId>('free');
  const [crop, setCrop] = useState<Crop>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ handle: Handle; startX: number; startY: number; start: Crop } | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const ratio = RATIOS[ratioId];

  const pickFile = useCallback(async (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (!f) {
      setBitmap(null);
      setDisplayUrl(null);
      return;
    }
    try {
      const bm = await createImageBitmap(f);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(f);
      urlRef.current = url;
      setBitmap(bm);
      setDisplayUrl(url);
      setCrop((prev) => cropForRatio(RATIOS[ratioId], prev));
    } catch {
      setError(`Could not decode “${f.name}”. The file may be corrupted or an unsupported format.`);
      setBitmap(null);
      setDisplayUrl(null);
    }
  }, [ratioId]);

  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const onRatioChange = (id: RatioId) => {
    setRatioId(id);
    setCrop(cropForRatio(RATIOS[id], crop));
  };

  const beginDrag = (handle: Handle) => (e: React.PointerEvent) => {
    if (!bitmap) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, start: { ...crop } };
    boxRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const box = boxRef.current;
    if (!drag || !box) return;
    const rect = box.getBoundingClientRect();
    const dxn = (e.clientX - drag.startX) / rect.width;
    const dyn = (e.clientY - drag.startY) / rect.height;
    const s = drag.start;
    const r = ratio;
    const next: Crop = { ...s };

    switch (drag.handle) {
      case 'move': {
        next.x = clamp(s.x + dxn, 0, 1 - s.w);
        next.y = clamp(s.y + dyn, 0, 1 - s.h);
        break;
      }
      default: {
        // Resizing
        let left = s.x;
        let top = s.y;
        let right = s.x + s.w;
        let bottom = s.y + s.h;
        if (drag.handle.includes('w')) left = clamp(s.x + dxn, 0, right - MIN);
        if (drag.handle.includes('e')) right = clamp(s.x + s.w + dxn, left + MIN, 1);
        if (drag.handle.includes('n')) top = clamp(s.y + dyn, 0, bottom - MIN);
        if (drag.handle.includes('s')) bottom = clamp(s.y + s.h + dyn, top + MIN, 1);
        let w = right - left;
        let h = bottom - top;
        if (r) {
          // Enforce ratio: scale so w/h = r while staying inside the image.
          const targetW = Math.max(w, h * r);
          const availW = Math.min(right + (1 - right), 1 - left);
          const availH = Math.min(bottom + (1 - bottom), 1 - top);
          let fw = targetW;
          let fh = fw / r;
          if (fh > availH) {
            fh = availH;
            fw = fh * r;
          }
          if (fw > availW) {
            fw = availW;
            fh = fw / r;
          }
          // Keep the anchor (the corner/edge being dragged away from) stable.
          const anchorX = drag.handle.includes('w') ? right : left;
          const anchorY = drag.handle.includes('n') ? bottom : top;
          left = drag.handle.includes('w') ? anchorX - fw : anchorX;
          right = left + fw;
          top = drag.handle.includes('n') ? anchorY - fh : anchorY;
          bottom = top + fh;
          w = fw;
          h = fh;
        }
        next.x = clamp(left, 0, 1 - w);
        next.y = clamp(top, 0, 1 - h);
        next.w = w;
        next.h = h;
      }
    }
    setCrop(next);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  async function applyCrop() {
    if (!file || !bitmap) return;
    setBusy(true);
    setError(null);
    try {
      const naturalW = bitmap.width;
      const naturalH = bitmap.height;
      const sx = crop.x * naturalW;
      const sy = crop.y * naturalH;
      const sw = Math.max(1, crop.w * naturalW);
      const sh = Math.max(1, crop.h * naturalH);
      const canvas = drawToCanvas(bitmap, Math.round(sw), Math.round(sh), sx, sy, sw, sh);
      const mime = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }[format];
      const ext = { png: 'png', jpeg: 'jpg', webp: 'webp' }[format];
      const blob = await canvasToBlob(canvas, mime, format === 'png' ? undefined : 0.9);
      const url = URL.createObjectURL(blob);
      setResult({
        blob,
        url,
        name: `${baseName(file.name)}-cropped.${ext}`,
        w: Math.round(sw),
        h: Math.round(sh),
      });
      track('tool_completed', 'image-cropper');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong while cropping.');
    } finally {
      setBusy(false);
    }
  }

  const handles: Array<{ id: Handle; className: string; cursor: string }> = [
    { id: 'nw', className: '-left-1.5 -top-1.5', cursor: 'nwse-resize' },
    { id: 'n', className: 'left-1/2 -top-1.5 -translate-x-1/2', cursor: 'ns-resize' },
    { id: 'ne', className: '-right-1.5 -top-1.5', cursor: 'nesw-resize' },
    { id: 'e', className: '-right-1.5 top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
    { id: 'se', className: '-right-1.5 -bottom-1.5', cursor: 'nwse-resize' },
    { id: 's', className: 'left-1/2 -bottom-1.5 -translate-x-1/2', cursor: 'ns-resize' },
    { id: 'sw', className: '-left-1.5 -bottom-1.5', cursor: 'nesw-resize' },
    { id: 'w', className: '-left-1.5 top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-8 text-center transition-colors hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-950/40 dark:hover:border-indigo-600">
          <span className="text-3xl" aria-hidden>
            📂
          </span>
          <span className="text-sm font-medium">{file ? `Change image (currently: ${file.name})` : 'Drop or choose an image to crop'}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Processed locally — never uploaded</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {displayUrl && bitmap ? (
          <div className="mt-6">
            <div
              ref={boxRef}
              className="relative mx-auto w-full max-w-2xl select-none overflow-hidden rounded-xl"
              style={{ touchAction: 'none' }}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <img src={displayUrl} alt="Image to crop" className="block w-full" draggable={false} />
              <div
                data-mode="move"
                onPointerDown={beginDrag('move')}
                className="absolute cursor-move border-2 border-white/90"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.w * 100}%`,
                  height: `${crop.h * 100}%`,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                }}
              >
                <span className="absolute -top-6 left-0 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                  {Math.round(crop.w * bitmap.width)}×{Math.round(crop.h * bitmap.height)}px
                </span>
                {handles.map((h) => (
                  <span
                    key={h.id}
                    data-mode={h.id}
                    onPointerDown={beginDrag(h.id)}
                    className={`absolute h-3 w-3 rounded-sm border border-white bg-indigo-500 ${h.className}`}
                    style={{ cursor: h.cursor }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Crop ratio">
                <Select value={ratioId} onChange={(e) => onRatioChange(e.target.value as RatioId)} aria-label="Crop ratio">
                  <option value="free">Free crop</option>
                  <option value="1:1">Square — 1:1</option>
                  <option value="4:3">Classic — 4:3</option>
                  <option value="16:9">Widescreen — 16:9</option>
                  <option value="3:2">Photo — 3:2</option>
                </Select>
              </Field>
              <Field label="Output format">
                <Select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg' | 'webp')} aria-label="Output format">
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </Select>
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={applyCrop} disabled={busy}>
                {busy ? 'Cropping…' : 'Crop image'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setCrop(cropForRatio(ratio))}>
                Reset crop box
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </Card>

      {busy ? <Spinner label="Cropping in your browser…" /> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Cropped result</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <img src={result.url} alt="Cropped result preview" className="h-24 max-w-[16rem] rounded-lg border border-zinc-200 object-contain dark:border-zinc-700" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {result.w}×{result.h}px · {formatBytes(result.blob.size)}
              </p>
            </div>
            <DownloadButton blob={result.blob} filename={result.name} />
          </div>
          <div className="mt-4">
            <InfoNote>Need exact pixel dimensions? Crop to the closest ratio here, then fine-tune in the Image Resizer.</InfoNote>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
