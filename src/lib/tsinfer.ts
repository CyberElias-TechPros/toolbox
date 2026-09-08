/** Infer TypeScript types (interfaces) from a JSON value. Pure and tested. */

export type InferResult = { ok: true; code: string } | { ok: false; error: string };

const isIdent = (s: string): boolean => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);
const propName = (k: string): string => (isIdent(k) ? k : JSON.stringify(k));

export function jsonToTypes(input: string, rootName = 'Root'): InferResult {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  if (value === undefined) return { ok: false, error: 'Empty input.' };

  const defs: string[] = [];
  let counter = 0;
  const nameFor = (): string => `Item${counter++}`;

  const pushObject = (obj: Record<string, unknown>, name: string): void => {
    const keys = Object.keys(obj);
    const fields = keys.map((k) => `  ${propName(k)}: ${inferValue(obj[k])};`);
    defs.push(`interface ${name} {\n${fields.join('\n')}\n}`);
  };

  const inferObject = (obj: Record<string, unknown>, name: string | null): string => {
    const n = name ?? nameFor();
    pushObject(obj, n);
    return n;
  };

  const inferArray = (arr: unknown[]): string => {
    if (arr.length === 0) return 'unknown[]';
    const parts = new Set<string>();
    for (const el of arr) {
      if (el === null) parts.add('null');
      else if (Array.isArray(el)) parts.add(`${inferArray(el)}[]`);
      else if (typeof el === 'object') parts.add(inferObject(el as Record<string, unknown>, nameFor()));
      else parts.add(typeof el);
    }
    const union = [...parts].join(' | ');
    return parts.size === 1 ? `${union}[]` : `(${union})[]`;
  };

  function inferValue(v: unknown): string {
    if (v === null) return 'null';
    if (Array.isArray(v)) return inferArray(v);
    switch (typeof v) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        return inferObject(v as Record<string, unknown>, null);
      default:
        return 'unknown';
    }
  }

  let head: string | null = null;
  if (value === null) {
    head = `type ${rootName} = null;`;
  } else if (Array.isArray(value)) {
    head = `type ${rootName} = ${inferArray(value)};`;
  } else if (typeof value === 'object') {
    pushObject(value as Record<string, unknown>, rootName);
  } else {
    head = `type ${rootName} = ${typeof value};`;
  }

  const code = [head, ...defs].filter(Boolean).join('\n\n');
  return { ok: true, code };
}
