/** Unicode style mappings for the Social Media Text Formatter. Pure and tested. */

export type StyleId =
  | 'bold'
  | 'italic'
  | 'bolditalic'
  | 'mono'
  | 'script'
  | 'subscript'
  | 'superscript'
  | 'fullwidth'
  | 'encircled'
  | 'strikethrough'
  | 'underline';

export interface StyleDef {
  id: StyleId;
  label: string;
  sample: (s: string) => string;
}

function mapRanges(
  s: string,
  upperFrom: number | null,
  lowerFrom: number | null,
  digitFrom: number | null,
): string {
  let out = '';
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90 && upperFrom) out += String.fromCodePoint(upperFrom + (c - 65));
    else if (c >= 97 && c <= 122 && lowerFrom) out += String.fromCodePoint(lowerFrom + (c - 97));
    else if (c >= 48 && c <= 57 && digitFrom) out += String.fromCodePoint(digitFrom + (c - 48));
    else out += ch; // punctuation & symbols pass through
  }
  return out;
}

const SUB_TABLE: Record<string, string> = {
  '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
  '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
  '+': '\u208A', '-': '\u208B', '=': '\u208C', '(': '\u208D', ')': '\u208E',
  a: '\u2090', e: '\u2091', h: '\u2095', i: '\u1D62', j: '\u2C7C', k: '\u2096',
  l: '\u2097', m: '\u2098', n: '\u2099', o: '\u2092', p: '\u209A', s: '\u209B', t: '\u209C',
  r: '\u1D63', u: '\u1D64',
};

const SUP_TABLE: Record<string, string> = {
  '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074',
  '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
  '+': '\u207A', '-': '\u207B', '=': '\u207C', '(': '\u207D', ')': '\u207E',
  n: '\u207F', i: '\u1D62', j: '\u2C7C', r: '\u1D63', s: '\u1D64', t: '\u1D65',
};

const ENCIRCLE_LOWER: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (let i = 0; i < 26; i++) m[String.fromCharCode(97 + i)] = String.fromCharCode(0x24d0 + i);
  m['0'] = '\u24EA';
  for (let i = 1; i <= 20; i++) m[String(i)] = String.fromCharCode(0x245f + i);
  return m;
})();

const ENCIRCLE_UPPER: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (let i = 0; i < 26; i++) m[String.fromCharCode(65 + i)] = String.fromCharCode(0x24b6 + i);
  return m;
})();

function mapTable(s: string, table: Record<string, string>): string {
  let out = '';
  for (const ch of s) out += table[ch] ?? ch;
  return out;
}

function combine(s: string, combining: string): string {
  let out = '';
  for (const ch of s) {
    if (ch === ' ') out += ch;
    else out += ch + combining;
  }
  return out;
}

const bold = (s: string) => mapRanges(s, 0x1d400, 0x1d41a, 0x1d7ce);
const italic = (s: string) => mapRanges(s, 0x1d434, 0x1d44e, 0x1d7d8);
const bolditalic = (s: string) => mapRanges(s, 0x1d468, 0x1d482, 0x1d7e2);
const mono = (s: string) => mapRanges(s, 0x1d670, 0x1d68a, 0x1d7f8);
const script = (s: string) => mapRanges(s, 0x1d4d0, 0x1d4ea, 0x1d7f2);
const fullwidth = (s: string) => mapRanges(s, 0xff21, 0xff41, 0xff10).replace(/ /g, '\u3000');
const strikethrough = (s: string) => combine(s, '\u0336');
const underline = (s: string) => combine(s, '\u0332');
const subscript = (s: string) => mapTable(s.toLowerCase(), SUB_TABLE);
const superscript = (s: string) => mapTable(s.toLowerCase(), SUP_TABLE);
const encircled = (s: string) =>
  [...s]
    .map((ch) => ENCIRCLE_UPPER[ch] ?? ENCIRCLE_LOWER[ch] ?? ch)
    .join('');

export const STYLES: StyleDef[] = [
  { id: 'bold', label: 'Bold', sample: bold },
  { id: 'italic', label: 'Italic', sample: italic },
  { id: 'bolditalic', label: 'Bold Italic', sample: bolditalic },
  { id: 'mono', label: 'Monospace', sample: mono },
  { id: 'script', label: 'Script', sample: script },
  { id: 'superscript', label: 'Superscript', sample: superscript },
  { id: 'subscript', label: 'Subscript', sample: subscript },
  { id: 'fullwidth', label: 'Fullwidth', sample: fullwidth },
  { id: 'encircled', label: 'Encircled', sample: encircled },
  { id: 'strikethrough', label: 'Strikethrough', sample: strikethrough },
  { id: 'underline', label: 'Underline', sample: underline },
];

export function applyStyle(style: StyleId, text: string): string {
  return STYLES.find((s) => s.id === style)?.sample(text) ?? text;
}
