import { describe, expect, it } from 'vitest';
import { searchTools } from '../search';
import { TOOLS } from '../../registry';

const TOOLS_SEARCHABLE = TOOLS.map((t) => ({ slug: t.slug, name: t.name, tagline: t.tagline, tags: t.tags, aliases: t.aliases }));

describe('searchTools', () => {
  it('returns nothing for an empty query', () => {
    expect(searchTools('', TOOLS_SEARCHABLE)).toEqual([]);
  });

  it('finds a tool by exact name', () => {
    const hits = searchTools('word counter', TOOLS_SEARCHABLE);
    expect(hits[0]?.slug).toBe('word-counter');
  });

  it('maps natural-language task "make this image smaller" to the compressor', () => {
    const hits = searchTools('make this image smaller', TOOLS_SEARCHABLE);
    expect(hits[0]?.slug).toBe('image-compressor');
  });

  it('maps "turn json into csv" toward the JSON tool', () => {
    const hits = searchTools('turn json into csv', TOOLS_SEARCHABLE);
    expect(hits.some((h) => h.slug === 'json-formatter')).toBe(true);
  });

  it('maps "calculate 20% of 50000" to the percentage calculator', () => {
    const hits = searchTools('calculate 20% of 50000', TOOLS_SEARCHABLE);
    expect(hits[0]?.slug).toBe('percentage-calculator');
  });

  it('maps "merge pdf" to the PDF merger', () => {
    const hits = searchTools('merge pdf', TOOLS_SEARCHABLE);
    expect(hits[0]?.slug).toBe('pdf-merger');
  });

  it('maps "wifi qr code" to the QR generator', () => {
    const hits = searchTools('wifi qr code', TOOLS_SEARCHABLE);
    expect(hits[0]?.slug).toBe('qr-generator');
  });

  it('ranks partial matches above unrelated tools', () => {
    const hits = searchTools('invoice', TOOLS_SEARCHABLE);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0].slug).toBe('invoice-generator');
  });

  it('handles nonsense gracefully (no crash, few/no hits)', () => {
    const hits = searchTools('zzzqqqxxx', TOOLS_SEARCHABLE);
    expect(Array.isArray(hits)).toBe(true);
  });
});
