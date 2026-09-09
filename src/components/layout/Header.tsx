import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CATEGORIES } from '../../registry/categories';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import { SearchBox } from '../SearchBox';

function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-lg shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="container-page flex h-16 items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="ToolBox home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg text-white shadow-sm">
            🧰
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Tool<span className="text-indigo-600 dark:text-indigo-400">Box</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <NavLink
            to="/tools"
            className={({ isActive }) =>
              cn(
                'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
              )
            }
          >
            All tools
          </NavLink>
          <div className="relative">
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Categories <span aria-hidden className="text-xs">▾</span>
            </button>
            {catsOpen ? (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-2 shadow-card-hover dark:border-zinc-800 dark:bg-zinc-900">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.id}`}
                    onClick={() => setCatsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                  >
                    <span aria-hidden>{c.icon}</span>
                    <span>
                      <span className="block font-medium">{c.name}</span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">{c.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="ml-auto hidden w-64 md:block xl:w-80">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-lg shadow-sm lg:hidden dark:border-zinc-700 dark:bg-zinc-900"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="container-page pb-3 md:hidden">
        <SearchBox onNavigate={() => setMenuOpen(false)} />
      </div>

      {/* Mobile menu */}
      {menuOpen ? (
        <nav aria-label="Mobile" className="border-t border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="container-page grid gap-1 py-3">
            <Link
              to="/tools"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              🧰 All tools
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <span aria-hidden className="mr-2">{c.icon}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
