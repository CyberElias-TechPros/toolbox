import { useCallback, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

const W = 1200;
const H = 630;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export default function OgImage() {
  const [title, setTitle] = useState('My Awesome Product');
  const [subtitle, setSubtitle] = useState('Everything you need, done privately in your browser.');
  const [brand, setBrand] = useState('ToolBox');
  const [bg, setBg] = useState('#4f46e5');
  const [blob, setBlob] = useState<Blob | null>(null);

  const generate = useCallback(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available.');
    // Diagonal gradient background.
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, bg);
    g.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Subtle circles.
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.arc(W - 120, 90, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(90, H - 60, 150, 0, Math.PI * 2);
    ctx.fill();

    // Brand pill.
    ctx.font = '600 30px system-ui, sans-serif';
    const brandText = brand.toUpperCase();
    const bw = ctx.measureText(brandText).width + 48;
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.roundRect(80, 80, bw, 64, 32);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(brandText, 80 + 24, 80 + 42);

    // Title.
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 72px system-ui, sans-serif';
    const tLines = wrapText(ctx, title || 'Your title here', W - 160);
    let y = 260;
    for (const l of tLines) {
      ctx.fillText(l, 80, y);
      y += 88;
    }
    // Subtitle.
    ctx.font = '400 34px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    const sLines = wrapText(ctx, subtitle, W - 160);
    for (const l of sLines.slice(0, 2)) {
      ctx.fillText(l, 80, y + 10);
      y += 48;
    }
    // URL strip.
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(brand ? `${brand.toLowerCase().replace(/\s+/g, '')}.com` : '', 80, H - 70);

    const out = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG encoding failed.'))), 'image/png'),
    );
    setBlob(out);
    track('tool_completed', 'og-image');
  }, [title, subtitle, brand, bg]);

  const metaSnippet = `<meta property="og:image" content="/og-image.png" />\n<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />`;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
          </Field>
          <Field label="Subtitle">
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} aria-label="Subtitle" />
          </Field>
          <Field label="Brand / URL strip">
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand" />
          </Field>
          <Field label="Background color">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label="Background" className="h-11 w-24 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950" />
          </Field>
        </div>
        <div className="mt-5">
          <Button onClick={generate} size="lg">
            🎨 Generate 1200×630
          </Button>
        </div>
      </Card>

      {blob ? (
        <>
          <Card className="overflow-hidden">
            <img src={URL.createObjectURL(blob)} alt="Open Graph image preview" className="w-full" />
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <p className="text-xs text-zinc-500">1200×630 — the standard size for Facebook, X, LinkedIn and WhatsApp links.</p>
              <div className="flex gap-2">
                <CopyButton text={metaSnippet} label="Copy meta tags" />
                <DownloadButton blob={blob} filename="og-image.png" />
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center text-sm text-zinc-400">Your Open Graph image will appear here.</Card>
      )}
    </div>
  );
}
