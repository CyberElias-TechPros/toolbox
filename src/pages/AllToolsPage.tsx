import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Search, Sparkles } from 'lucide-react';
import { TOOLS } from '../registry';
import { CATEGORIES } from '../registry/categories';
import { searchTools } from '../lib/search';
import { usePageMeta } from '../lib/meta';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { Input } from '../components/ui/fields';
import { useFavorites } from '../lib/favorites';
export function AllToolsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '',
    cat = params.get('category') || 'all',
    view = params.get('view') || 'all';
  const { favorites } = useFavorites();
  usePageMeta(
    `${view === 'favorites' ? 'Your favorites' : view === 'new' ? 'Fresh in the box' : 'All tools'} | Toolbox`,
    `Explore ${TOOLS.length} free tools.`,
    '/tools',
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value && value !== 'all' ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const results = useMemo(() => {
    let list = TOOLS.filter(
      (t) =>
        (cat === 'all' || t.category === cat) &&
        (view !== 'new' || t.tags.includes('new')) &&
        (view !== 'favorites' || favorites.includes(t.slug)),
    );
    if (q.trim()) {
      const hits = searchTools(q, list);
      const rank = new Map(hits.map((h, i) => [h.slug, i]));
      list = list.filter((t) => rank.has(t.slug)).sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!);
    }
    return list;
  }, [q, cat, view, favorites]);
  return (
    <div className="container-page library-page animate-fade-in">
      <div className="library-heading">
        <div>
          <div className="eyebrow muted">A LITTLE HELP GOES A LONG WAY</div>
          <h1>
            {view === 'favorites' ? (
              <>
                Your <em>favorites.</em>
              </>
            ) : view === 'new' ? (
              <>
                Fresh in the <em>box.</em>
              </>
            ) : (
              <>
                Find your <em>flow.</em>
              </>
            )}
          </h1>
          <p>
            {view === 'favorites'
              ? 'Your go-to tools. Right where you left them.'
              : view === 'new'
                ? 'More possibilities, freshly unpacked. Meet the latest additions.'
                : `${TOOLS.length} thoughtfully useful tools. No installs. No sign-ups. No limits on possibility.`}
          </p>
        </div>
        <span className="library-count">{results.length} TOOLS TO EXPLORE</span>
      </div>
      <div className="library-search">
        <Input
          aria-label="Filter tools"
          type="search"
          placeholder="What do you need to get done?"
          value={q}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>
      <div className="library-filters" role="group" aria-label="Filter by category">
        <button className={cat === 'all' ? 'active' : ''} onClick={() => update('category', 'all')}>
          <Sparkles size={14} /> All tools
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => update('category', c.id)}
            className={cat === c.id ? 'active' : ''}
          >
            <ToolIcon category={c.id} size={14} />
            {c.name.replace(' Tools', '').replace(' & Converter', '')}
            <small>{TOOLS.filter((t) => t.category === c.id).length}</small>
          </button>
        ))}
      </div>
      {results.length ? (
        <div className="home-tools-grid">
          {results.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {view === 'favorites' ? <Star /> : <Search />}
          <h2>{view === 'favorites' ? 'A little empty. A lot of potential.' : 'No tools found just yet.'}</h2>
          <p>
            {view === 'favorites'
              ? 'Tap the star on any tool to keep it here.'
              : 'Try a shorter search or another category.'}
          </p>
          <button className="orange-button" onClick={() => setParams({})}>
            Explore all tools
          </button>
        </div>
      )}
    </div>
  );
}
