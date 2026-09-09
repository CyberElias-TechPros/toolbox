import { describe, expect, it } from 'vitest';
import { convertValue, discount, FILE_SIZES, isPercentOf, percentChange, percentOf, temperatureC, temperatureFromC } from '../units';

describe('file sizes', () => {
  it('1 GB = 1000 MB (decimal)', () => {
    expect(convertValue(FILE_SIZES, 'gb', 'mb', 1)).toBeCloseTo(1000, 9);
  });
  it('1 GiB = 1024 MiB (binary)', () => {
    expect(convertValue(FILE_SIZES, 'gib', 'mib', 1)).toBeCloseTo(1024, 9);
  });
  it('100 MB ≈ 95.367 MiB', () => {
    expect(convertValue(FILE_SIZES, 'mb', 'mib', 100)).toBeCloseTo(95.3674, 3);
  });
});

describe('temperature', () => {
  it('0°C = 32°F', () => {
    expect(temperatureFromC(0, 'f')).toBeCloseTo(32, 9);
  });
  it('100°C = 373.15 K', () => {
    expect(temperatureFromC(100, 'k')).toBeCloseTo(373.15, 9);
  });
  it('212°F → 100°C', () => {
    expect(temperatureC('f', 212)).toBeCloseTo(100, 9);
  });
});

describe('percentages', () => {
  it('20% of 50000 = 10000', () => {
    expect(percentOf(20, 50000)).toBe(10000);
  });
  it('50 is 25% of 200', () => {
    expect(isPercentOf(50, 200)).toBeCloseTo(25, 9);
  });
  it('whole of zero is a guard error (null)', () => {
    expect(isPercentOf(5, 0)).toBeNull();
  });
  it('percent change from 100 to 150 is +50%', () => {
    const { change, direction } = percentChange(100, 150);
    expect(direction).toBe('increase');
    expect(change).toBeCloseTo(50, 9);
  });
  it('percent change from 100 to 80 is -20%', () => {
    const { change, direction } = percentChange(100, 80);
    expect(direction).toBe('decrease');
    expect(change).toBeCloseTo(-20, 9);
  });
  it('discount: 15% off 120 → 102, saved 18', () => {
    const d = discount(120, 15);
    expect(d.final).toBeCloseTo(102, 9);
    expect(d.saved).toBeCloseTo(18, 9);
  });
});
