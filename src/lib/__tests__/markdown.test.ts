import { describe, expect, it } from 'vitest';
import { mdToHtml } from '../markdown';

describe('mdToHtml', () => {
  it('renders headings', () => {
    expect(mdToHtml('# Hi')).toBe('<h1>Hi</h1>');
    expect(mdToHtml('### Deep')).toBe('<h3>Deep</h3>');
  });

  it('renders emphasis and code', () => {
    expect(mdToHtml('a **bold** and *ital* and `c()`')).toBe('<p>a <strong>bold</strong> and <em>ital</em> and <code>c()</code></p>');
  });

  it('escapes HTML in text', () => {
    expect(mdToHtml('evil <script>alert(1)</script>')).toBe('<p>evil &lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });

  it('renders links with safe attributes', () => {
    expect(mdToHtml('[x](https://e.com)')).toBe('<p><a href="https://e.com" target="_blank" rel="noopener noreferrer">x</a></p>');
  });

  it('renders unordered and ordered lists', () => {
    expect(mdToHtml('- a\n- b')).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
    expect(mdToHtml('1. a\n2. b')).toBe('<ol>\n<li>a</li>\n<li>b</li>\n</ol>');
  });

  it('renders blockquotes, hr and fenced code', () => {
    expect(mdToHtml('> quoted')).toBe('<blockquote>quoted</blockquote>');
    expect(mdToHtml('---')).toBe('<hr/>');
    expect(mdToHtml('```\nconst a = 1 < 2;\n```')).toBe('<pre><code>const a = 1 &lt; 2;</code></pre>');
  });

  it('joins soft-wrapped paragraph lines', () => {
    expect(mdToHtml('one two\nthree four')).toBe('<p>one two three four</p>');
  });
});
