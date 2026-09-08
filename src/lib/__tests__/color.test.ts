import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, hslToRgb, normalizeHex, rgbToCmyk, rgbToHex, rgbToHsl, rgbToHsv } from '../color';

describe('hex', () => {
  it('normalizes 3- and 6-digit hex', () => {
    expect(normalizeHex('#4F46E5')).toBe('#4f46e5');
    expect(normalizeHex('#44f')).toBe('#4444ff');
    expect(normalizeHex('zzz')).toBeNull();
  });

  it('round-trips rgb', () => {
    const rgb = hexToRgb('#ff8800')!;
    expect(rgb).toEqual({ r: 255, g: 136, b: 0 });
    expect(rgbToHex(rgb)).toBe('#ff8800');
  });
});

describe('hsl/hsv/cmyk', () => {
  it('pure red → hsl(0,100%,50%)', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBeCloseTo(100, 5);
    expect(hsl.l).toBeCloseTo(50, 5);
  });

  it('hsl→rgb round trip', () => {
    const rgb = { r: 79, g: 70, b: 229 };
    const back = hslToRgb(rgbToHsl(rgb));
    expect(back.r).toBeCloseTo(rgb.r, 0);
    expect(back.g).toBeCloseTo(rgb.g, 0);
    expect(back.b).toBeCloseTo(rgb.b, 0);
  });

  it('white → cmyk(0,0,0,0); black → cmyk(0,0,0,100)', () => {
    expect(rgbToCmyk({ r: 255, g: 255, b: 255 })).toEqual({ c: 0, m: 0, y: 0, k: 0 });
    expect(rgbToCmyk({ r: 0, g: 0, b: 0 })).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it('hsv of pure blue', () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 255 });
    expect(hsv.h).toBeCloseTo(240, 0);
    expect(hsv.s).toBeCloseTo(100, 0);
    expect(hsv.v).toBeCloseTo(100, 0);
  });
});

describe('contrastRatio', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
  it('identical colors is 1:1', () => {
    expect(contrastRatio('#4f46e5', '#4f46e5')).toBeCloseTo(1, 5);
  });
});
