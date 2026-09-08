import { describe, expect, it } from 'vitest';
import { jsonToTypes } from '../tsinfer';

describe('jsonToTypes', () => {
  it('infers an interface from a nested object', () => {
    const res = jsonToTypes('{"name":"a","tags":["x"],"active":true,"meta":{"size":3}}');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.code).toContain('interface Root {');
    expect(res.code).toContain('name: string;');
    expect(res.code).toContain('tags: string[];');
    expect(res.code).toContain('active: boolean;');
    expect(res.code).toContain('meta: Item0;');
    expect(res.code).toContain('interface Item0 {\n  size: number;\n}');
  });

  it('handles arrays at the top level', () => {
    expect(jsonToTypes('[1,2]').ok && jsonToTypes('[1,2]').ok ? (jsonToTypes('[1,2]') as { code: string }).code : '').toBe('type Root = number[];');
  });

  it('unions mixed element types', () => {
    const res = jsonToTypes('[1,"a"]');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.code).toBe('type Root = (number | string)[];');
  });

  it('handles null and primitives', () => {
    expect(jsonToTypes('null').ok ? (jsonToTypes('null') as { code: string }).code : '').toBe('type Root = null;');
    expect(jsonToTypes('42').ok ? (jsonToTypes('42') as { code: string }).code : '').toBe('type Root = number;');
  });

  it('quotes non-identifier keys', () => {
    const res = jsonToTypes('{"a-b": 1}');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.code).toContain('"a-b": number;');
  });

  it('rejects invalid JSON', () => {
    const res = jsonToTypes('nope');
    expect(res.ok).toBe(false);
  });
});
