import { describe, expect, it } from 'vitest';
import { MIME_TYPES, HTTP_STATUS, parseUserAgent } from '../httphelp';

describe('parseUserAgent', () => {
  it('detects Chrome on Windows', () => {
    const p = parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    expect(p.browser).toBe('Chrome');
    expect(p.browserVersion).toBe('120.0.0.0');
    expect(p.os).toBe('Windows 10/11');
    expect(p.device).toBe('desktop');
  });

  it('prefers Edge over Chrome when both tokens exist', () => {
    const p = parseUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0');
    expect(p.browser).toBe('Edge');
  });

  it('detects Safari on macOS', () => {
    const p = parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15');
    expect(p.browser).toBe('Safari');
    expect(p.os).toBe('macOS');
    expect(p.device).toBe('desktop');
  });

  it('detects iPhone as phone/iOS', () => {
    const p = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    expect(p.os).toBe('iOS');
    expect(p.osVersion).toBe('17.0');
    expect(p.device).toBe('phone');
  });

  it('detects Firefox on Android', () => {
    const p = parseUserAgent('Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0');
    expect(p.browser).toBe('Firefox');
    expect(p.os).toBe('Android');
    expect(p.device).toBe('phone');
  });

  it('falls back gracefully for unknown agents', () => {
    const p = parseUserAgent('MyBot/1.0 (+https://example.com)');
    expect(p.browser).toBe('Unknown');
  });
});

describe('reference data', () => {
  it('covers the status codes people actually meet', () => {
    const codes = new Set(HTTP_STATUS.map((s) => s.code));
    for (const c of [200, 301, 304, 400, 401, 403, 404, 409, 429, 500, 502, 503, 504]) expect(codes.has(c)).toBe(true);
  });

  it('has no duplicate extensions in the MIME table', () => {
    const exts = MIME_TYPES.map((m) => m.ext);
    expect(new Set(exts).size).toBe(exts.length);
  });
});
