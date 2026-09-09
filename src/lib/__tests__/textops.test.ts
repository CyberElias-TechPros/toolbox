import { describe, expect, it } from 'vitest';
import { sortLines, textToList } from '../textops';

describe('sortLines', () => {
  it('sorts alphabetically, case-insensitively by default', () => {
    expect(sortLines('b\na\nA\nz', { direction: 'asc', unique: false, caseSensitive: false, numeric: false })).toBe('a\nA\nb\nz');
  });

  it('removes duplicates when unique', () => {
    expect(sortLines('b\na\nb\nA', { direction: 'asc', unique: true, caseSensitive: false, numeric: false })).toBe('a\nA\nb');
  });

  it('sorts numerically when requested', () => {
    expect(sortLines('10\n2\n30\n1', { direction: 'asc', unique: false, caseSensitive: false, numeric: true })).toBe('1\n2\n10\n30');
  });

  it('descends', () => {
    expect(sortLines('a\nb\nc', { direction: 'desc', unique: false, caseSensitive: true, numeric: false })).toBe('c\nb\na');
  });

  it('mixes numbers and words without crashing', () => {
    const out = sortLines('apple\n5\n10\nBanana', { direction: 'asc', unique: false, caseSensitive: false, numeric: true });
    expect(out.split('\n')).toEqual(['5', '10', 'apple', 'Banana']);
  });
});

describe('textToList', () => {
  it('numbers items from lines', () => {
    expect(textToList('apple\nbanana', { marker: 'numbered', splitBy: 'line' })).toBe('1. apple\n2. banana');
  });

  it('splits on commas', () => {
    expect(textToList('a, b, c', { marker: 'bullet', splitBy: 'comma' })).toBe('• a\n• b\n• c');
  });

  it('strips pre-existing bullet markers', () => {
    expect(textToList('- x\n* y', { marker: 'dash', splitBy: 'line' })).toBe('- x\n- y');
  });
});
