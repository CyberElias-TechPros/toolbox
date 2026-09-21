import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc = workerUrl;
/** Render locally, without an iframe, external viewer, or uploading the result. */
export default function PdfPreview({ blob }: { blob: Blob }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null),
    [pageNo, setPageNo] = useState(1),
    [busy, setBusy] = useState(true),
    [error, setError] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof getDocument> | undefined;
    setDoc(null);
    setPageNo(1);
    setBusy(true);
    setError('');
    blob
      .arrayBuffer()
      .then((data) => {
        if (cancelled) return;
        task = getDocument({ data: new Uint8Array(data) });
        return task.promise;
      })
      .then((pdf) => {
        if (pdf && !cancelled) setDoc(pdf);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Preview unavailable. You can still download your document.');
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [blob]);
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    let task: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    setBusy(true);
    doc
      .getPage(pageNo)
      .then((page) => {
        if (cancelled || !canvas.current) return;
        const viewport = page.getViewport({
          scale: Math.min(1.4, 760 / page.getViewport({ scale: 1 }).width),
        });
        const el = canvas.current;
        el.width = Math.ceil(viewport.width);
        el.height = Math.ceil(viewport.height);
        task = page.render({ canvas: el, canvasContext: el.getContext('2d')!, viewport });
        return task.promise;
      })
      .then(() => {
        if (!cancelled) setBusy(false);
      })
      .catch((e) => {
        if (!cancelled && e.name !== 'RenderingCancelledException') {
          setError('Preview unavailable. Download to view the document.');
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNo]);
  return (
    <div className="pdf-preview">
      <div className="preview-toolbar">
        <span>DOCUMENT PREVIEW</span>
        <div>
          <button
            aria-label="Previous page"
            disabled={!doc || pageNo === 1 || busy}
            onClick={() => setPageNo((n) => n - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>{doc ? `${pageNo} / ${doc.numPages}` : 'Loading…'}</span>
          <button
            aria-label="Next page"
            disabled={!doc || pageNo === doc.numPages || busy}
            onClick={() => setPageNo((n) => n + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <span>PRIVATE & LOCAL</span>
      </div>
      {error ? (
        <p className="p-6 text-xs text-zinc-500">{error}</p>
      ) : (
        <div className="preview-canvas-wrap" aria-busy={busy}>
          <canvas ref={canvas} aria-label={`Preview of PDF page ${pageNo}`} />
          {busy && (
            <span className="preview-loading" role="status">
              Rendering preview…
            </span>
          )}
        </div>
      )}
    </div>
  );
}
