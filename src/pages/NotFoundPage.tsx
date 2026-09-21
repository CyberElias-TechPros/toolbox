import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';

export function NotFoundPage() {
  usePageMeta('Page not found | Toolbox', 'The page you are looking for does not exist.', '/404');
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <span aria-hidden className="text-5xl">🧭</span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        The page you’re looking for doesn’t exist or has moved. Every tool lives at <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">/tools/…</code>.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Go home
        </Link>
        <Link
          to="/tools"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
