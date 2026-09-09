/** Keyword extraction → hashtags. Pure and tested. */

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has', 'had', 'was', 'were', 'are', 'is',
  'be', 'been', 'being', 'you', 'your', 'yours', 'we', 'our', 'ours', 'they', 'their', 'them', 'he',
  'she', 'his', 'her', 'it', 'its', 'i', 'me', 'my', 'as', 'at', 'by', 'in', 'on', 'of', 'to', 'up',
  'out', 'about', 'into', 'over', 'after', 'before', 'between', 'than', 'then', 'so', 'if', 'or',
  'not', 'no', 'yes', 'but', 'all', 'any', 'each', 'more', 'most', 'some', 'such', 'only', 'own',
  'same', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'here', 'there', 'when', 'what',
  'which', 'who', 'whom', 'why', 'how', 'new', 'get', 'one', 'two', 'also', 'because', 'while',
]);

/** Extract the most frequent meaningful words as hashtags (lowercased, no duplicates). */
export function extractHashtags(text: string, limit = 10): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9][a-z0-9'-]*[a-z0-9]|[a-z0-9]/g) || [];
  const counts = new Map<string, number>();
  for (const raw of matches) {
    const w = raw.replace(/^['-]+|['-]+$/g, '');
    if (w.length < 3) continue;
    if (STOPWORDS.has(w)) continue;
    if (/^\d+$/.test(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => `#${w}`);
}
