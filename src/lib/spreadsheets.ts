import ExcelJS from 'exceljs';
import { parseCsv } from './csv';
export type SheetData = { name: string; rows: string[][] };
export function rowsToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((value) => {
          // Keep exported text from becoming a formula when opened in a spreadsheet app.
          const safe = /^[\s]*[=+@]/.test(value) || /^[\s]*-\D/.test(value) ? `'${value}` : value;
          return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
        })
        .join(','),
    )
    .join('\r\n');
}
export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (!rows.length) return [];
  const used = new Set<string>();
  const keys = rows[0].map((h, i) => {
    const base = h.trim() || `column_${i + 1}`;
    let key = base,
      n = 2;
    while (used.has(key)) key = `${base}_${n++}`;
    used.add(key);
    return key;
  });
  return rows.slice(1).map((row) => Object.fromEntries(keys.map((key, i) => [key, row[i] ?? ''])));
}
export function jsonToRows(input: string): string[][] {
  const data = JSON.parse(input);
  if (
    !Array.isArray(data) ||
    !data.length ||
    !data.every((row) => row && typeof row === 'object' && !Array.isArray(row))
  )
    throw Error('Use a non-empty JSON array of objects.');
  const keys = [...new Set<string>(data.flatMap(Object.keys))];
  if (!keys.length) throw Error('Add at least one property per row.');
  return [
    keys,
    ...data.map((row) =>
      keys.map((key) =>
        row[key] == null ? '' : typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key]),
      ),
    ),
  ];
}
export async function createWorkbook(rows: string[][]): Promise<Uint8Array> {
  if (!rows.length) throw Error('No rows to export.');
  if (rows.length > 100000 || rows.some((row) => row.length > 1000))
    throw Error('Use fewer than 100,000 rows and 1,000 columns.');
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet('Data');
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FF293729' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF0E1' } };
  sheet.columns.forEach((column) => (column.width = 24));
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('richText' in value) return value.richText.map((t) => t.text).join('');
    if ('formula' in value || 'sharedFormula' in value)
      return 'result' in value ? cellText(value.result as ExcelJS.CellValue) : '';
    if ('text' in value) return value.text;
    if ('error' in value) return value.error;
  }
  return String(value);
}
export async function readWorkbook(buffer: ArrayBuffer): Promise<SheetData[]> {
  await (await import('./archives')).openZip(buffer);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook.worksheets.map((sheet) => {
    if (sheet.rowCount > 100000 || sheet.columnCount > 1000)
      throw Error('This workbook is too large. Use fewer than 100,000 rows and 1,000 columns.');
    const rows: string[][] = [];
    sheet.eachRow({ includeEmpty: true }, (row) => {
      rows.push(Array.from({ length: sheet.columnCount }, (_, i) => cellText(row.getCell(i + 1).value)));
    });
    return { name: sheet.name, rows };
  });
}
export { parseCsv };
