import { useCallback, useMemo, useState } from 'react';
import { Button, Card, Spinner } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { track } from '../../lib/track';
import { DownloadButton } from './shared';

const SIZES = [16, 32, 48, 180, 512];

function drawFavicon(size: number, glyph: string, bg: string, fg: string, radius: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  const r = (radius / 100) * size;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(size, 0, size, size, r);
  ctx.arcTo(size, size, 0, size, r);
  ctx.arcTo(0, size, 0, 0, r);
  ctx.arcTo(0, 0, size, 0, r);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(size * 0.58)}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
  ctx.fillText(glyph, size / 2, size / 2 + size * 0.03);
  return c;
}

export default function FaviconGenerator() {
  const [glyph, setGlyph] = useState('C');
  const [bg, setBg] = useState('#4f46e5');
  const [fg, setFg] = useState('#ffffff');
  const [radius, setRadius] = useState(24);
  const [busy, setBusy] = useState(false);
  const [blobs, setBlobs] = useState<Array<{ size: number; blob: Blob }> | null>(null);

  const manifest = useMemo(() => {
    const lines = SIZES.map(
      (s) => `  <link rel="icon" type="image/png" sizes="${s}x${s}" href="/favicon-${s}.png">`,
    );
    return lines.join('\n');
  }, []);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const out: Array<{ size: number; blob: Blob }> = [];
      for (const size of SIZES) {
        const canvas = drawFavicon(size, glyph.trim() || '?', bg, fg, radius);
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG encoding failed'))), 'image/png'),
        );
        out.push({ size, blob });
      }
      setBlobs(out);
      track('tool_completed', 'favicon-generator');
    } finally {
      setBusy(false);
    }
  }, [glyph, bg, fg, radius]);

  const downloadAll = () => {
    blobs?.forEach(({ size, blob }) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `favicon-${size}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    track('download_clicked', 'favicon-all');
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Letter or emoji (1–2 chars)">
            <Input value={glyph} onChange={(e) => setGlyph(e.target.value.slice(0, 2))} aria-label="Glyph" placeholder="C or 🚀" />
          </Field>
          <Field label="Background">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label="Background color" className="h-11 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950" />
          </Field>
          <Field label="Text / emoji">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} aria-label="Text color" className="h-11 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950" />
          </Field>
          <Field label={`Corner radius (${radius}%)`}>
            <input
              type="range"
              min={0}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Corner radius"
              className="mt-3 w-full accent-indigo-600"
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-card"
            style={{ backgroundColor: bg, color: fg, borderRadius: `${radius}%` }}
            aria-hidden
          >
            {glyph.trim() || '?'}
          </div>
          <div>
            <Button onClick={generate} disabled={busy} size="lg">
              {busy ? <Spinner label="Rendering…" /> : '⚙ Generate sizes'}
            </Button>
          </div>
        </div>
      </Card>

      {blobs ? (
        <>
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Generated sizes</h2>
              <Button variant="secondary" onClick={downloadAll}>
                ⬇ Download all ({SIZES.length})
              </Button>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              {blobs.map(({ size, blob }) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <img
                    src={URL.createObjectURL(blob)}
                    alt={`favicon ${size}`}
                    style={{ width: Math.min(size, 96), height: Math.min(size, 96) }}
                    className="rounded-md border border-zinc-200 dark:border-zinc-700"
                  />
                  <span className="font-mono text-[10px] text-zinc-500">{size}×{size}</span>
                  <DownloadButton blob={blob} filename={`favicon-${size}.png`} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Paste into your &lt;head&gt;</h2>
              <CopyButton text={manifest} label="Copy snippet" />
            </div>
            <pre className="overflow-auto rounded-xl bg-zinc-50 p-4 font-mono text-xs dark:bg-zinc-950">{manifest}</pre>
          </Card>
        </>
      ) : null}
    </div>
  );
}
