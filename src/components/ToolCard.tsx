import { Link } from 'react-router-dom';
import { ArrowUpRight, Star } from 'lucide-react';
import type { Tool } from '../registry/types';
import { ToolIcon } from './ToolIcon';
import { useFavorites } from '../lib/favorites';
export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const { favorites, toggle } = useFavorites();
  return (
    <article className={`tool-card ${compact ? 'compact' : ''}`}>
      <div className="tool-card-top">
        <span className={`tool-icon tone-${tool.category}`}>
          <ToolIcon category={tool.category} slug={tool.slug} />
        </span>
        <button
          className={`favorite-button ${favorites.includes(tool.slug) ? 'saved' : ''}`}
          onClick={() => toggle(tool.slug)}
          aria-label={`${favorites.includes(tool.slug) ? 'Unsave' : 'Save'} ${tool.name}`}
          aria-pressed={favorites.includes(tool.slug)}
        >
          <Star size={16} />
        </button>
      </div>
      <Link to={`/tools/${tool.slug}`} className="tool-card-link">
        <h3>
          {tool.name}
          <ArrowUpRight size={17} />
        </h3>
        {!compact && <p>{tool.tagline}</p>}
      </Link>
      <div className="card-bottom">
        <span>{tool.category === 'pdf' ? 'PDF & DOCUMENT' : tool.category.toUpperCase()}</span>
        {tool.tags.includes('new') ? (
          <span className="new-badge">NEW</span>
        ) : (
          <span className="free-label">
            Free <span>↗</span>
          </span>
        )}
      </div>
    </article>
  );
}
