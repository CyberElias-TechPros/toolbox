import { describe, expect, it } from 'vitest';
import { applyStyle, STYLES } from '../unicode';

// NOTE: astral code points (> U+FFFF) must be written as surrogate pairs in
// string literals — '\u1d400' would be U+1D40 followed by "0".
const CP = String.fromCodePoint;

describe('unicode styles', () => {
  it('all styles produce output for typical text', () => {
    for (const s of STYLES) {
      expect(s.sample('Hi 123').length).toBeGreaterThan(0);
    }
  });

  it('bold maps to mathematical bold code points', () => {
    expect(applyStyle('bold', 'A')).toBe(CP(0x1d400));
    expect(applyStyle('bold', 'a')).toBe(CP(0x1d41a));
    expect(applyStyle('bold', '1')).toBe(CP(0x1d7cf)); // 0x1d7ce is 𝟎
  });

  it('italic and monospace use their own ranges', () => {
    expect(applyStyle('italic', 'A')).toBe(CP(0x1d434));
    expect(applyStyle('mono', 'a')).toBe(CP(0x1d68a));
    expect(applyStyle('mono', '9')).toBe(CP(0x1d801));
  });

  it('digits and punctuation pass through where unmapped', () => {
    expect(applyStyle('bold', 'a b')).toBe(CP(0x1d41a) + ' ' + CP(0x1d41b));
    expect(applyStyle('superscript', '2')).toBe('\u00b2');
    expect(applyStyle('subscript', '1')).toBe('\u2081');
  });

  it('fullwidth maps ASCII to wide forms', () => {
    expect(applyStyle('fullwidth', 'A0')).toBe(CP(0xff21) + CP(0xff10));
  });

  it('encircled maps letters and some digits', () => {
    expect(applyStyle('encircled', 'a')).toBe('\u24d0');
    expect(applyStyle('encircled', '1')).toBe('\u2460');
  });

  it('combining styles keep spaces clean', () => {
    expect(applyStyle('strikethrough', 'ab c')).toBe('a\u0336b\u0336 c\u0336');
    expect(applyStyle('underline', 'a b')).toBe('a\u0332 b\u0332');
  });
});
