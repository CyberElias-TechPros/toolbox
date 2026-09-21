import { useState } from 'react';
import JSZip, { type JSZipObject } from 'jszip';
import { Download } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { Card, Button, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { CopyButton } from '../../components/ui/CopyButton';
import { openZip, uniqueFilename } from '../../lib/archives';
import { validateFiles } from '../../lib/documents';
import { downloadBlob, downloadText, formatBytes } from '../../lib/utils';
export default function FileTools({ spec }: { spec: ExtraSpec }) {
  const [files, setFiles] = useState<File[]>([]),
    [entries, setEntries] = useState<JSZipObject[]>([]),
    [blob, setBlob] = useState<Blob | null>(null),
    [hash, setHash] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const reset = () => {
    setBlob(null);
    setHash('');
    setEntries([]);
    setError('');
  };
  const add = (incoming: File[]) => {
    reset();
    setFiles(spec.slug === 'zip-creator' ? [...files, ...incoming] : incoming.slice(0, 1));
  };
  const run = async () => {
    setBusy(true);
    reset();
    try {
      validateFiles(files);
      if (spec.slug === 'zip-creator') {
        const zip = new JSZip(),
          used = new Set<string>();
        for (const f of files) zip.file(uniqueFilename(f.name, used), await f.arrayBuffer());
        setBlob(
          await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }),
        );
      } else if (spec.slug === 'zip-extractor') {
        const data = await openZip(await files[0].arrayBuffer());
        if (!data.length) throw Error('This archive has no files.');
        setEntries(data);
      } else {
        const digest = await crypto.subtle.digest('SHA-256', await files[0].arrayBuffer());
        setHash(Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join(''));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="tool-workspace">
      {spec.note && <InfoNote className="mb-5">{spec.note}</InfoNote>}
      <label
        className="block border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 text-center cursor-pointer bg-zinc-50 dark:bg-zinc-950"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) add(Array.from(e.dataTransfer.files));
        }}
      >
        <span className="block font-medium">
          {spec.slug === 'zip-extractor' ? 'Drop a ZIP archive here' : 'Drop your files here'}
        </span>
        <span className="block text-xs text-zinc-500 mt-2">or browse your device · Up to 50 MB total</span>
        <input
          disabled={busy}
          aria-label="Choose files"
          className="block mx-auto mt-5 text-xs max-w-full"
          type="file"
          multiple={spec.slug === 'zip-creator'}
          accept={spec.slug === 'zip-extractor' ? '.zip' : undefined}
          onChange={(e) => {
            add(Array.from(e.target.files || []));
            e.target.value = '';
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="document-order">
          {files.map((f, i) => (
            <li className="flex gap-3 justify-between text-xs p-2" key={i}>
              <span className="truncate">
                {f.name} <span className="text-zinc-500">{formatBytes(f.size)}</span>
              </span>
              <button
                disabled={busy}
                aria-label={`Remove ${f.name}`}
                onClick={() => {
                  setFiles(files.filter((_, j) => j !== i));
                  reset();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="workbench-toolbar">
        <Button onClick={run} disabled={!files.length || busy}>
          {busy
            ? 'Working locally…'
            : spec.slug === 'zip-creator'
              ? 'Create ZIP'
              : spec.slug === 'zip-extractor'
                ? 'Open ZIP'
                : 'Calculate SHA-256'}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {blob && (
        <div className="result-panel">
          <h3>Your archive is ready. {formatBytes(blob.size)}</h3>
          <Button className="mt-4" onClick={() => downloadBlob(blob, 'toolbox-files.zip')}>
            <Download size={14} />
            Download ZIP
          </Button>
        </div>
      )}
      {hash && (
        <div className="result-panel">
          <h3>SHA-256 checksum</h3>
          <pre>{hash}</pre>
          <div className="workbench-toolbar">
            <CopyButton text={hash} />
            <Button onClick={() => downloadText(`${hash}  ${files[0].name}\n`, `${files[0].name}.sha256`)}>
              <Download size={14} />
              Download checksum
            </Button>
          </div>
        </div>
      )}
      {entries.length > 0 && (
        <div className="result-panel">
          <h3>{entries.length} files inside</h3>
          <ul className="mt-3 space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.name}
                className="flex justify-between gap-4 items-center text-xs border-b border-zinc-200 dark:border-zinc-700 py-2"
              >
                <span className="break-all">{entry.name}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      const result = await entry.async('blob');
                      if (result.size > 200 * 1024 * 1024)
                        throw Error('File exceeds the 200 MB extraction limit.');
                      downloadBlob(result, entry.name.split('/').pop() || 'file');
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Download size={12} />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
