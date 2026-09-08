import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../registry/categories';
import { featuredTools } from '../../registry';

export function Footer() {
  const featured = featuredTools().slice(0, 6);
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white">
              🧰
            </span>
            <span className="text-lg font-bold tracking-tight">
              Tool<span className="text-indigo-600 dark:text-indigo-400">Box</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            One place for the little things you need to get done. Free, fast, private — no unnecessary sign-ups.
          </p>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            🔒 Most tools run entirely in your browser. Your files never leave your device.
          </p>
        </div>

        <nav aria-label="Categories">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Categories</h3>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.id}`} className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Popular tools">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Popular</h3>
          <ul className="mt-3 space-y-2">
            {featured.map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/tools" className="text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                All tools
              </Link>
            </li>
            <li className="text-zinc-400 dark:text-zinc-500">Privacy-first by design</li>
            <li className="text-zinc-400 dark:text-zinc-500">No account needed</li>
            <li className="text-zinc-400 dark:text-zinc-500">Works offline once loaded</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-zinc-400 sm:flex-row dark:text-zinc-500">
          <span>© {new Date().getFullYear()} ToolBox. Built to be useful.</span>
          <span>Free. Fast. Private. No unnecessary sign-ups.</span>
        </div>
      </div>
    </footer>
  );
}
