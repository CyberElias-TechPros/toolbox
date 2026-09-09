import { useState } from 'react';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, SuccessNote } from '../../components/ui/primitives';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadBlob, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';

type Dir = 'toBase64' | 'fromBase64';

function dataUrlToImage(dataUrl: string): { url: string; mime: string; name: string } {
  const m = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/is);
  if (!m) throw new Error('This does not look like a Base64 image data URL (it should start with "data:image/…;base64,").');
  const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: m[1] });
  return { url: URL.createObjectURL(blob), mime: m[1], name: `image.${m[1].split('/')[1].replace('+xml', '')}` };
}

export default function Base64Image({ direction }: { direction: Dir }) {
  /* -------- image → base64 -------- */
  const [files, setFiles] = useState<DropFile[]>([]);
  const [urls, setUrls] = useState<Array<{ name: string; dataUrl: string; size: number }>>([]);
  const [toError, setToError] = useState<string | null>(null);

  const convert = () => {
    setToError(null);
    // FileReader is async — read each file as a data URL.
    Promise.all(
      files.map(
        (df) =>
          new Promise<{ name: string; dataUrl: string; size: number }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: df.file.name, dataUrl: String(reader.result), size: df.file.size });
            reader.onerror = () => reject(new Error(`Could not read “${df.file.name}”.`));
            reader.readAsDataURL(df.file);
          }),
      ),
    )
      .then((res) => {
        setUrls(res);
        track('tool_completed', 'image-to-base64');
      })
      .catch((e: unknown) => setToError(e instanceof Error ? e.message : 'Could not read the file.'));
  };

  /* -------- base64 → image -------- */
  const [b64, setB64] = useState('');
  const [decoded, setDecoded] = useState<{ url: string; mime: string; name: string } | null>(null);
  const [fromError, setFromError] = useState<string | null>(null);

  const decode = () => {
    setFromError(null);
    setDecoded(null);
    try {
      const res = dataUrlToImage(b64.trim());
      setDecoded(res);
      track('tool_completed', 'base64-to-image');
    } catch (e) {
      setFromError(e instanceof Error ? e.message : 'Could not decode that Base64 image.');
    }
  };

  if (direction === 'toBase64') {
    return (
      <div className="space-y-4">
        <Card className="p-5 sm:p-6">
          <FileDrop
            accept={['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']}
            multiple={false}
            files={files}
            onFiles={(f) => {
              setFiles(f);
              setUrls([]);
            }}
            onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
            hint="One image at a time"
            emptyLabel="Drop an image here"
          />
          {toError ? (
            <div className="mt-4">
              <ErrorNote>{toError}</ErrorNote>
            </div>
          ) : null}
          <div className="mt-5">
            <Button size="lg" onClick={convert} disabled={files.length === 0}>
              Convert to Base64
            </Button>
          </div>
        </Card>

        {urls.length > 0 ? (
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                Data URL ({formatBytes(new Blob([urls[0].dataUrl]).size)})
              </h2>
              <div className="flex gap-2">
                <CopyButton text={urls[0].dataUrl} label="Copy data URL" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const bytes = Uint8Array.from(atob(urls[0].dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
                    downloadBlob(new Blob([bytes]), urls[0].name);
                    track('download_clicked', 'image-to-base64');
                  }}
                >
                  ⬇ Image
                </Button>
              </div>
            </div>
            <pre className="mt-3 max-h-[24rem] overflow-auto break-all rounded-xl bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100">
              {urls[0].dataUrl}
            </pre>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Data URLs are great for embedding small images in HTML/CSS/JSON — but they are ~33% larger than the binary file.
            </p>
          </Card>
        ) : null}
      </div>
    );
  }

  /* direction === 'fromBase64' */
  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="b64-input">
          Base64 image (data URL)
        </label>
        <Textarea
          id="b64-input"
          aria-label="Base64 image data URL"
          placeholder="data:image/png;base64,iVBORw0KGgo…"
          className="min-h-[12rem]"
          value={b64}
          onChange={(e) => setB64(e.target.value)}
        />
        {fromError ? (
          <div className="mt-4">
            <ErrorNote>{fromError}</ErrorNote>
          </div>
        ) : null}
        <div className="mt-4">
          <Button size="lg" onClick={decode} disabled={!b64.trim()}>
            Decode to image
          </Button>
        </div>
      </Card>

      {decoded ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>Decoded {decoded.mime} successfully.</SuccessNote>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <img src={decoded.url} alt="Decoded image preview" className="max-h-48 rounded-xl border border-zinc-200 dark:border-zinc-700" />
            <Button
              variant="secondary"
              onClick={() => {
                fetch(decoded.url)
                  .then((r) => r.blob())
                  .then((b) => {
                    downloadBlob(b, decoded.name);
                    track('download_clicked', 'base64-to-image');
                  });
              }}
            >
              ⬇ Download {decoded.name}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
