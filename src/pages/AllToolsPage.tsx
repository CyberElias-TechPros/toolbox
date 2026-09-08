import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TOOLS } from '../registry';
import { CATEGORIES } from '../registry/categories';
import { searchTools } from '../lib/search';
import { usePageMeta } from '../lib/meta';
import { ToolCard } from '../components/ToolCard';
import { Input } from '../components/ui/fields';
import { cn } from '../lib/utils';

const SEARCHABLE = TOOLS.map((t) => ({ slug: t.slug, name: t.name, tagline: t.tagline, tags: t.tags, aliases: t.aliases }));

export function AllToolsPage() {
  usePageMeta(
    'All Tools | ToolBox',
    `Browse all ${TOOLS.length} free online tools: image tools, PDF tools, text tools, developer tools, calculators, converters, marketing and business tools.`,
    '/tools',
  );
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? (location.state as { q?: string } | null)?.q ?? '';
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState<string>('all');

  const results = useMemo(() => {
    let list = TOOLS;
    if (cat !== 'all') list = list.filter((t) => t.category === cat);
    const query = q.trim();
    if (!query) return list;
    const hits = new Set(searchTools(query, SEARCHABLE).map((h) => h.slug));
    // Fallback: simple substring match so the list view always yields *something*.
    const loose = list.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tagline.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
    );
    const scored = loose.filter((t) => hits.has(t.slug));
    const rest = loose.filter((t) => !hits.has(t.slug));
    return [...scored, ...rest];
  }, [q, cat]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">All tools</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {TOOLS.length} free tools. Search by task or filter by category.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          aria-label="Filter tools"
          placeholder='Search by task — e.g. "compress image", "json"…'
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
          }}
          className="sm:max-w-md"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          <button
            onClick={() => setCat('all')}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              cat === 'all'
                ? 'bg-indigo-600 text-white'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                cat === c.id
                  ? 'bg-indigo-600 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
              )}
            >
              {c.icon} {c.name.replace(' Tools', '')}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span aria-hidden className="text-4xl">🔍</span>
          <h2 className="mt-4 text-lg font-semibold">No tools match “{q}”</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Try a different word — or browse the full list.</p>
          <button
            onClick={() => setQ('')}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      )}
    </div>
  );
}
