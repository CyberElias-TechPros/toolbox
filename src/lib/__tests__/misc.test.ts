import { describe, expect, it } from 'vitest';
import { extractHashtags } from '../hashtag';
import { generateNumbers } from '../random';

describe('extractHashtags', () => {
  const text =
    'We are launching our new web design and branding studio in Lagos. Fast websites, modern design, affordable prices for small businesses and startups. Design, design, design!';

  it('extracts hashtags with the most frequent words first', () => {
    const tags = extractHashtags(text, 10);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags[0]).toBe('#design');
    expect(tags.every((t) => t.startsWith('#'))).toBe(true);
  });

  it('filters stopwords and short words', () => {
    const tags = extractHashtags('the and for of the the web');
    expect(tags).not.toContain('#the');
    expect(tags).not.toContain('#and');
    expect(tags).toContain('#web');
  });

  it('respects the limit and de-duplicates', () => {
    const tags = extractHashtags('alpha beta alpha beta gamma', 2);
    expect(tags).toEqual(['#alpha', '#beta']);
  });

  it('returns empty for empty input', () => {
    expect(extractHashtags('', 5)).toEqual([]);
  });
});

describe('generateNumbers', () => {
  it('stays in range and honors count', () => {
    const res = generateNumbers({ min: 1, max: 10, count: 20, unique: false, decimals: 0 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.values).toHaveLength(20);
      for (const v of res.values) {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(10);
        expect(Number.isInteger(v)).toBe(true);
      }
    }
  });

  it('enforces uniqueness', () => {
    const res = generateNumbers({ min: 1, max: 100, count: 30, unique: true, decimals: 0 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(new Set(res.values).size).toBe(30);
  });

  it('rejects impossible unique requests', () => {
    const res = generateNumbers({ min: 1, max: 2, count: 5, unique: true, decimals: 0 });
    expect(res.ok).toBe(false);
  });

  it('supports decimals', () => {
    const res = generateNumbers({ min: 0, max: 1, count: 10, unique: false, decimals: 2 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      for (const v of res.values) {
        expect(Math.abs(v * 100 - Math.round(v * 100))).toBeLessThan(1e-9);
      }
    }
  });

  it('rejects min > max', () => {
    expect(generateNumbers({ min: 5, max: 1, count: 3, unique: false, decimals: 0 }).ok).toBe(false);
  });
});
