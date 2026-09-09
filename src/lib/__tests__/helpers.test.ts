import { describe, expect, it } from 'vitest';
import { readableTextOn, tintsAndShades } from '../color';
import { buildRobotsTxt } from '../robots';
import { buildSitemapXml, isIsoDate, parseUrlList } from '../sitemaptxt';
import { timeInZone, utcOffsetLabel } from '../timezones';

describe('color helpers', () => {
  it('produces tints and shades', () => {
    const { tints, shades } = tintsAndShades('#ff0000', 4);
    expect(tints).toHaveLength(4);
    expect(shades).toHaveLength(4);
    expect(tints[0].toUpperCase()).not.toBe('#FF0000');
    expect(shades[3].toUpperCase()).not.toBe('#FF0000');
  });

  it('suggests readable text color', () => {
    expect(readableTextOn('#ffffff')).toBe('black');
    expect(readableTextOn('#000000')).toBe('white');
    expect(readableTextOn('#767676')).toBe('black');
  });
});

describe('buildRobotsTxt', () => {
  it('builds a disallow+sitemap file', () => {
    const txt = buildRobotsTxt({
      allowAll: false,
      disallowPaths: ['admin', '/private'],
      sitemapUrls: ['https://example.com/sitemap.xml'],
    });
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('Disallow: /private');
    expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
    expect(txt).not.toContain('Allow');
  });

  it('allows everything when asked', () => {
    expect(buildRobotsTxt({ allowAll: true, disallowPaths: [], sitemapUrls: [] })).toContain('Allow: /');
  });
});

describe('sitemap tools', () => {
  it('parses and de-duplicates URL lists', () => {
    const res = parseUrlList('https://a.com/\nhttps://a.com/\nhttp://b.com/x?y=1');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.urls).toHaveLength(2);
  });

  it('rejects relative and non-http URLs', () => {
    expect(parseUrlList('/just/path').ok).toBe(false);
    expect(parseUrlList('ftp://x.com/a').ok).toBe(false);
  });

  it('builds valid sitemap XML', () => {
    const xml = buildSitemapXml([
      { loc: 'https://a.com/', lastmod: '2026-01-01' },
      { loc: 'https://a.com/b' },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://a.com/</loc>');
    expect(xml).toContain('<lastmod>2026-01-01</lastmod>');
    expect(xml).toContain('</urlset>');
  });

  it('validates ISO dates', () => {
    expect(isIsoDate('2026-01-01')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('Jan 1')).toBe(false);
  });
});

describe('timezones', () => {
  it('converts a fixed UTC instant to Lagos time (UTC+1)', () => {
    const d = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
    expect(timeInZone(d, 'Africa/Lagos')).toBe('01:00 PM');
    expect(utcOffsetLabel(d, 'Africa/Lagos')).toBe('UTC+1');
  });

  it('converts to a negative offset', () => {
    const d = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
    expect(timeInZone(d, 'America/New_York')).toBe('07:00 AM');
    expect(utcOffsetLabel(d, 'America/New_York')).toBe('UTC-5');
  });
});
