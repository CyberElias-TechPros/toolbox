import { Search, ArrowUpRight } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTools } from '../lib/search';
import { TOOLS } from '../registry';
import { cn } from '../lib/utils';
import { track } from '../lib/track';

const SEARCHABLE = TOOLS.map((t) => ({
  slug: t.slug,
  name: t.name,
  tagline: t.tagline,
  tags: t.tags,
  aliases: t.aliases,
}));

/**
 * Universal search: type a task ("compress an image", "turn json into csv")
 * and get the tool that does it. Keyboard navigable.
 */
export function SearchBox({
  size = 'md',
  autoFocus = false,
  onNavigate,
}: {
  size?: 'md' | 'lg';
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchTools(query, SEARCHABLE).slice(0, 6), [query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery('');
    track('search_performed', slug);
    onNavigate?.();
    navigate(`/tools/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && hits[active]) {
        e.preventDefault();
        go(hits[active].slug);
      } else if (query.trim()) {
        track('search_performed', 'all-tools');
        onNavigate?.();
        navigate(`/tools?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const large = size === 'lg';
  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-white shadow-card transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/25 dark:bg-zinc-900',
          large
            ? 'border-transparent px-5 py-4 ring-1 ring-zinc-200 dark:ring-zinc-800'
            : 'border-zinc-300 px-3.5 py-2.5 dark:border-zinc-700',
        )}
      >
        <span aria-hidden className={cn('shrink-0 text-zinc-400', large ? 'text-lg' : 'text-sm')}>
          <Search size={19} strokeWidth={1.7} />
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-label="Search tools"
          aria-controls={open && hits.length ? listId : undefined}
          aria-activedescendant={open && hits[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          placeholder={large ? 'What can we help you do?' : 'Search tools…'}
          className={cn(
            'w-full bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500',
            large ? 'text-base sm:text-lg' : 'text-sm',
          )}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        ) : null}
      </div>

      {open && query.trim() ? (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card-hover dark:border-zinc-800 dark:bg-zinc-900">
          {hits.length === 0 ? (
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">No exact tool found</p>
              <button
                className="mt-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                onClick={() => {
                  track('search_performed', 'all-tools');
                  onNavigate?.();
                  navigate(`/tools?q=${encodeURIComponent(query.trim())}`);
                }}
              >
                See all tools and filter by “{query.trim()}” →
              </button>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Tool suggestions">
              {hits.map((hit, i) => (
                <li id={`${listId}-${i}`} key={hit.slug} role="option" aria-selected={i === active}>
                  <button
                    className={cn(
                      'flex w-full items-center gap-3 px-5 py-3 text-left text-sm',
                      i === active
                        ? 'bg-indigo-50 dark:bg-indigo-950/50'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
                    )}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit.slug)}
                  >
                    <ArrowUpRight aria-hidden size={18} className="text-indigo-500" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {hit.name}
                      </span>
                      <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {hit.tagline}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
