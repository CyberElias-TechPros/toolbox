import { useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import { Button, Card, ErrorNote, InfoNote, Spinner, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { uint8ToBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { DownloadButton } from '../image/shared';

type Mode = 'range' | 'each';

interface Extracted {
  name: string;
  blob: Blob;
  pages: number;
}

/** Parse "1-3, 5, 8-10" into a sorted, de-duplicated list of 1-based pages. */
export function parsePageRanges(input: string, maxPage: number): number[] {
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const pages = new Set<number>();
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (a > b) throw new Error(`Range “${part}” is backwards (start is larger than end).`);
      for (let p = a; p <= b; p++) {
        if (p > maxPage) throw new Error(`Page ${p} does not exist — this document has ${maxPage} page${maxPage > 1 ? 's' : ''}.`);
        pages.add(p);
      }
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p > maxPage) throw new Error(`Page ${p} does not exist — this document has ${maxPage} page${maxPage > 1 ? 's' : ''}.`);
      pages.add(p);
    } else {
      throw new Error(`“${part}” is not a valid page or range. Use forms like 3 or 2-5, separated by commas.`);
    }
  }
  if (pages.size === 0) throw new Error('Enter at least one page, e.g. “1-3, 5”.');
  return [...pages].sort((a, b) => a - b);
}

export default function Splitter() {
  const [files, setFiles] = useState<DropFile[]>([]);
  const [mode, setMode] = useState<Mode>('range');
  const [range, setRange] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [results, setResults] = useState<Extracted[] | null>(null);

  const file = files[0]?.file ?? null;

  const allPages = useMemo(() => (pageCount ? Array.from({ length: pageCount }, (_, i) => i + 1).join(', ') : ''), [pageCount]);

  async function extract() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = src.getPageCount();
      const out: Extracted[] = [];

      if (mode === 'each') {
        for (let p = 0; p < pageCount; p++) {
          const doc = await PDFDocument.create();
          const [page] = await doc.copyPages(src, [p]);
          doc.addPage(page);
          const b = await doc.save();
          out.push({ name: `${base(file.name)}-page-${p + 1}.pdf`, blob: uint8ToBlob(b, 'application/pdf'), pages: 1 });
        }
      } else {
        const pages = parsePageRanges(range, pageCount);
        const doc = await PDFDocument.create();
        const copied = await doc.copyPages(src, pages.map((p) => p - 1));
        copied.forEach((p) => doc.addPage(p));
        const b = await doc.save();
        out.push({ name: `${base(file.name)}-pages-${pages.join('-')}.pdf`, blob: uint8ToBlob(b, 'application/pdf'), pages: pages.length });
      }
      setResults(out);
      track('tool_completed', 'pdf-splitter');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction failed. The file may not be a valid PDF.');
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
            setResults(null);
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

        {pageCount ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            This document has <span className="font-medium text-zinc-800 dark:text-zinc-200">{pageCount} page{pageCount > 1 ? 's' : ''}</span> (pages 1–{pageCount}).
          </p>
        ) : null}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Extract mode">
            <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label="Extract mode">
              <option value="range">Specific pages → one PDF</option>
              <option value="each">Every page → separate files</option>
            </Select>
          </Field>
          {mode === 'range' ? (
            <Field label="Pages to keep" hint='Comma-separated, e.g. "1-3, 5"'>
              <div className="flex gap-2">
                <Input
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder={pageCount ? `1-${pageCount}` : '1-3, 5'}
                  aria-label="Page range"
                />
                {pageCount ? (
                  <Button variant="secondary" size="sm" className="h-auto" onClick={() => setRange(allPages)}>
                    All
                  </Button>
                ) : null}
              </div>
            </Field>
          ) : (
            <div className="flex items-end pb-1 text-xs text-zinc-500 dark:text-zinc-400">
              You’ll download {pageCount ?? 'each'} single-page PDFs.
            </div>
          )}
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={extract} disabled={!file || busy || (mode === 'range' && !range.trim())}>
            {busy ? 'Extracting…' : 'Extract pages'}
          </Button>
          {results ? (
            <Button variant="secondary" size="lg" onClick={() => setResults(null)}>
              Start over
            </Button>
          ) : null}
        </div>
      </Card>

      {busy ? <Spinner label="Working in your browser…" /> : null}

      {results ? (
        <Card className="p-5 sm:p-6">
          <SuccessNote>
            Extracted {results.length} file{results.length > 1 ? 's' : ''} ({results.reduce((s, r) => s + r.pages, 0)} pages total).
          </SuccessNote>
          <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {results.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0 truncate text-sm font-medium">{r.name}</span>
                <DownloadButton blob={r.blob} filename={r.name} />
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <InfoNote>Want to delete pages instead? Enter the pages you want to keep and download the result.</InfoNote>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function base(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}
