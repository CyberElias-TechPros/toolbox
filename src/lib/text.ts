/** Pure text-processing logic, shared by text tools and tested in isolation. */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  readingSeconds: number;
}

/** Count words/characters/sentences/paragraphs plus estimated reading time. */
export function countText(text: string, wordsPerMinute = 200): TextStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentences = trimmed ? (trimmed.match(/[.!?…]+(?=\s|$)/g) || []).length || (trimmed ? 1 : 0) : 0;
  const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((p) => p.trim()).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const readingSeconds = Math.ceil((words / wordsPerMinute) * 60);
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingMinutes: Math.floor(readingSeconds / 60),
    readingSeconds,
  };
}

export type CaseStyle =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant';

const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'via',
]);

function toWords(input: string): string[] {
  return input
    .replace(/[_\-./\\]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

/** Convert text to a given case style. */
export function convertCase(input: string, style: CaseStyle): string {
  const text = input.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  switch (style) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title': {
      const words = text.split(' ');
      return words
        .map((w, i) => {
          if (SMALL_WORDS.has(w.toLowerCase()) && i !== 0 && i !== words.length - 1) return w.toLowerCase();
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(' ');
    }
    case 'sentence': {
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    }
    case 'camel':
    case 'pascal': {
      const parts = toWords(text);
      return parts
        .map((w, i) => {
          const base = w.charAt(0).toUpperCase() + w.slice(1);
          return style === 'camel' && i === 0 ? w.toLowerCase() : base;
        })
        .join('');
    }
    case 'snake':
      return toWords(text).join('_');
    case 'kebab':
      return toWords(text).join('-');
    case 'constant':
      return toWords(text).join('_').toUpperCase();
  }
}

/** Options for the Text Cleaner tool. */
export interface CleanerOptions {
  collapseSpaces: boolean;
  trimLines: boolean;
  removeBlankLines: boolean;
  removeDuplicateLines: boolean;
  tabsToSpaces: boolean;
  removeNewlines: boolean;
  sortAZ: boolean;
  sortZA: boolean;
  sortNumeric: boolean;
  removePunctuation: boolean;
}

export const DEFAULT_CLEANER_OPTIONS: CleanerOptions = {
  collapseSpaces: true,
  trimLines: true,
  removeBlankLines: true,
  removeDuplicateLines: false,
  tabsToSpaces: false,
  removeNewlines: false,
  sortAZ: false,
  sortZA: false,
  sortNumeric: false,
  removePunctuation: false,
};

/** Apply a set of cleaning operations to text. Order is deterministic. */
export function cleanText(input: string, opts: CleanerOptions): string {
  let out = input;
  if (opts.tabsToSpaces) out = out.replace(/\t/g, '  ');
  if (opts.collapseSpaces) out = out.replace(/[ ]{2,}/g, ' ');
  if (opts.removePunctuation) out = out.replace(/[.,;:!?'"“”‘’\-—–_(){}\[\]]/g, '');
  if (opts.trimLines) out = out.split('\n').map((l) => l.trim()).join('\n');
  let lines = out.split('\n');
  if (opts.removeBlankLines) lines = lines.filter((l) => l.trim().length > 0);
  if (opts.removeDuplicateLines) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (opts.sortAZ) lines = [...lines].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  else if (opts.sortZA) lines = [...lines].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  else if (opts.sortNumeric)
    lines = [...lines].sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.-]/g, ''));
      const nb = parseFloat(b.replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
  out = lines.join('\n');
  if (opts.removeNewlines) out = out.replace(/\n{2,}/g, '. ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
  return out.trim();
}

/* ------------------------------ Text diff ------------------------------ */

export interface DiffSegment {
  type: 'same' | 'added' | 'removed';
  text: string;
}

/** Word-level diff using LCS (bounded for very large inputs). */
export function diffWords(a: string, b: string): DiffSegment[] {
  const wa = a.split(/\s+/).filter(Boolean);
  const wb = b.split(/\s+/).filter(Boolean);
  // Guard against pathological sizes (LCS is O(n*m)).
  const LIMIT = 4000;
  if (wa.length * wb.length > LIMIT * LIMIT) {
    return [
      { type: 'removed', text: a },
      { type: 'added', text: b },
    ];
  }
  const n = wa.length;
  const m = wb.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = wa[i] === wb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  const push = (type: DiffSegment['type'], text: string) => {
    const last = segments[segments.length - 1];
    if (last && last.type === type) last.text += ` ${text}`;
    else segments.push({ type, text });
  };
  while (i < n && j < m) {
    if (wa[i] === wb[j]) {
      push('same', wa[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push('removed', wa[i]);
      i++;
    } else {
      push('added', wb[j]);
      j++;
    }
  }
  while (i < n) push('removed', wa[i++]);
  while (j < m) push('added', wb[j++]);
  return segments;
}

/* ---------------------------- Lorem Ipsum ------------------------------ */

const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
  'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
  'dolor in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur ' +
  'sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit ' +
  'anim id est laborum voluptas excepturi sint qui quia consequuntur'
).split(' ');

/** Generate Lorem Ipsum text of a given length (words, sentences or paragraphs). */
export function loremIpsum(count: number, unit: 'words' | 'sentences' | 'paragraphs', startWithClassic = true): string {
  const start = startWithClassic ? 'Lorem ipsum dolor sit amet, ' : '';
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const sentence = (targetWords: number): string => {
    const words: string[] = [];
    for (let w = 0; w < targetWords; w++) words.push(rand(LOREM_WORDS));
    let s = words.join(' ');
    s = s.charAt(0).toUpperCase() + s.slice(1);
    return `${s}.`;
  };
  if (unit === 'words') {
    const words: string[] = [];
    for (let w = 0; w < count; w++) words.push(rand(LOREM_WORDS));
    return start + words.join(' ');
  }
  if (unit === 'sentences') {
    const parts: string[] = [];
    for (let s = 0; s < count; s++) parts.push(sentence(8 + Math.floor(Math.random() * 8)));
    return (start + parts.join(' '));
  }
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const sCount = 4 + Math.floor(Math.random() * 4);
    const parts: string[] = [];
    for (let s = 0; s < sCount; s++) parts.push(sentence(8 + Math.floor(Math.random() * 8)));
    const text = parts.join(' ');
    paragraphs.push(p === 0 ? `${start}${text}` : text);
  }
  return paragraphs.join('\n\n');
}
