import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
export interface PdfOptions {
  text?: string;
  opacity?: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  size?: string;
  copies?: number;
  start?: number;
}
export async function processPdf(slug: string, bytes: ArrayBuffer | Uint8Array, o: PdfOptions = {}) {
  const src = await PDFDocument.load(bytes);
  if (src.getPageCount() > 500) throw Error('Please use documents of 500 pages or fewer.');
  let pdf = src;
  if (slug === 'pdf-reverse' || slug === 'pdf-duplicate') {
    pdf = await PDFDocument.create();
    const indices = src.getPageIndices();
    if (slug === 'pdf-reverse') indices.reverse();
    const copies = slug === 'pdf-duplicate' ? (o.copies ?? 2) : 1;
    if (!Number.isInteger(copies) || copies < 1 || copies > 10 || copies * indices.length > 500)
      throw Error('Use 1–10 copies, with at most 500 output pages.');
    for (let i = 0; i < copies; i++) {
      for (const page of await pdf.copyPages(src, indices)) pdf.addPage(page);
    }
  } else if (slug === 'pdf-resize') {
    const sizes: Record<string, [number, number]> = {
      A4: [595.28, 841.89],
      Letter: [612, 792],
      A3: [841.89, 1190.55],
    };
    const size = sizes[o.size || 'A4'];
    if (!size) throw Error('Choose A4, A3, or Letter.');
    pdf = await PDFDocument.create();
    for (const old of src.getPages()) {
      const angle = ((old.getRotation().angle % 360) + 360) % 360;
      const embedded = await pdf.embedPage(old);
      const swapped = angle === 90 || angle === 270;
      const w = swapped ? embedded.height : embedded.width,
        h = swapped ? embedded.width : embedded.height,
        scale = Math.min(size[0] / w, size[1] / h);
      const x = (size[0] - w * scale) / 2,
        y = (size[1] - h * scale) / 2;
      const page = pdf.addPage(size);
      page.drawPage(embedded, {
        x: x + (angle === 180 || angle === 270 ? w * scale : 0),
        y: y + (angle === 90 || angle === 180 ? h * scale : 0),
        width: embedded.width * scale,
        height: embedded.height * scale,
        rotate: degrees(-angle),
      });
    }
  } else if (slug === 'pdf-metadata-editor') {
    pdf.setTitle(o.title || '');
    pdf.setAuthor(o.author || '');
    pdf.setSubject(o.subject || '');
    pdf.setKeywords(
      (o.keywords || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } else if (slug === 'pdf-watermark' || slug === 'pdf-page-numbers') {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    let start = o.start ?? 1;
    if (!Number.isSafeInteger(start) || start < 0)
      throw Error('Start number must be a non-negative whole number.');
    for (const [i, page] of pdf.getPages().entries()) {
      const { width, height } = page.getSize();
      const text =
        slug === 'pdf-watermark' ? o.text || 'DRAFT' : `${start + i} / ${start + pdf.getPageCount() - 1}`;
      try {
        font.encodeText(text);
      } catch {
        throw Error('Watermark text supports Latin characters. Please use a Latin-character watermark.');
      }
      const size = slug === 'pdf-watermark' ? Math.min(52, width / Math.max(2, text.length * 0.6)) : 10;
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: Math.max(8, (width - textWidth) / 2),
        y: slug === 'pdf-watermark' ? height / 2 : 18,
        font,
        size,
        color: rgb(0.35, 0.35, 0.35),
        opacity: slug === 'pdf-watermark' ? Math.max(0.05, Math.min(1, o.opacity ?? 0.25)) : 1,
      });
    }
  } else throw Error('Unknown PDF tool.');
  return { bytes: await pdf.save(), pages: pdf.getPageCount() };
}
