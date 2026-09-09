import { useState } from 'react';
import { degrees, PDFDocument } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';
import { parsePageRanges } from './Splitter';

export default function Rotator() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [pages, setPages] = useState('');
  const [angle, setAngle] = useState<'90' | '180' | '270'>('90');
  const [clockwise, setClockwise] = useState(true);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; rotated: number } | null>(null);

  const file = files[0]?.file ?? null;

  async function rotate() {
    if (!file || !pageCount) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let indices: number[];
      if (!pages.trim()) {
        indices = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        indices = parsePageRanges(pages, pageCount).map((p) => p - 1);
      }
      const delta = clockwise ? parseInt(angle, 10) : -parseInt(angle, 10);
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      for (const i of indices) {
        const page = src.getPage(i);
        const next = (page.getRotation().angle + delta + 360) % 360;
        page.setRotation(degrees(next));
      }
      const outBytes = await src.save();
      setResult({ blob: uint8ToBlob(outBytes, 'application/pdf'), rotated: indices.length });
      track('tool_completed', 'pdf-rotator');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rotate the pages. The file may not be a valid PDF.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <FileDrop
          accept={['pdf']}
          multiple={false}
          files={files}
          onFiles={(f) => {
            setFiles(f);
            setResult(null);
            setError(null);
            if (f[0]) {
              f[0].file
                .arrayBuffer()
                .then((bytes) => PDFDocument.load(bytes, { ignoreEncryption: true }))
                .then((d) => setPageCount(d.getPageCount()))
                .catch(() => setPageCount(null));
            } else {
              setPageCount(null);
            }
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
          hint="One PDF at a time"
          emptyLabel="Drop a PDF here"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Pages to rotate" hint="Leave empty to rotate every page">
            <Input
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder={pageCount ? `e.g. 2 or 1-3 (all: ${pageCount} pages)` : 'all'}
              aria-label="Pages to rotate"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Angle">
              <Select value={angle} onChange={(e) => setAngle(e.target.value as typeof angle)} aria-label="Angle">
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </Select>
            </Field>
            <Field label="Direction">
              <Select
                value={clockwise ? 'cw' : 'ccw'}
                onChange={(e) => setClockwise(e.target.value === 'cw')}
                aria-label="Direction"
              >
                <option value="cw">Clockwise</option>
                <option value="ccw">Counter-clockwise</option>
              </Select>
            </Field>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={rotate} disabled={!file || !pageCount || busy}>
            {busy ? 'Rotating…' : 'Rotate pages'}
          </Button>
          {result ? (
            <Button variant="secondary" size="lg" onClick={() => setResult(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Working in your browser…" /> : null}

      {result ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>
            Rotated {result.rotated} page{result.rotated > 1 ? 's' : ''} {parseInt(angle, 10)}° {clockwise ? 'clockwise' : 'counter-clockwise'}.
          </SuccessNote>
          <div className="mt-4 flex justify-end">
            <DownloadButton blob={result.blob} filename="rotated.pdf" />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
