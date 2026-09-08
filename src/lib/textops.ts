/** Line sorting and list building for text tools. Pure and tested. */

export interface SortOptions {
  direction: 'asc' | 'desc';
  unique: boolean;
  caseSensitive: boolean;
  /** Numeric-aware: "2" < "10". Non-numeric lines fall back to text order. */
  numeric: boolean;
}

export function sortLines(text: string, o: SortOptions): string {
  const key = (s: string) => (o.caseSensitive ? s : s.toLowerCase());
  const lines = text.split(/\r?\n/);
  const out = o.unique ? [...new Set(lines)] : [...lines];
  out.sort((a, b) => {
    let r: number;
    if (o.numeric) {
      const na = parseFloat(a);
      const nb = parseFloat(b);
      const aNum = a.trim() !== '' && Number.isFinite(na);
      const bNum = b.trim() !== '' && Number.isFinite(nb);
      if (aNum && bNum) r = na - nb;
      else if (aNum) r = -1;
      else if (bNum) r = 1;
      else r = key(a).localeCompare(key(b));
    } else {
      r = key(a).localeCompare(key(b));
    }
    return o.direction === 'asc' ? r : -r;
  });
  return out.join('\n');
}

export interface ListOptions {
  marker: 'bullet' | 'dash' | 'numbered';
  splitBy: 'line' | 'comma' | 'semicolon';
}

export function textToList(text: string, o: ListOptions): string {
  let items: string[];
  if (o.splitBy === 'line') {
    items = text
      .split(/\r?\n/)
      .map((s) => s.replace(/^\s*[-*+•]\s+/, '').trim())
      .filter(Boolean);
  } else {
    items = text
      .split(o.splitBy === 'comma' ? /,\s*/ : /;\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return items
    .map((it, i) => {
      if (o.marker === 'numbered') return `${i + 1}. ${it}`;
      if (o.marker === 'dash') return `- ${it}`;
      return `• ${it}`;
    })
    .join('\n');
}
