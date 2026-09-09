import { describe, expect, it } from 'vitest';
import { csvToJson, jsonToCsv, parseCsv } from '../csv';

describe('jsonToCsv', () => {
  it('converts a simple array with a header row', () => {
    const res = jsonToCsv('[{"a":1,"b":"x"},{"a":2,"b":"y"}]');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value).toBe('a,b\n1,x\n2,y');
  });

  it('quotes commas, quotes and newlines', () => {
    const res = jsonToCsv('[{"name":"Beta, the bold"},{"name":"said \\"hi\\""},{"name":"line1\\nline2"}]');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.split('\n').length).toBe(5); // header + 3 rows, one of which contains an embedded newline
      expect(res.value).toContain('"Beta, the bold"');
      expect(res.value).toContain('"said ""hi"""');
    }
  });

  it('unions keys across rows', () => {
    const res = jsonToCsv('[{"a":1},{"b":2,"a":3}]');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.split('\n')[0]).toBe('a,b');
  });

  it('accepts an object wrapping a single array', () => {
    const res = jsonToCsv('{"items":[{"x":1}]}');
    expect(res.ok).toBe(true);
  });

  it('rejects non-array and invalid JSON with clear errors', () => {
    expect(jsonToCsv('{"a":1}').ok).toBe(false);
    expect(jsonToCsv('nope').ok).toBe(false);
    expect(jsonToCsv('[]').ok).toBe(false);
  });
});

describe('parseCsv', () => {
  it('parses quoted fields with commas, quotes and newlines', () => {
    const rows = parseCsv('a,b\n"1,000","he said ""hi"""\n"multi\nline",ok');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1,000', 'he said "hi"'],
      ['multi\nline', 'ok'],
    ]);
  });

  it('handles CRLF and trailing newlines', () => {
    const rows = parseCsv('a,b\r\n1,2\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('csvToJson', () => {
  it('round-trips with jsonToCsv', () => {
    const json = '[{"name":"Alpha","qty":3},{"name":"Beta","qty":1}]';
    const csv = jsonToCsv(json);
    expect(csv.ok).toBe(true);
    if (!csv.ok) return;
    const back = csvToJson(csv.value);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    const parsed = JSON.parse(back.value) as Array<Record<string, string>>;
    expect(parsed).toEqual([
      { name: 'Alpha', qty: '3' },
      { name: 'Beta', qty: '1' },
    ]);
  });

  it('rejects header-only and empty input', () => {
    expect(csvToJson('a,b').ok).toBe(false);
    expect(csvToJson('   ').ok).toBe(false);
  });

  it('numbers duplicate headers', () => {
    const res = csvToJson('x,x\n1,2');
    expect(res.ok).toBe(true);
    if (res.ok) {
      const parsed = JSON.parse(res.value) as Array<Record<string, string>>;
      expect(Object.keys(parsed[0])).toEqual(['x_1', 'x_2']);
    }
  });
});
