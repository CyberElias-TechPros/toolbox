import { PDFDocument } from 'pdf-lib';
import { uint8ToBlob } from './utils';
export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  GlobalWorkerOptions.workerSrc = worker.default;
  const task = getDocument({ data: new Uint8Array(data) });
  try {
    const pdf = await task.promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ('str' in item ? item.str + ('hasEOL' in item && item.hasEOL ? '\n' : ' ') : ''))
          .join('')
          .trim(),
      );
    }
    return pages.join('\n\n');
  } finally {
    await task.destroy();
  }
}
export async function createWord(text: string): Promise<Blob> {
  if (text.length > 100000) throw Error('Please use 100,000 characters or fewer.');
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  return Packer.toBlob(
    new Document({
      sections: [
        {
          children: text
            .split(/\r?\n/)
            .map((line) => new Paragraph({ children: [new TextRun(line)], spacing: { after: 120 } })),
        },
      ],
    }),
  );
}
export function validateFiles(files: File[], maxMB = 50) {
  if (!files.length) throw Error('Add at least one file first.');
  if (files.length > 40) throw Error('Please work with 40 files or fewer at a time.');
  if (files.reduce((sum, f) => sum + f.size, 0) > maxMB * 1024 * 1024)
    throw Error(`Please keep the total input size under ${maxMB} MB.`);
  if (files.some((f) => !f.size)) throw Error('One of your files is empty. Remove it and try again.');
}
export async function imageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 40_000_000)
      throw Error('Use an image below 40 megapixels.');
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw Error('Canvas is not available.');
    ctx.drawImage(image, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function appendCanvas(
  pdf: PDFDocument,
  canvas: HTMLCanvasElement,
  pageWidth = 595.28,
  pageHeight = 841.89,
  fitSingle = false,
) {
  const margin = fitSingle ? 28 : 0,
    usable = pageWidth - 2 * margin;
  const sliceHeight = fitSingle ? canvas.height : Math.ceil(canvas.width * (pageHeight / pageWidth));
  if (!canvas.width || !canvas.height) throw Error('The document rendered an empty page.');
  for (let y = 0; y < canvas.height; y += sliceHeight) {
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = Math.min(sliceHeight, canvas.height - y);
    const ctx = slice.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, slice.width, slice.height, 0, 0, slice.width, slice.height);
    const image = await pdf.embedJpg(slice.toDataURL('image/jpeg', 0.94));
    const page = pdf.addPage([pageWidth, pageHeight]);
    const scale = fitSingle
      ? Math.min(usable / slice.width, (pageHeight - 2 * margin) / slice.height)
      : pageWidth / slice.width;
    const w = slice.width * scale,
      h = slice.height * scale;
    page.drawImage(image, {
      x: fitSingle ? (pageWidth - w) / 2 : 0,
      y: fitSingle ? (pageHeight - h) / 2 : pageHeight - h,
      width: w,
      height: h,
    });
    slice.width = 0;
    slice.height = 0;
  }
}
async function captureElement(pdf: PDFDocument, element: HTMLElement, width = 595.28, height = 841.89) {
  const html2canvas = (await import('html2canvas')).default;
  const totalHeight = Math.max(element.scrollHeight, element.offsetHeight);
  const pagePixels = Math.ceil((element.offsetWidth * height) / width);
  if (totalHeight / pagePixels > 200) throw Error('Please split this document into fewer than 200 pages.');
  // Capture one viewport-sized page at a time instead of allocating an enormous canvas.
  for (let y = 0; y < totalHeight; y += pagePixels) {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: false,
      windowWidth: 1000,
      y,
      height: Math.min(pagePixels, totalHeight - y),
    });
    try {
      await appendCanvas(pdf, canvas, width, height);
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
export async function appendDocx(pdf: PDFDocument, file: File, host: HTMLElement) {
  const data = await file.arrayBuffer();
  await (await import('./archives')).openZip(data);
  const { renderAsync } = await import('docx-preview');
  host.replaceChildren();
  await renderAsync(data, host, undefined, {
    inWrapper: true,
    breakPages: true,
    ignoreLastRenderedPageBreak: false,
    renderHeaders: true,
    renderFooters: true,
    renderFootnotes: true,
    useBase64URL: true,
  });
  await document.fonts.ready;
  await Promise.all(
    Array.from(host.querySelectorAll('img')).map((img) => img.decode().catch(() => undefined)),
  );
  // Sanitize document-derived elements, preserving the layout but preventing embedded active content.
  const DOMPurify = (await import('dompurify')).default;
  for (const section of Array.from(host.querySelectorAll<HTMLElement>('section.docx'))) {
    DOMPurify.sanitize(section, {
      IN_PLACE: true,
      ADD_TAGS: ['style'],
      ADD_ATTR: ['style'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['srcset'],
    });
    const width = section.offsetWidth || 794;
    const specifiedHeight = parseFloat(getComputedStyle(section).minHeight) || 1123;
    const ratio = specifiedHeight / width;
    await captureElement(pdf, section, 595.28, 595.28 * ratio);
  }
  if (!pdf.getPageCount())
    throw Error('No pages were found in this Word file. Please check that it is a valid .docx document.');
}
export async function renderTextPdf(text: string, host: HTMLElement, markdown = false): Promise<Blob> {
  if (!text.trim()) throw Error('Add some text first.');
  if (text.length > 100000) throw Error('Please use 100,000 characters or fewer.');
  host.replaceChildren();
  const element = document.createElement('div');
  element.style.cssText =
    'box-sizing:border-box;width:794px;min-height:1123px;padding:64px;background:white;color:#222;font:16px/1.65 Arial,sans-serif;overflow-wrap:anywhere;white-space:pre-wrap;';
  if (markdown) {
    const { mdToHtml } = await import('./markdown');
    const DOMPurify = (await import('dompurify')).default;
    element.style.whiteSpace = 'normal';
    element.innerHTML = DOMPurify.sanitize(mdToHtml(text));
    const style = document.createElement('style');
    style.textContent =
      '.text-pdf-content h1{font-size:32px;margin:20px 0 12px;font-weight:bold}.text-pdf-content h2{font-size:24px;margin:18px 0 10px;font-weight:bold}.text-pdf-content h3{font-size:20px;font-weight:bold}.text-pdf-content p,.text-pdf-content ul,.text-pdf-content ol,.text-pdf-content pre{margin:12px 0}.text-pdf-content ul{list-style:disc;padding-left:24px}.text-pdf-content ol{list-style:decimal;padding-left:24px}.text-pdf-content pre{white-space:pre-wrap;background:#f2f2f2;padding:16px}.text-pdf-content blockquote{border-left:3px solid #ccc;padding-left:15px}.text-pdf-content a{color:#b4532d;text-decoration:underline}';
    element.className = 'text-pdf-content';
    host.append(style);
  } else {
    element.textContent = text;
  }
  host.append(element);
  const pdf = await PDFDocument.create();
  await captureElement(pdf, element);
  return uint8ToBlob(await pdf.save(), 'application/pdf');
}
export async function combineDocuments(
  files: File[],
  host: HTMLElement,
  progress: (done: number) => void,
): Promise<{ blob: Blob; pages: number }> {
  validateFiles(files);
  const pdf = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    if (pdf.getPageCount() > 500) throw Error('Please use fewer than 500 output pages.');
    const file = files[i],
      ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'pdf') {
        const src = await PDFDocument.load(await file.arrayBuffer());
        const pages = await pdf.copyPages(src, src.getPageIndices());
        pages.forEach((page) => pdf.addPage(page));
      } else if (ext === 'docx') {
        await appendDocx(pdf, file, host);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        const canvas = await imageToCanvas(file);
        await appendCanvas(pdf, canvas, 595.28, 841.89, true);
        canvas.width = 0;
        canvas.height = 0;
      } else throw Error('Unsupported file format.');
    } catch (e) {
      throw Error(`${file.name}: ${(e as Error).message}`);
    }
    progress(i + 1);
  }
  if (pdf.getPageCount() > 500) throw Error('Please split this task into fewer than 500 output pages.');
  return { blob: uint8ToBlob(await pdf.save(), 'application/pdf'), pages: pdf.getPageCount() };
}
