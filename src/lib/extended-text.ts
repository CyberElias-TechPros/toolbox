export interface TextOptions {
  find?: string;
  replace?: string;
  count?: number;
  base?: number;
  target?: number;
  secret?: string;
}
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  return value;
}
export function convertBase(text: string, from: number, to: number): string {
  if (![2, 8, 10, 16].includes(from) || ![2, 8, 10, 16].includes(to))
    throw Error('Choose base 2, 8, 10, or 16.');
  let s = text.trim().toLowerCase(),
    sign = 1n;
  if (s.startsWith('-')) {
    sign = -1n;
    s = s.slice(1);
  }
  if (!s || s.length > 10000) throw Error('Enter a number of 1–10,000 digits.');
  let n = 0n;
  for (const c of s) {
    const digit = '0123456789abcdef'.indexOf(c);
    if (digit < 0 || digit >= from) throw Error(`“${c}” is not a valid digit in base ${from}.`);
    n = n * BigInt(from) + BigInt(digit);
  }
  return (n * sign).toString(to).toUpperCase();
}
export async function transformText(slug: string, input: string, o: TextOptions = {}): Promise<string> {
  if (!input.trim()) throw Error('Add some content first.');
  if (input.length > 2_000_000) throw Error('Please use less than 2 MB of text.');
  switch (slug) {
    case 'remove-duplicate-lines':
      return [...new Set(input.replace(/\r\n/g, '\n').split('\n'))].join('\n');
    case 'extract-emails':
      return [...new Set(input.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])].join('\n');
    case 'extract-urls':
      return [
        ...new Set((input.match(/https?:\/\/[^\s<>"']+/gi) || []).map((s) => s.replace(/[.,;!?]+$/, ''))),
      ].join('\n');
    case 'slug-generator':
      return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '');
    case 'reverse-text':
      return Array.from(
        new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(input),
        (s) => s.segment,
      )
        .reverse()
        .join('');
    case 'remove-whitespace':
      return input.replace(/\s+/g, '');
    case 'text-repeater': {
      const count = o.count ?? 5;
      if (!Number.isInteger(count) || count < 1 || count > 10000 || input.length * count > 2_000_000)
        throw Error('Use 1–10,000 repetitions, with an output under 2 MB.');
      return Array(count).fill(input).join('\n');
    }
    case 'find-replace':
      if (!o.find) throw Error('Enter the text to find.');
      return input.split(o.find).join(o.replace ?? '');
    case 'text-to-binary':
      return Array.from(new TextEncoder().encode(input), (n) => n.toString(2).padStart(8, '0')).join(' ');
    case 'binary-to-text': {
      const s = input.replace(/\s/g, '');
      if (!/^[01]+$/.test(s) || s.length % 8)
        throw Error('Use complete 8-bit binary bytes (for example 01001000 01101001).');
      return new TextDecoder('utf-8', { fatal: true }).decode(
        Uint8Array.from(s.match(/.{8}/g)!, (n) => parseInt(n, 2)),
      );
    }
    case 'html-entity-encoder':
      return input.replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
      );
    case 'html-entity-decoder': {
      const { decode } = await import('he');
      return decode(input);
    }
    case 'json-to-yaml':
      return (await import('yaml')).stringify(JSON.parse(input));
    case 'yaml-to-json':
      return JSON.stringify((await import('yaml')).parse(input, { maxAliasCount: 50 }), null, 2);
    case 'xml-to-json': {
      const { XMLParser, XMLValidator } = await import('fast-xml-parser');
      const valid = XMLValidator.validate(input);
      if (valid !== true) throw Error(valid.err.msg);
      if (/<!DOCTYPE|<!ENTITY/i.test(input))
        throw Error('XML document types and custom entities are not supported.');
      return JSON.stringify(
        new XMLParser({ ignoreAttributes: false, processEntities: false }).parse(input),
        null,
        2,
      );
    }
    case 'json-to-xml': {
      const data = JSON.parse(input);
      if (!data || typeof data !== 'object') throw Error('Use a JSON object or array.');
      const { XMLBuilder, XMLValidator } = await import('fast-xml-parser');
      const result = new XMLBuilder({ format: true, ignoreAttributes: false }).build({ root: data });
      if (XMLValidator.validate(result) !== true)
        throw Error(
          'JSON keys must be valid XML element names. Avoid spaces, punctuation and leading digits.',
        );
      return result;
    }
    case 'jwt-decoder': {
      const parts = input.trim().split('.');
      if (parts.length !== 3) throw Error('A JWT has three dot-separated parts.');
      const decode = (s: string) =>
        JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(
            Uint8Array.from(
              atob(
                s
                  .replace(/-/g, '+')
                  .replace(/_/g, '/')
                  .padEnd(Math.ceil(s.length / 4) * 4, '='),
              ),
              (c) => c.charCodeAt(0),
            ),
          ),
        );
      return JSON.stringify(
        {
          header: decode(parts[0]),
          payload: decode(parts[1]),
          warning: 'Signature not verified. Do not trust claims without verification.',
        },
        null,
        2,
      );
    }
    case 'css-minifier':
      return (await import('csso')).minify(input).css;
    case 'javascript-minifier':
      return (await import('terser'))
        .minify(input, { compress: true, mangle: true })
        .then((r) => r.code || '');
    case 'sql-formatter':
      return (await import('sql-formatter')).format(input, { language: 'sql' });
    case 'json-minifier':
      return JSON.stringify(JSON.parse(input));
    case 'json-key-sorter':
      return JSON.stringify(sortKeys(JSON.parse(input)), null, 2);
    case 'number-base-converter':
      return convertBase(input, o.base ?? 10, o.target ?? 16);
    case 'hmac-generator': {
      if (!o.secret) throw Error('Enter a secret key.');
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(o.secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
      return Array.from(new Uint8Array(sig), (x) => x.toString(16).padStart(2, '0')).join('');
    }
    default:
      throw Error('Unknown text tool.');
  }
}
export const TEXT_SAMPLES: Record<string, string> = {
  'remove-duplicate-lines':
    'Make something great\nKeep it simple\nMake something great\nEnjoy the little things',
  'extract-emails': 'Say hello: hello@example.com. Support: support@example.org',
  'extract-urls': 'Explore https://example.com and https://example.org/tools.',
  'slug-generator': 'Small Tools. Big Possibilities!',
  'reverse-text': 'Hello, world! 🌍',
  'remove-whitespace': 'A little less   space.\nA little more flow.',
  'text-repeater': 'Make room for more.',
  'find-replace': 'Hello world. A better world.',
  'text-to-binary': 'Hello!',
  'binary-to-text': '01001000 01100101 01101100 01101100 01101111 00100001',
  'html-entity-encoder': '<p>Hello & welcome!</p>',
  'html-entity-decoder': '&lt;p&gt;Hello &amp; welcome!&lt;/p&gt;',
  'json-to-yaml': '{"name":"Toolbox","private":true,"tools":["PDF","Image"]}',
  'yaml-to-json': 'name: Toolbox\nprivate: true\ntools:\n  - PDF\n  - Image',
  'xml-to-json': '<toolbox><tool name="PDF">Free</tool></toolbox>',
  'json-to-xml': '{"tool":{"name":"PDF","free":true}}',
  'jwt-decoder': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWxleCJ9.c2lnbmF0dXJl',
  'css-minifier': '.card { color: #ffffff; padding: 10px 10px 10px 10px; }',
  'javascript-minifier':
    'function greet(name) { const message = "Hello, " + name; return message; } console.log(greet("world"));',
  'sql-formatter':
    'select name, count(*) as total from tools where free = true group by name order by total desc;',
  'json-minifier': '{\n  "hello": "world",\n  "free": true\n}',
  'json-key-sorter': '{"zebra":1,"apple":{"z":2,"a":3},"middle":true}',
  'number-base-converter': '255',
  'hmac-generator': 'The quick brown fox jumps over the lazy dog',
};
