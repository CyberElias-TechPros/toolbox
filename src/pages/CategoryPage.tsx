import { Link, Navigate, useParams } from 'react-router-dom';
import { CATEGORIES, CATEGORY_BY_ID } from '../registry/categories';
import { toolsByCategory } from '../registry';
import { usePageMeta } from '../lib/meta';
import { ToolCard } from '../components/ToolCard';

export function CategoryPage() {
  const { id = '' } = useParams();
  const category = CATEGORY_BY_ID[id];
  const tools = category ? toolsByCategory(id) : [];

  usePageMeta(
    category ? `${category.name} | ToolBox` : 'Category not found | ToolBox',
    category ? category.description : 'This category does not exist.',
    `/category/${id}`,
  );

  if (!category) return <Navigate to="/tools" replace />;

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 dark:text-zinc-400">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/tools" className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
              All tools
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-zinc-800 dark:text-zinc-200">
            {category.name}
          </li>
        </ol>
      </nav>

      <header className="mt-4 flex items-start gap-4">
        <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-3xl ring-1 ring-inset ring-indigo-500/20">
          {category.icon}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{category.description}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.id}`}
            className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-indigo-400"
          >
            {c.icon} {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
