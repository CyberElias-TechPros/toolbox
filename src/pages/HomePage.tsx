import { Link } from 'react-router-dom';
import { CATEGORIES } from '../registry/categories';
import { featuredTools, TOOLS, toolsByCategory } from '../registry';
import { SearchBox } from '../components/SearchBox';
import { ToolCard } from '../components/ToolCard';
import { usePageMeta } from '../lib/meta';

const QUICK_HINTS = ['compress an image', 'convert PDF', 'calculate percentage', 'format JSON', 'create QR code'];

export function HomePage() {
  usePageMeta(
    'ToolBox — Everyday Tools, All in One Place',
    'Free, fast, private tools that work instantly in your browser. Compress images, merge PDFs, format JSON, calculate percentages, generate QR codes, invoices and more — no sign-up required.',
    '/',
  );
  const featured = featuredTools();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(99_102_241/0.14),transparent_70%)]"
        />
        <div className="container-page flex flex-col items-center pb-14 pt-16 text-center sm:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
            <span aria-hidden>⚡</span> No sign-up. No upload. Instant results.
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            The tools you need.
            <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              All in one place.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            Convert, compress, calculate, generate, format and create — quickly and privately from your browser.
          </p>

          <div className="mt-8 w-full max-w-xl">
            <SearchBox size="lg" />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Try:</span>
              {QUICK_HINTS.map((h) => (
                <Link
                  key={h}
                  to="/tools"
                  state={{ q: h }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                >
                  “{h}”
                </Link>
              ))}
            </div>
          </div>

          {/* Popular tools */}
          <div className="mt-12 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          {[
            { icon: '🔒', title: 'Private by design', text: 'Files are processed on your device. No upload, no server, no waiting, no account.' },
            { icon: '⚡', title: 'Instant & free', text: 'Every tool loads and runs in seconds, right in your browser. Free to use, no limits on the basics.' },
            { icon: '🧩', title: 'One coherent platform', text: `${TOOLS.length} tools, one design, one search. Chain tasks together without leaving the site.` },
          ].map((v) => (
            <div key={v.title} className="text-center sm:text-left">
              <span aria-hidden className="text-2xl">
                {v.icon}
              </span>
              <h2 className="mt-2 text-sm font-semibold">{v.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <Link to="/tools" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            All {TOOLS.length} tools →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span aria-hidden className="text-2xl">
                {c.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{c.tagline}</p>
              <span className="mt-3 inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {toolsByCategory(c.id).length} tools →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
