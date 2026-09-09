import { describe, expect, it } from 'vitest';
import { cleanText, convertCase, countText, DEFAULT_CLEANER_OPTIONS, diffWords, loremIpsum } from '../text';

describe('countText', () => {
  it('counts words, characters, sentences and paragraphs', () => {
    const s = 'Hello world. This is a test.\n\nSecond paragraph!';
    const st = countText(s);
    expect(st.words).toBe(8);
    expect(st.characters).toBe(s.length);
    expect(st.charactersNoSpaces).toBe(s.replace(/\s/g, '').length);
    expect(st.sentences).toBe(3);
    expect(st.paragraphs).toBe(2);
    expect(st.lines).toBe(3);
  });

  it('handles empty input', () => {
    const st = countText('');
    expect(st.words).toBe(0);
    expect(st.sentences).toBe(0);
    expect(st.readingSeconds).toBe(0);
  });

  it('estimates reading time at 200wpm', () => {
    const st = countText(' '.padEnd(0) + Array.from({ length: 400 }, (_, i) => `w${i}`).join(' '));
    expect(st.readingSeconds).toBe(120);
  });
});

describe('convertCase', () => {
  const input = 'hello world example';

  it('UPPERCASE / lowercase', () => {
    expect(convertCase(input, 'upper')).toBe('HELLO WORLD EXAMPLE');
    expect(convertCase(input, 'lower')).toBe('hello world example');
  });

  it('Title Case ignores small words mid-title', () => {
    expect(convertCase('the quick brown fox', 'title')).toBe('The Quick Brown Fox');
    expect(convertCase('war and peace', 'title')).toBe('War and Peace');
  });

  it('Sentence case capitalizes after punctuation', () => {
    expect(convertCase('hello. new world', 'sentence')).toBe('Hello. New world');
  });

  it('programmer cases split camelCase input', () => {
    expect(convertCase('helloWorldFoo', 'camel')).toBe('helloWorldFoo');
    expect(convertCase('hello world foo', 'pascal')).toBe('HelloWorldFoo');
    expect(convertCase('hello world', 'snake')).toBe('hello_world');
    expect(convertCase('hello world', 'kebab')).toBe('hello-world');
    expect(convertCase('hello world', 'constant')).toBe('HELLO_WORLD');
  });

  it('empty input yields empty output', () => {
    expect(convertCase('', 'title')).toBe('');
  });
});

describe('cleanText', () => {
  it('removes extra spaces, blank lines and duplicate lines', () => {
    const input = 'HELLO     WORLD\n\n\nThis   is    a   test.\nThis   is    a   test.\nlast line';
    const out = cleanText(input, { ...DEFAULT_CLEANER_OPTIONS, removeDuplicateLines: true });
    expect(out).toBe('HELLO WORLD\nThis is a test.\nlast line');
  });

  it('converts tabs to spaces', () => {
    expect(cleanText('a\tb', { ...DEFAULT_CLEANER_OPTIONS, tabsToSpaces: true, collapseSpaces: false })).toBe('a  b');
  });

  it('removes all line breaks when asked', () => {
    expect(cleanText('one\ntwo\nthree', { ...DEFAULT_CLEANER_OPTIONS, removeNewlines: true })).toBe('one two three');
  });

  it('sorts lines numerically', () => {
    const out = cleanText('item 10\nitem 2\nitem 1', { ...DEFAULT_CLEANER_OPTIONS, sortNumeric: true });
    expect(out.split('\n')[0]).toBe('item 1');
    expect(out.split('\n')[1]).toBe('item 2');
    expect(out.split('\n')[2]).toBe('item 10');
  });
});

describe('diffWords', () => {
  it('detects added and removed words', () => {
    const segs = diffWords('the cat sat', 'the cat sat on a mat');
    expect(segs.some((s) => s.type === 'added' && s.text === 'on a mat')).toBe(true);
    expect(segs.filter((s) => s.type === 'same').map((s) => s.text).join(' ')).toContain('the cat sat');
  });

  it('identical texts produce only "same"', () => {
    const segs = diffWords('same text here', 'same text here');
    expect(segs.every((s) => s.type === 'same')).toBe(true);
  });

  it('completely different texts show all removed + all added', () => {
    const segs = diffWords('aaa bbb', 'ccc ddd');
    expect(segs.some((s) => s.type === 'removed')).toBe(true);
    expect(segs.some((s) => s.type === 'added')).toBe(true);
  });
});

describe('loremIpsum', () => {
  it('generates the requested number of paragraphs', () => {
    const out = loremIpsum(3, 'paragraphs');
    expect(out.split('\n\n').length).toBe(3);
  });

  it('starts with the classic phrase when asked', () => {
    expect(loremIpsum(2, 'paragraphs', true).startsWith('Lorem ipsum dolor sit amet,')).toBe(true);
  });

  it('respects word counts', () => {
    const out = loremIpsum(25, 'words');
    // starts with 5-word classic phrase + 25 words
    expect(out.split(' ').length).toBeGreaterThanOrEqual(25);
  });
});
