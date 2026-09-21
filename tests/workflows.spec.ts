import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { TOOLS } from '../src/registry';
import { EXTRA_SPECS } from '../src/registry/extra';
import { TEXT_SAMPLES } from '../src/lib/extended-text';

type Upload = { name: string; mimeType: string; buffer: Buffer };
let word: Upload, word2: Upload, pdf: Upload, xlsx: Upload, zip: Upload;
test.beforeAll(async () => {
  const makeWord = async (text: string) =>
    Packer.toBuffer(
      new Document({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text, bold: true, size: 36 })] }),
              new Paragraph('A private document conversion, made with Toolbox.'),
            ],
          },
        ],
      }),
    );
  word = {
    name: 'Proposal.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: await makeWord('A small proposal'),
  };
  word2 = { ...word, name: 'Appendix.docx', buffer: await makeWord('An appendix') };
  const doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < 2; i++)
    doc.addPage([595.28, 841.89]).drawText(`Toolbox test page ${i + 1}`, { font, x: 50, y: 740 });
  pdf = { name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await doc.save()) };
  const book = new ExcelJS.Workbook();
  book.addWorksheet('People').addRows([
    ['Name', 'Hours'],
    ['Alex', 24],
    ['Sam', 32],
  ]);
  book.addWorksheet('Places').addRows([['City'], ['London']]);
  xlsx = {
    name: 'sample.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(await book.xlsx.writeBuffer()),
  };
  const z = new JSZip();
  z.file('hello.txt', 'Hello Toolbox');
  zip = {
    name: 'files.zip',
    mimeType: 'application/zip',
    buffer: await z.generateAsync({ type: 'nodebuffer' }),
  };
});
async function download(page: Page, name: RegExp) {
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name }).click();
  const d = await promise;
  expect(await d.failure()).toBeNull();
  return { name: d.suggestedFilename(), buffer: await readFile((await d.path())!) };
}
async function image(page: Page): Promise<Upload> {
  const data = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 80;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ed713c';
    ctx.fillRect(0, 0, 120, 80);
    ctx.fillStyle = '#253526';
    ctx.fillRect(15, 15, 40, 40);
    return c.toDataURL().split(',')[1];
  });
  return { name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
}
for (const group of ['original', 'new'])
  test(`all ${group} tool routes load without runtime errors`, async ({ page }) => {
    test.setTimeout(300000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const list = TOOLS.filter((t) => (group === 'new' ? t.tags.includes('new') : !t.tags.includes('new')));
    for (const tool of list) {
      await page.goto(`/tools/${tool.slug}`);
      await expect(page.locator('h1').first()).toContainText(tool.name);
      await expect(page.getByText('Loading tool…', { exact: true })).toHaveCount(0);
      await expect(page.getByText('This workspace could not load.', { exact: false })).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'text'))
  test(`${spec.name}: example → run → download`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    await page.getByRole('button', { name: 'Try an example' }).click();
    await expect(page.getByLabel('Input', { exact: true })).toHaveValue(TEXT_SAMPLES[spec.slug]);
    await page.getByRole('button', { name: 'Run tool', exact: true }).click();
    await expect(page.getByLabel('Result', { exact: true })).not.toHaveValue('');
    await expect(page.getByRole('alert')).toHaveCount(0);
    const file = await download(page, /Download result/);
    expect(file.buffer.length).toBeGreaterThan(0);
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'calculator'))
  test(`${spec.name}: calculate → export`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    await expect(page.locator('.result-stat').first()).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    const file = await download(page, /Download results/);
    expect(file.buffer.toString()).toContain(spec.name);
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'documents'))
  test(`${spec.name}: content → convert → valid download`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    if (['text-to-word', 'text-to-pdf', 'markdown-to-pdf'].includes(spec.slug))
      await page.getByRole('button', { name: 'Try an example' }).click();
    else if (spec.slug === 'combine-word-to-pdf') {
      await page.locator('input[type=file]').setInputFiles([word, word2]);
      await page.getByRole('button', { name: 'Move Appendix.docx up', exact: true }).click();
      await expect(page.locator('.document-order>div').first()).toContainText('Appendix.docx');
    } else if (spec.slug === 'documents-to-pdf')
      await page.locator('input[type=file]').setInputFiles([word, pdf, await image(page)]);
    else await page.locator('input[type=file]').setInputFiles(spec.slug === 'pdf-to-word' ? pdf : word);
    await page
      .getByRole('button', { name: /^(Create PDF|Combine & create PDF|Create Word document|Extract text)$/ })
      .click();
    await expect(page.getByText('All done. Ready for your next step.')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    const file = await download(page, /^Download (PDF|DOCX|TXT)$/);
    if (file.name.endsWith('.pdf')) {
      const doc = await PDFDocument.load(file.buffer);
      expect(doc.getPageCount()).toBe(
        spec.slug === 'combine-word-to-pdf' ? 2 : spec.slug === 'documents-to-pdf' ? 4 : 1,
      );
      expect(file.buffer.length).toBeGreaterThan(3000);
    } else if (file.name.endsWith('.docx')) {
      const doc = await JSZip.loadAsync(file.buffer);
      expect(await doc.file('word/document.xml')!.async('string')).toContain(
        spec.slug === 'pdf-to-word' ? 'Toolbox test page' : 'Small tools.',
      );
    } else expect(file.buffer.toString()).toContain('A small proposal');
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'pdf'))
  test(`${spec.name}: upload → process → valid download`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    await page.locator('input[type=file]').setInputFiles(pdf);
    await page
      .getByRole('button', {
        name: spec.slug === 'pdf-to-text' ? 'Extract text' : 'Process PDF',
        exact: true,
      })
      .click();
    await expect(page.getByText('Your document is ready.')).toBeVisible();
    const file = await download(page, /Download result/);
    if (spec.slug === 'pdf-to-text') expect(file.buffer.toString()).toContain('Toolbox test page 1');
    else {
      const doc = await PDFDocument.load(file.buffer);
      expect(doc.getPageCount()).toBe(spec.slug === 'pdf-duplicate' ? 4 : 2);
    }
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'spreadsheet'))
  test(`${spec.name}: convert → preview → export`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    const text = ['csv-to-excel', 'json-to-excel'].includes(spec.slug);
    if (text) await page.getByRole('button', { name: 'Try an example' }).click();
    else await page.locator('input[type=file]').setInputFiles(xlsx);
    await page
      .getByRole('button', { name: text ? 'Create Excel workbook' : 'Open workbook', exact: true })
      .click();
    await expect(page.locator('table')).toContainText('Alex');
    await expect(page.getByRole('alert')).toHaveCount(0);
    if (!text) {
      await page.getByLabel('Worksheet', { exact: true }).selectOption('1');
      await expect(page.locator('table')).toContainText('London');
      await page.getByLabel('Worksheet', { exact: true }).selectOption('0');
    }
    const file = await download(page, /Download (XLSX|CSV|JSON)/);
    if (text) {
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(file.buffer as never);
      expect(book.worksheets[0].rowCount).toBe(3);
    } else expect(file.buffer.toString()).toContain('Alex');
  });
for (const spec of EXTRA_SPECS.filter((s) => s.engine === 'image'))
  test(`${spec.name}: upload → transform → PNG`, async ({ page }) => {
    await page.goto(`/tools/${spec.slug}`);
    const png = await image(page);
    await page
      .locator('input[type=file]')
      .setInputFiles(spec.slug === 'image-collage' ? [png, { ...png, name: 'second.png' }] : png);
    await page.getByRole('button', { name: 'Process image', exact: true }).click();
    await expect(page.getByAltText('Processed image preview')).toBeVisible();
    const file = await download(page, /Download PNG/);
    expect(file.buffer.subarray(1, 4).toString()).toBe('PNG');
    if (spec.slug === 'image-rotate-flip') {
      expect(file.buffer.readUInt32BE(16)).toBe(80);
      expect(file.buffer.readUInt32BE(20)).toBe(120);
    }
  });
test('Create ZIP keeps duplicate filenames and downloads a readable archive', async ({ page }) => {
  await page.goto('/tools/zip-creator');
  await page.getByLabel('Choose files').setInputFiles([
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('world') },
  ]);
  await page.getByRole('button', { name: 'Create ZIP', exact: true }).click();
  const file = await download(page, /Download ZIP/);
  const z = await JSZip.loadAsync(file.buffer);
  expect(await z.file('notes.txt')!.async('string')).toBe('hello');
  expect(await z.file('notes (2).txt')!.async('string')).toBe('world');
});
test('Extract ZIP downloads the real entry', async ({ page }) => {
  await page.goto('/tools/zip-extractor');
  await page.getByLabel('Choose files').setInputFiles(zip);
  await page.getByRole('button', { name: 'Open ZIP', exact: true }).click();
  const file = await download(page, /^Download$/);
  expect(file.name).toBe('hello.txt');
  expect(file.buffer.toString()).toBe('Hello Toolbox');
});
test('File checksum is correct', async ({ page }) => {
  await page.goto('/tools/file-hash');
  await page
    .getByLabel('Choose files')
    .setInputFiles({ name: 'abc.txt', mimeType: 'text/plain', buffer: Buffer.from('abc') });
  await page.getByRole('button', { name: 'Calculate SHA-256' }).click();
  await expect(page.locator('.result-panel pre')).toHaveText(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});
test('Search intent, filters, favorites, URL state, and clear action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Search tools' }).fill('combine word docx into pdf');
  await page.getByRole('combobox', { name: 'Search tools' }).press('Enter');
  await expect(page).toHaveURL(/combine-word-to-pdf/);
  await page.goto('/tools');
  await page.getByLabel('Filter tools').fill('word to pdf');
  await expect(page.locator('.tool-card').first()).toContainText('Word to PDF');
  await expect(page.getByRole('heading', { name: 'Combine Word to PDF', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save Word to PDF', exact: true }).click();
  await page.goto('/tools?view=favorites');
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.tool-card')).toContainText('Word to PDF');
  await page.getByRole('button', { name: 'Unsave Word to PDF' }).click();
  await expect(page.getByText('A little empty. A lot of potential.')).toBeVisible();
  await page.goto('/tools?view=new');
  await expect(page.locator('.tool-card')).toHaveCount(64);
});
test('Existing PDF to Image accepts a PDF MIME type and actually renders', async ({ page }) => {
  await page.goto('/tools/pdf-to-image');
  await page.locator('input[type=file]').setInputFiles(pdf);
  await page.getByRole('button', { name: /Convert to images/ }).click();
  await expect(page.getByAltText('Page 1', { exact: true })).toBeVisible();
  await expect(page.getByAltText('Page 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
test('Invalid documents show recoverable errors', async ({ page }) => {
  await page.goto('/tools/word-to-pdf');
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'broken.docx', mimeType: word.mimeType, buffer: Buffer.from('not a document') });
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(word);
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click();
  await expect(page.getByText('All done. Ready for your next step.')).toBeVisible();
});
test('Mobile homepage, menu, tool, and dark theme stay in bounds', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Small tools.');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'All tools', exact: true })
    .click();
  await expect(page).toHaveURL(/\/tools$/);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.goto('/tools/combine-word-to-pdf');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('DOCX explicit page breaks, tables, and preview pagination survive conversion', async ({ page }) => {
  const { PageBreak, Table, TableRow, TableCell } = await import('docx');
  const content = await Packer.toBuffer(
    new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: 'Résumé — café', bold: true, size: 34 })] }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Name')] }),
                    new TableCell({ children: [new Paragraph('Hours')] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph('A deliberate second page.'),
          ],
        },
      ],
    }),
  );
  await page.goto('/tools/word-to-pdf');
  await page.locator('input[type=file]').setInputFiles({ ...word, buffer: content });
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click();
  await expect(page.getByText('All done. Ready for your next step.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.locator('.preview-toolbar')).toContainText('2 / 2');
  await expect(page.getByRole('button', { name: 'Previous page', exact: true })).toBeEnabled();
  const darkPixels = await page.locator('.pdf-preview canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let dark = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] < 200) dark++;
    return dark;
  });
  expect(darkPixels).toBeGreaterThan(50);
  const file = await download(page, /^Download PDF$/);
  expect((await PDFDocument.load(file.buffer)).getPageCount()).toBe(2);
});

test('Long text produces multiple nonempty PDF pages without a giant canvas', async ({ page }) => {
  await page.goto('/tools/text-to-pdf');
  await page
    .getByLabel('Document content')
    .fill(
      Array.from(
        { length: 160 },
        (_, i) => `Line ${i + 1}: a little less busywork, a little more flow.`,
      ).join('\n'),
    );
  await page.getByRole('button', { name: 'Create PDF', exact: true }).click();
  await expect(page.getByText('All done. Ready for your next step.')).toBeVisible();
  const file = await download(page, /^Download PDF$/);
  const result = await PDFDocument.load(file.buffer);
  expect(result.getPageCount()).toBeGreaterThan(3);
  expect(result.getPageCount()).toBeLessThan(6);
});
