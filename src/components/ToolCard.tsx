import { Link } from 'react-router-dom';
import type { Tool } from '../registry/types';
import { CATEGORY_BY_ID } from '../registry/categories';
import { Card } from './ui/primitives';

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const category = CATEGORY_BY_ID[tool.category];
  return (
    <Link to={`/tools/${tool.slug}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500">
      <Card
        className={`h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card-hover ${
          compact ? 'p-4' : ''
        }`}
      >
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-xl ring-1 ring-inset ring-indigo-500/20 transition-all group-hover:from-indigo-500/20 group-hover:to-violet-500/20 group-hover:ring-indigo-500/40"
          >
            {tool.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
              {tool.name}
            </h3>
            {!compact ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{tool.tagline}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {category?.name}
          <span
            aria-hidden
            className="translate-x-0 text-indigo-500 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
          >
            →
          </span>
        </div>
      </Card>
    </Link>
  );
}
