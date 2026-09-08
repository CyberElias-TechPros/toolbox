import { Suspense, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Tool } from '../registry/types';
import { CATEGORY_BY_ID } from '../registry/categories';
import { relatedTools } from '../registry';
import { track } from '../lib/track';
import { usePageMeta } from '../lib/meta';
import { Accordion } from './ui/Accordion';
import { Badge, SectionTitle, Spinner } from './ui/primitives';
import { ToolCard } from './ToolCard';

/**
 * The universal tool page template. Every tool shares the same layout:
 * tool → how to use → features → FAQ → related tools.
 */
export function ToolPage({ tool, children }: { tool: Tool; children: ReactNode }) {
  const category = CATEGORY_BY_ID[tool.category];
  const related = relatedTools(tool.slug);

  usePageMeta(
    `${tool.name} — Free Online Tool | ToolBox`,
    tool.description,
    `/tools/${tool.slug}`,
  );

  useEffect(() => {
    track('tool_opened', tool.slug);
  }, [tool.slug]);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 dark:text-zinc-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/tools" className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
              All tools
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to={`/category/${category.id}`} className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
              {category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-zinc-800 dark:text-zinc-200">
            {tool.name}
          </li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
            <span aria-hidden className="text-3xl">{tool.icon}</span>
            {tool.name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">{tool.tagline}</p>
        </div>
        <Badge tone="success" className="shrink-0">
          🔒 Private — runs in your browser
        </Badge>
      </header>

      <div className="mt-8">
        <Suspense fallback={<Spinner label="Loading tool…" />}>{children}</Suspense>
      </div>

      <section aria-labelledby="howto" className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle id="howto">How to use {tool.name.toLowerCase()}</SectionTitle>
          <ol className="mt-4 space-y-3">
            {tool.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionTitle>Features</SectionTitle>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {tool.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span aria-hidden className="mt-0.5 text-emerald-500">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="mt-14">
        <SectionTitle id="faq">Frequently asked questions</SectionTitle>
        <div className="mt-4">
          <Accordion items={tool.faq} />
        </div>
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related" className="mt-14">
          <SectionTitle id="related">You might also need</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">🔒 Privacy by design</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
          {tool.description} This tool processes your data entirely on your device using your browser’s own engines.
          Nothing is uploaded, stored or sent to a server — close the tab and your data is gone.
        </p>
      </section>
    </div>
  );
}
