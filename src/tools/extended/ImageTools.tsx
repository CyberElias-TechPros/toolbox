import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { Card, Button, ErrorNote } from '../../components/ui/primitives';
import { Field, Input, Select, Checkbox } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { imageToCanvas, validateFiles } from '../../lib/documents';
import { downloadBlob, formatBytes } from '../../lib/utils';
export default function ImageTools({ spec }: { spec: ExtraSpec }) {
  const [files, setFiles] = useState<DropFile[]>([]),
    [angle, setAngle] = useState('90'),
    [flip, setFlip] = useState(false),
    [brightness, setBrightness] = useState(115),
    [watermark, setWatermark] = useState('Made with care'),
    [opacity, setOpacity] = useState(0.65),
    [columns, setColumns] = useState('2'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [blob, setBlob] = useState<Blob | null>(null),
    [url, setUrl] = useState('');
  useEffect(() => {
    if (!blob) {
      setUrl('');
      return;
    }
    const value = URL.createObjectURL(blob);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [blob]);
  const clear = () => {
    setBlob(null);
    setError('');
  };
  const run = async () => {
    setBusy(true);
    clear();
    try {
      validateFiles(files.map((f) => f.file));
      if (files.length > 16) throw Error('Use 16 images or fewer.');
      const canvas = document.createElement('canvas');
      if (spec.slug === 'image-collage') {
        const cols = Number(columns),
          rows = Math.ceil(files.length / cols),
          cell = 600,
          gap = 16;
        canvas.width = cols * cell + (cols + 1) * gap;
        canvas.height = rows * cell + (rows + 1) * gap;
        if (canvas.width * canvas.height > 20_000_000)
          throw Error('Use more columns or fewer images to keep the output manageable.');
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f8f8f4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < files.length; i++) {
          const image = await imageToCanvas(files[i].file);
          const scale = Math.min(cell / image.width, cell / image.height),
            w = image.width * scale,
            h = image.height * scale;
          ctx.drawImage(
            image,
            gap + (i % cols) * (cell + gap) + (cell - w) / 2,
            gap + Math.floor(i / cols) * (cell + gap) + (cell - h) / 2,
            w,
            h,
          );
          image.width = 0;
          image.height = 0;
        }
      } else {
        const source = await imageToCanvas(files[0].file);
        const rotate = spec.slug === 'image-rotate-flip' ? +angle : 0,
          swap = rotate === 90 || rotate === 270;
        canvas.width = swap ? source.height : source.width;
        canvas.height = swap ? source.width : source.height;
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        if (spec.slug === 'image-rotate-flip' && flip) ctx.scale(-1, 1);
        if (spec.slug === 'image-grayscale') ctx.filter = 'grayscale(1)';
        if (spec.slug === 'image-brightness') ctx.filter = `brightness(${brightness}%)`;
        ctx.drawImage(source, -source.width / 2, -source.height / 2);
        ctx.restore();
        source.width = 0;
        source.height = 0;
        if (spec.slug === 'image-watermark') {
          if (!watermark.trim()) throw Error('Add watermark text.');
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 5;
          ctx.font = `600 ${Math.max(12, canvas.width / 28)}px sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(watermark, canvas.width - 24, canvas.height - 24, canvas.width - 48);
        }
      }
      const result = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(Error('Could not encode the image.'))), 'image/png'),
      );
      setBlob(result);
      canvas.width = 0;
      canvas.height = 0;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="tool-workspace">
      <fieldset disabled={busy}>
        <FileDrop
          accept={['jpg', 'jpeg', 'png', 'webp']}
          multiple={spec.slug === 'image-collage'}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            clear();
          }}
          onRemove={(id) => {
            setFiles(files.filter((f) => f.id !== id));
            clear();
          }}
          hint="JPG, PNG, WebP · Up to 50 MB total · PNG output"
        />
        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          {spec.slug === 'image-rotate-flip' && (
            <>
              <Field label="Rotation">
                <Select
                  aria-label="Rotation"
                  value={angle}
                  onChange={(e) => {
                    setAngle(e.target.value);
                    clear();
                  }}
                >
                  {['0', '90', '180', '270'].map((a) => (
                    <option key={a} value={a}>
                      {a}° clockwise
                    </option>
                  ))}
                </Select>
              </Field>
              <Checkbox
                label="Flip horizontally before rotation"
                checked={flip}
                onChange={(v) => {
                  setFlip(v);
                  clear();
                }}
              />
            </>
          )}
          {spec.slug === 'image-brightness' && (
            <Field label={`Brightness: ${brightness}%`}>
              <input
                type="range"
                aria-label="Brightness"
                min={0}
                max={200}
                value={brightness}
                onChange={(e) => {
                  setBrightness(+e.target.value);
                  clear();
                }}
                className="w-full accent-indigo-600"
              />
            </Field>
          )}
          {spec.slug === 'image-watermark' && (
            <>
              <Field label="Watermark text">
                <Input
                  aria-label="Watermark text"
                  maxLength={100}
                  value={watermark}
                  onChange={(e) => {
                    setWatermark(e.target.value);
                    clear();
                  }}
                />
              </Field>
              <Field label={`Opacity: ${Math.round(opacity * 100)}%`}>
                <input
                  type="range"
                  aria-label="Opacity"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => {
                    setOpacity(+e.target.value);
                    clear();
                  }}
                  className="w-full accent-indigo-600"
                />
              </Field>
            </>
          )}
          {spec.slug === 'image-collage' && (
            <Field label="Columns">
              <Select
                aria-label="Columns"
                value={columns}
                onChange={(e) => {
                  setColumns(e.target.value);
                  clear();
                }}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </fieldset>
      <div className="workbench-toolbar">
        <Button onClick={run} disabled={!files.length || busy}>
          {busy ? 'Creating your image…' : 'Process image'}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {blob && url && (
        <div className="result-panel">
          <div className="flex items-center justify-between mb-5">
            <h3>Looking good. {formatBytes(blob.size)}</h3>
            <Button onClick={() => downloadBlob(blob, `${spec.slug}.png`)}>
              <Download size={14} />
              Download PNG
            </Button>
          </div>
          <img
            className="max-h-[520px] max-w-full mx-auto rounded-md"
            src={url}
            alt="Processed image preview"
          />
        </div>
      )}
    </Card>
  );
}
