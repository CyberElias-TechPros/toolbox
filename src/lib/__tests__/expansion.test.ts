import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { transformText, TEXT_SAMPLES, convertBase } from '../extended-text';
import { calculate, CALCULATOR_FIELDS } from '../calculators';
import { createWorkbook, readWorkbook, rowsToCsv, rowsToObjects, jsonToRows } from '../spreadsheets';
import { processPdf } from '../pdf-tools';
import { openZip, uniqueFilename } from '../archives';
import { EXTRA_SPECS } from '../../registry/extra';
import { TOOLS } from '../../registry';
import { searchTools } from '../search';

describe('Every new text tool has a working example', () => {
  for (const [slug, sample] of Object.entries(TEXT_SAMPLES))
    it(slug, async () => {
      const output = await transformText(slug, sample, {
        find: 'world',
        replace: 'day',
        count: 3,
        base: 10,
        target: 16,
        secret: 'key',
      });
      expect(output.length).toBeGreaterThan(0);
    });
});
describe('Text transformations are correct and reject invalid input', () => {
  it('round-trips Unicode through binary', async () => {
    const original = 'Héllo 🌍 世界';
    expect(await transformText('binary-to-text', await transformText('text-to-binary', original))).toBe(
      original,
    );
  });
  it('reverses graphemes, not emoji code units', async () =>
    expect(await transformText('reverse-text', 'Hi 👨‍👩‍👧‍👦')).toBe('👨‍👩‍👧‍👦 iH'));
  it('deduplicates lines without reordering', async () =>
    expect(await transformText('remove-duplicate-lines', 'b\na\nb')).toBe('b\na'));
  it('escapes and decodes markup', async () =>
    expect(
      await transformText('html-entity-decoder', await transformText('html-entity-encoder', '<b>"&</b>')),
    ).toBe('<b>"&</b>'));
  it('literal replacement does not interpret dollar patterns', async () =>
    expect(await transformText('find-replace', 'hello hello', { find: 'hello', replace: '$&' })).toBe(
      '$& $&',
    ));
  it('sorts nested keys without sorting arrays', async () =>
    expect(JSON.parse(await transformText('json-key-sorter', '{"z":[2,1],"a":{"z":0,"a":1}}'))).toEqual({
      a: { a: 1, z: 0 },
      z: [2, 1],
    }));
  it('uses arbitrary precision number bases', () =>
    expect(convertBase('18446744073709551615', 10, 16)).toBe('FFFFFFFFFFFFFFFF'));
  it('rejects invalid digits', () => expect(() => convertBase('102', 2, 10)).toThrow());
  it('rejects incomplete binary', async () =>
    expect(transformText('binary-to-text', '101')).rejects.toThrow());
  it('rejects broken JSON', async () => expect(transformText('json-to-yaml', '{broken}')).rejects.toThrow());
  it('rejects XML entities', async () =>
    expect(transformText('xml-to-json', '<!DOCTYPE x [<!ENTITY x "a">]><x>&x;</x>')).rejects.toThrow());
  it('bounds repeated text', async () =>
    expect(transformText('text-repeater', 'hello', { count: 10001 })).rejects.toThrow());
  it('HMAC agrees with a known SHA-256 vector', async () =>
    expect(
      await transformText('hmac-generator', 'The quick brown fox jumps over the lazy dog', { secret: 'key' }),
    ).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'));
});
describe('Every calculator produces finite results', () => {
  for (const [slug, fields] of Object.entries(CALCULATOR_FIELDS))
    it(slug, () => {
      const result = calculate(slug, Object.fromEntries(fields.map((f) => [f.key, f.value])));
      expect(Object.keys(result).length).toBeGreaterThan(1);
      expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
    });
  it('handles zero-interest loans', () =>
    expect(calculate('loan-calculator', { amount: '1200', rate: '0', years: '1' })['Monthly payment']).toBe(
      '100',
    ));
  it('computes exact simplified fractions', () =>
    expect(calculate('fraction-calculator', { a: '1', b: '2', c: '1', d: '3' })['Simplified sum']).toBe(
      '5/6',
    ));
  it('rejects division by zero', () =>
    expect(() => calculate('bmi-calculator', { weight: '70', height: '0' })).toThrow());
  it('handles leap days in UTC', () =>
    expect(calculate('date-difference', { start: '2024-02-28', end: '2024-03-01' })['Days apart']).toBe(2));
  it('handles negative averages', () =>
    expect(calculate('average-calculator', { numbers: '-10, 0, 10' })['Mean']).toBe('0'));
  it('rejects fractional people', () =>
    expect(() => calculate('tip-calculator', { amount: '100', rate: '20', people: '1.5' })).toThrow());
});
async function fixture() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < 3; i++) {
    const p = pdf.addPage([300 + i * 10, 400 + i * 10]);
    p.drawText(`Page ${i + 1}`, { x: 20, y: 200, font });
  }
  return pdf.save();
}
describe('PDF operations create valid downloadable documents', () => {
  for (const slug of [
    'pdf-watermark',
    'pdf-page-numbers',
    'pdf-metadata-editor',
    'pdf-resize',
    'pdf-reverse',
    'pdf-duplicate',
  ])
    it(slug, async () => {
      const out = await processPdf(slug, await fixture(), { text: 'DRAFT', copies: 2, title: 'New title' });
      const pdf = await PDFDocument.load(out.bytes);
      expect(pdf.getPageCount()).toBe(slug === 'pdf-duplicate' ? 6 : 3);
      if (slug === 'pdf-reverse') expect(pdf.getPage(0).getWidth()).toBe(320);
      if (slug === 'pdf-resize') expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28);
      if (slug === 'pdf-metadata-editor') expect(pdf.getTitle()).toBe('New title');
    });
  it('validates copy count', async () =>
    expect(processPdf('pdf-duplicate', await fixture(), { copies: 0 })).rejects.toThrow());
  it('reports unsupported watermark characters', async () =>
    expect(processPdf('pdf-watermark', await fixture(), { text: '你好' })).rejects.toThrow('Latin'));
  it('resizes rotated pages without errors', async () => {
    const pdf = await PDFDocument.load(await fixture());
    pdf.getPage(0).setRotation(degrees(90));
    expect((await processPdf('pdf-resize', await pdf.save())).pages).toBe(3);
  });
});
describe('Spreadsheet and archive round trips', () => {
  it('exports a real XLSX and reads every row', async () => {
    const rows = [
      ['Name', 'Note'],
      ['Alex', 'hello, world'],
      ['Sam', 'Line 1\nLine 2'],
    ];
    const bytes = await createWorkbook(rows);
    const result = await readWorkbook(bytes.buffer as ArrayBuffer);
    expect(result[0].rows).toEqual(rows);
  });
  it('normalizes JSON values', () =>
    expect(jsonToRows('[{"a":1,"b":null},{"a":2,"c":{"x":1}}]')).toEqual([
      ['a', 'b', 'c'],
      ['1', '', ''],
      ['2', '', '{"x":1}'],
    ]));
  it('keeps duplicate spreadsheet headers unique', () =>
    expect(
      rowsToObjects([
        ['name', 'name', 'name_2'],
        ['a', 'b', 'c'],
      ]),
    ).toEqual([{ name: 'a', name_2: 'b', name_2_2: 'c' }]));
  it('escapes CSV and neutralizes formulas', () =>
    expect(rowsToCsv([['=SUM(A1)', 'a,b', 'hello"you']])).toBe('\'=SUM(A1),"a,b","hello""you"'));
  it('rejects empty or invalid JSON tables', () => expect(() => jsonToRows('{"hello":true}')).toThrow());
  it('opens zip entries', async () => {
    const zip = new JSZip();
    zip.file('hello.txt', 'hello');
    const result = await openZip(await zip.generateAsync({ type: 'uint8array' }));
    expect(await result[0].async('string')).toBe('hello');
  });
  it('preserves files with duplicate names', () => {
    const used = new Set<string>();
    expect(uniqueFilename('test.txt', used)).toBe('test.txt');
    expect(uniqueFilename('test.txt', used)).toBe('test (2).txt');
  });
});
describe('Discovery', () => {
  it('has 64 real additional tools', () => expect(EXTRA_SPECS).toHaveLength(64));
  it('finds the requested combined DOCX workflow', () =>
    expect(
      searchTools('combine word docx into pdf', TOOLS)
        .slice(0, 3)
        .some((t) => t.slug === 'combine-word-to-pdf'),
    ).toBe(true));
  it('finds natural-language image intent', () =>
    expect(searchTools('make my image smaller', TOOLS)[0].slug).toBe('image-compressor'));
});
