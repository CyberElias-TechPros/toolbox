/** HTML ↔ plain-text conversion.
 * htmlToText needs a browser (DOMParser); textToHtml is pure. */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Strip tags and keep a readable plain-text version of the HTML. */
export function htmlToText(html: string): string {
  if (typeof DOMParser === 'undefined') {
    throw new Error('htmlToText requires a browser environment.');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,noscript,template').forEach((el) => el.remove());
  const blocks = 'p,div,section,article,li,td,th,tr,h1,h2,h3,h4,h5,h6,br,header,footer,table,ul,ol,blockquote,pre';
  doc.body.querySelectorAll(blocks).forEach((el) => el.insertAdjacentText('beforeend', '\n'));
  const text = (doc.body.textContent ?? '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

export function textToHtml(text: string, blankLines: 'paragraph' | 'break' = 'paragraph'): string {
  if (blankLines === 'break') {
    return `<p>${esc(text).replace(/\n/g, '<br/>')}</p>`;
  }
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${esc(b).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}
