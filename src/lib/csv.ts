/** JSON ↔ CSV conversion. Pure and tested. */

export type ConversionResult = { ok: true; value: string } | { ok: false; error: string };

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/** JSON (array of objects, or object wrapping a single array) → CSV with header row. */
export function jsonToCsv(input: string): ConversionResult {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `Invalid JSON: ${e.message}` : 'Invalid JSON.' };
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrKeys = Object.keys(data).filter((k) => Array.isArray((data as Record<string, unknown>)[k]));
    if (arrKeys.length === 1) data = (data as Record<string, unknown>)[arrKeys[0]];
  }
  if (!Array.isArray(data)) {
    return { ok: false, error: 'The top level must be an array of objects (or an object containing a single array).' };
  }
  if (data.length === 0) return { ok: false, error: 'The array is empty — nothing to export.' };
  if (!data.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    return { ok: false, error: 'Every row must be a JSON object.' };
  }
  const rows = data as Array<Record<string, unknown>>;
  const keys: string[] = [];
  for (const row of rows) for (const k of Object.keys(row)) if (!keys.includes(k)) keys.push(k);
  const lines = [keys.map(csvEscape).join(',')];
  for (const row of rows) lines.push(keys.map((k) => csvEscape(cellToString(row[k]))).join(','));
  return { ok: true, value: lines.join('\n') };
}

/** Parse CSV text (quotes, escaped quotes, commas and newlines inside quotes). */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushRow();
    } else if (c === '\r') {
      // skip (handles \r\n)
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** CSV (first row = headers) → JSON array of objects. */
export function csvToJson(input: string): ConversionResult {
  if (!input.trim()) return { ok: false, error: 'Paste some CSV first.' };
  const rows = parseCsv(input);
  if (rows.length === 0) return { ok: false, error: 'The CSV appears to be empty.' };
  const headers = rows[0].map((h, i) => (h.trim() ? h.trim() : `column_${i + 1}`));
  const uniqueHeaders = headers.map((h, i) => (headers.filter((x) => x === h).length > 1 ? `${h}_${i + 1}` : h));
  const objects = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < uniqueHeaders.length; i++) obj[uniqueHeaders[i]] = r[i] ?? '';
    return obj;
  });
  if (objects.length === 0) return { ok: false, error: 'The CSV has a header but no data rows.' };
  return { ok: true, value: JSON.stringify(objects, null, 2) };
}
