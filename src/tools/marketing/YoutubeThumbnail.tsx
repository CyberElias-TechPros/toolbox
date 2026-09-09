import { useCallback, useState } from 'react';
import { Button, Card, ErrorNote, Spinner } from '../../components/ui/primitives';
import { Field, Input, Range } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { loadImageFile } from '../../lib/image';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

const W = 1280;
const H = 720;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

export default function YoutubeThumbnail() {
  const [text, setText] = useState('HOW I DID IT');
  const [accent, setAccent] = useState('#facc15');
  const [darken, setDarken] = useState(40);
  const [fontSize, setFontSize] = useState(96);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [bgImage, setBgImage] = useState<{ url: string; bitmap: CanvasImageSource; w: number; h: number } | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = (next: DropFile[]) => {
    setFiles(next);
    const f = next[0]?.file;
    if (f) {
      void (async () => {
        try {
          const img = await loadImageFile(f);
          setBgImage({ url: f ? URL.createObjectURL(f) : '', bitmap: img.bitmap, w: img.width, h: img.height });
        } catch (e) {
          setError((e as Error).message);
        }
      })();
    } else {
      setBgImage(null);
    }
  };

  const generate = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available.');

      if (bgImage) {
        const scale = Math.max(W / bgImage.w, H / bgImage.h);
        const dw = bgImage.w * scale;
        const dh = bgImage.h * scale;
        ctx.drawImage(bgImage.bitmap, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.fillStyle = `rgba(0,0,0,${darken / 100})`;
        ctx.fillRect(0, 0, W, H);
      } else {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#18181b');
        g.addColorStop(1, '#3f3f46');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Centered text block with outline for readability.
      ctx.font = `900 ${fontSize}px system-ui, 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = wrap(ctx, text.toUpperCase() || 'YOUR TITLE', W - 160);
      const lh = fontSize * 1.12;
      const startY = H / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((l, i) => {
        ctx.lineWidth = Math.max(6, fontSize / 12);
        ctx.strokeStyle = '#000000';
        ctx.strokeText(l, W / 2, startY + i * lh);
        ctx.fillStyle = accent;
        ctx.fillText(l, W / 2, startY + i * lh);
      });

      const out = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('JPEG encoding failed.'))), 'image/jpeg', 0.92),
      );
      setBlob(out);
      track('tool_completed', 'youtube-thumbnail');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [text, accent, darken, fontSize, bgImage]);

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Text (shown in caps)">
              <Input value={text} onChange={(e) => setText(e.target.value)} aria-label="Thumbnail text" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Text color">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Text color" className="h-11 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950" />
              </Field>
              <Field label="Background photo (optional)" hint="Cover-cropped to 16:9.">
                <FileDrop accept={['image/png', 'image/jpeg', 'image/webp']} multiple={false} files={files} onFiles={onFiles} emptyLabel="Add a background" emptySub="or none" />
              </Field>
            </div>
            <Field label={`Darken background: ${darken}%`}>
              <Range value={darken} min={0} max={85} onChange={setDarken} label="Darken background" />
            </Field>
            <Field label={`Font size: ${fontSize}px`}>
              <Range value={fontSize} min={48} max={180} step={4} onChange={setFontSize} label="Font size" />
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            <div className="aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
              {blob ? (
                <img src={URL.createObjectURL(blob)} alt="Thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">Preview appears after you generate</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={generate} disabled={busy} size="lg" className="flex-1">
                {busy ? <Spinner label="Rendering…" /> : '🎬 Generate 1280×720'}
              </Button>
              {blob ? <DownloadButton blob={blob} filename="thumbnail.jpg" /> : null}
            </div>
          </div>
        </div>
      </Card>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {!bgImage ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No background photo? No problem — a clean dark gradient is generated instead.
        </p>
      ) : null}
    </div>
  );
}
