/** Natural-language tool search: maps what users type to the right tool. */

export interface SearchableTool {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  aliases: string[];
}

export interface SearchHit {
  slug: string;
  name: string;
  tagline?: string;
  score: number;
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'can', 'could', 'do', 'for', 'from', 'get', 'give',
  'i', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'need', 'of', 'on', 'or', 'please', 'some',
  'that', 'the', 'them', 'then', 'there', 'these', 'this', 'to', 'up', 'want', 'we', 'what',
  'which', 'will', 'with', 'you', 'your', 'how', 'i\'d',
]);

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9%]+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Score tools against a free-text query.
 *
 * Signals, strongest first:
 *  - exact name match
 *  - name contained in query / query contained in name
 *  - full alias phrase present in query ("compress image", "merge pdf")
 *  - individual tag/token overlap
 */
export function searchTools(query: string, tools: SearchableTool[]): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = tokenize(query);
  const hits: SearchHit[] = [];

  for (const tool of tools) {
    const name = normalize(tool.name);
    let score = 0;

    if (name === q) score += 100;
    else {
      if (name.includes(q) || q.includes(name)) score += 45;
      // alias phrases
      for (const alias of tool.aliases) {
        const a = normalize(alias);
        if (a === q) score += 60;
        else if (q.includes(a)) score += Math.min(35, 10 + a.split(' ').length * 8);
        else if (a.includes(q) && q.length >= 4) score += 15;
      }
      // token overlap across name + tags + aliases
      const hay = new Set<string>([...tokenize(tool.name), ...tool.tags, ...tool.aliases].flatMap((s) => tokenize(s)));
      let matched = 0;
      for (const t of tokens) {
        if (hay.has(t)) matched++;
        else {
          // light prefix match so "compressing" hits "compress"
          if ([...hay].some((h) => h.startsWith(t) || t.startsWith(h) && t.length > 3)) matched += 0.6;
        }
      }
      if (matched > 0) score += matched * 6 + (matched === tokens.length ? 8 : 0);
    }

    if (score > 10) hits.push({ slug: tool.slug, name: tool.name, tagline: tool.tagline, score });
  }

  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
