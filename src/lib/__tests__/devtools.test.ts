import { describe, expect, it } from 'vitest';
import { buildQrPayload, requiredFieldsError } from '../qr';
import { buildUtms } from '../../tools/marketing/UtmBuilder';
import { buildMetaTags } from '../../tools/marketing/MetaTags';
import { parsePageRanges } from '../../tools/pdf/Splitter';
import { generatePassword } from '../../tools/utility/PasswordGenerator';

describe('buildQrPayload', () => {
  it('url and text pass through', () => {
    expect(buildQrPayload({ type: 'url', url: 'https://example.com' })).toBe('https://example.com');
    expect(buildQrPayload({ type: 'text', text: 'hi there' })).toBe('hi there');
  });
  it('phone → tel:', () => {
    expect(buildQrPayload({ type: 'phone', phone: '+234 801-234-5678' })).toBe('tel:+2348012345678');
  });
  it('email builds a mailto with subject/body', () => {
    const p = buildQrPayload({ type: 'email', emailTo: 'a@b.co', emailSubject: 'Hi', emailBody: 'There' });
    expect(p.startsWith('mailto:a@b.co?')).toBe(true);
    expect(p).toContain('subject=Hi');
    expect(p).toContain('body=There');
  });
  it('wifi escapes special characters', () => {
    const p = buildQrPayload({ type: 'wifi', wifiSsid: 'My:Net;v2', wifiPassword: 'p@ss"word', wifiEncryption: 'WPA' });
    expect(p).toBe('WIFI:T:WPA;S:My\\:Net\\;v2;P:p@ss\\"word;');
  });
  it('validation errors on missing fields', () => {
    expect(requiredFieldsError({ type: 'wifi', wifiSsid: '' })).toBeTruthy();
    expect(requiredFieldsError({ type: 'wifi', wifiSsid: 'x' })).toBeNull();
  });
});

describe('buildUtms', () => {
  const base = { utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'sale', utm_term: '', utm_content: '' };
  it('appends only non-empty params', () => {
    expect(buildUtms('https://example.com/p', base)).toBe(
      'https://example.com/p?utm_source=instagram&utm_medium=social&utm_campaign=sale',
    );
  });
  it('preserves existing query params', () => {
    expect(buildUtms('https://example.com/p?a=1', base)).toContain('a=1');
    expect(buildUtms('https://example.com/p?a=1', base)).toContain('utm_source=instagram');
  });
  it('returns input as-is for non-URLs', () => {
    expect(buildUtms('not a url', base)).toBe('not a url');
  });
});

describe('buildMetaTags', () => {
  it('emits title, description, og and twitter tags', () => {
    const out = buildMetaTags({
      title: 'My Page',
      description: 'Desc',
      url: 'https://example.com/x',
      image: 'https://example.com/i.png',
      siteName: 'ToolBox',
      twitter: '@toolbox',
    });
    expect(out).toContain('<title>My Page</title>');
    expect(out).toContain('<meta property="og:title" content="My Page" />');
    expect(out).toContain('<meta name="twitter:site" content="@toolbox" />');
    expect(out).toContain('<link rel="canonical" href="https://example.com/x" />');
  });
  it('escapes quotes', () => {
    const out = buildMetaTags({ title: 'He said "hi"', description: '', url: '', image: '', siteName: '', twitter: '' });
    expect(out).toContain('He said &quot;hi&quot;');
  });
});

describe('parsePageRanges', () => {
  it('parses ranges and singles, de-dup and sorted', () => {
    expect(parsePageRanges('3, 1-2, 3', 10)).toEqual([1, 2, 3]);
  });
  it('rejects out-of-range pages', () => {
    expect(() => parsePageRanges('5', 3)).toThrow(/does not exist/);
  });
  it('rejects backwards ranges', () => {
    expect(() => parsePageRanges('3-1', 10)).toThrow(/backwards/);
  });
  it('rejects garbage', () => {
    expect(() => parsePageRanges('abc', 10)).toThrow(/not a valid/);
    expect(() => parsePageRanges('', 10)).toThrow(/at least one/);
  });
});

describe('generatePassword', () => {
  it('respects length and character sets', () => {
    const p = generatePassword({ length: 32, upper: false, lower: true, digits: false, symbols: false, noAmbiguous: false });
    expect(p).toHaveLength(32);
    expect(p).toMatch(/^[a-z]+$/);
  });
  it('removes ambiguous characters when asked', () => {
    const p = generatePassword({ length: 64, upper: true, lower: true, digits: true, symbols: false, noAmbiguous: true });
    expect(p).not.toMatch(/[Il1O0oB8S5Z2]/);
  });
  it('is empty when no set is selected', () => {
    expect(generatePassword({ length: 12, upper: false, lower: false, digits: false, symbols: false, noAmbiguous: false })).toBe('');
  });
  it('produces different passwords on repeat', () => {
    const a = generatePassword({ length: 24, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false });
    const b = generatePassword({ length: 24, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false });
    expect(a).not.toBe(b);
  });
});
