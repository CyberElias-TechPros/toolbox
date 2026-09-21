import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Check,
  SlidersHorizontal,
  Sparkles,
  FileText,
  Command,
} from 'lucide-react';
import { CATEGORIES } from '../registry/categories';
import { TOOLS, getTool } from '../registry';
import { SearchBox } from '../components/SearchBox';
import { ToolCard } from '../components/ToolCard';
import { HeroArt } from '../components/HeroArt';
import { ToolIcon } from '../components/ToolIcon';
import { usePageMeta } from '../lib/meta';
const popular = [
  'word-to-pdf',
  'combine-word-to-pdf',
  'image-compressor',
  'pdf-merger',
  'image-converter',
  'qr-generator',
  'json-formatter',
  'word-counter',
];
export function HomePage() {
  usePageMeta(
    'Toolbox — Less busywork. More possibility.',
    `${TOOLS.length} free, private tools for documents, images, code and everything in between.`,
    '/',
  );
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const selected =
    category === 'all'
      ? popular.map((s) => getTool(s)).filter((t): t is NonNullable<typeof t> => !!t)
      : TOOLS.filter((t) => t.category === category).slice(0, 8);
  const tools = sort === 'az' ? [...selected].sort((a, b) => a.name.localeCompare(b.name)) : selected;
  return (
    <div className="home-page">
      <section className="container-page hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> YOUR EVERYDAY, UPGRADED
          </div>
          <h1>
            Small tools.
            <br />
            Big <span className="serif-word">possibilities.</span>
          </h1>
          <p>
            For the things between you and your next big thing.
            <br className="desktop-break" /> Convert, create, and get it done. All in one little box.
          </p>
          <div className="hero-search">
            <SearchBox size="lg" />
            <kbd>
              <Command size={12} /> K
            </kbd>
          </div>
          <div className="try-links">
            <span>Try</span>
            <Link to="/tools/word-to-pdf">
              Word to PDF <ArrowUpRight size={11} />
            </Link>
            <Link to="/tools/image-compressor">
              Compress image <ArrowUpRight size={11} />
            </Link>
            <Link to="/tools/pdf-merger">
              Merge PDFs <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <Check size={13} /> Completely free
            </span>
            <span>
              <Check size={13} /> No sign-up
            </span>
            <span>
              <Check size={13} /> Yours, privately
            </span>
          </div>
        </div>
        <HeroArt />
      </section>
      <div className="trust-strip">
        <div className="container-page">
          <span>
            <strong>
              {TOOLS.length}
              <i>+</i>
            </strong>{' '}
            tools. Infinite potential.
          </span>
          <span>
            <ShieldCheck /> Your files never leave your device
          </span>
          <span>
            <Zap /> Less waiting. More doing.
          </span>
          <span className="trust-last">
            <span className="status-dot" /> Always free. Actually.
          </span>
        </div>
      </div>
      <section className="container-page tools-section" id="discover">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted">THE RIGHT TOOL, RIGHT HERE</div>
            <h2>
              A good place to <em>start.</em>
            </h2>
          </div>
          <Link className="text-link" to="/tools">
            Explore all {TOOLS.length} tools <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="filter-row">
          <div className="category-tabs">
            <button className={category === 'all' ? 'selected' : ''} onClick={() => setCategory('all')}>
              <Sparkles size={15} /> Popular
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? 'selected' : ''}
                onClick={() => setCategory(c.id)}
              >
                <ToolIcon category={c.id} size={15} />
                {
                  {
                    pdf: 'PDF & Docs',
                    image: 'Image',
                    text: 'Text',
                    developer: 'Developer',
                    calculator: 'Calculators',
                    marketing: 'Marketing',
                    business: 'Business',
                    utility: 'Utilities',
                  }[c.id]
                }
              </button>
            ))}
          </div>
          <label className="sort-button">
            <SlidersHorizontal size={15} />
            <select aria-label="Sort tools" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Popular</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        </div>
        <div className="home-tools-grid" key={category}>
          {tools.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
        <div className="browse-bottom">
          <span>A tool for just about everything.</span>
          <Link to={category === 'all' ? '/tools' : `/category/${category}`}>
            Find yours <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="container-page">
        <div className="document-feature">
          <div className="feature-copy">
            <span className="feature-eyebrow">
              <span /> FRESH IN THE BOX
            </span>
            <h2>
              Many documents.
              <br />
              <em>One happy ending.</em>
            </h2>
            <p>
              Turn your Word documents into one polished PDF.
              <br />
              Drop them in. Put them in order. And you’re done.
            </p>
            <Link to="/tools/combine-word-to-pdf">
              Combine Word to PDF <ArrowUpRight size={17} />
            </Link>
            <span className="feature-note">
              <ShieldCheck size={13} /> On your device. Off everyone else’s radar.
            </span>
          </div>
          <div className="feature-flow">
            <div className="flow-docs">
              <div className="mini-doc">
                <span>W</span>
                <i />
                <i />
                <i />
                <small>Proposal.docx</small>
              </div>
              <div className="mini-doc second">
                <span>W</span>
                <i />
                <i />
                <i />
                <small>Appendix.docx</small>
              </div>
            </div>
            <div className="flow-arrow">
              <span />
              <ArrowRight size={23} />
              <span />
            </div>
            <div className="flow-pdf">
              <FileText size={29} />
              <strong>PDF</strong>
              <i />
              <i />
              <small>All together. Better.</small>
              <span className="flow-success">
                <Check size={15} />
              </span>
            </div>
            <div className="flow-caption">
              01. ADD <span>02. ARRANGE</span> 03. DOWNLOAD
            </div>
          </div>
        </div>
      </section>
      <section className="container-page category-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted">A BOX FOR EVERY KIND OF BUSY</div>
            <h2>
              What’s on your <em>list?</em>
            </h2>
          </div>
          <Link className="text-link" to="/tools">
            Browse the collection <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link to={`/category/${c.id}`} key={c.id}>
              <span className={`tool-icon tone-${c.id}`}>
                <ToolIcon category={c.id} />
              </span>
              <div>
                <h3>{c.name.replace(' Tools', '').replace(' & Converter', '')}</h3>
                <p>{TOOLS.filter((t) => t.category === c.id).length} little problem-solvers</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="container-page philosophy">
        <span className="philosophy-mark">✳</span>
        <h2>
          Less jumping between tabs.
          <br />
          <em>More getting on with life.</em>
        </h2>
        <p>
          No installs. No “just one more account.” No catch.
          <br />
          Just thoughtfully made tools, ready when you are.
        </p>
        <Link to="/tools" className="orange-button">
          Open your toolbox <ArrowUpRight size={17} />
        </Link>
      </section>
    </div>
  );
}
