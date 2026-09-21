import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, ArrowUpRight, ChevronDown, Moon, Sun, Menu, X, Star } from 'lucide-react';
import { CATEGORIES } from '../../registry/categories';
import { useTheme } from '../../lib/theme';
import { ToolIcon } from '../ToolIcon';
export function Header() {
  const [theme, toggle] = useTheme();
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState(false);
  const { pathname, search } = useLocation();
  useEffect(() => {
    setOpen(false);
    setCats(false);
  }, [pathname, search]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setCats(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search tools"],input[aria-label="Filter tools"]',
        );
        if (input) {
          input.scrollIntoView({ block: 'center' });
          input.focus();
        } else window.location.href = '/tools';
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return (
    <header className="site-header">
      <div className="container-page header-inner">
        <Link to="/" className="brand" aria-label="Toolbox home">
          <span className="brand-mark">
            <Box size={24} strokeWidth={1.7} />
          </span>
          toolbox<span className="brand-dot">.</span>
        </Link>
        <nav className={`main-nav ${open ? 'nav-open' : ''}`} aria-label="Primary">
          <Link className={pathname === '/tools' && !search ? 'active' : ''} to="/tools">
            All tools
          </Link>
          <div className="nav-categories">
            <button onClick={() => setCats(!cats)} aria-expanded={cats}>
              Categories <ChevronDown size={13} />
            </button>
            {cats && (
              <>
                <button className="menu-scrim" aria-label="Close categories" onClick={() => setCats(false)} />
                <div className="category-menu">
                  {CATEGORIES.map((c) => (
                    <Link key={c.id} to={`/category/${c.id}`}>
                      <span className={`tool-icon tone-${c.id}`}>
                        <ToolIcon category={c.id} size={18} />
                      </span>
                      {c.name.replace(' Tools', '')}
                      <ArrowUpRight size={14} />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link className={search.includes('view=new') ? 'active' : ''} to="/tools?view=new">
            What’s new <span className="nav-new">NEW</span>
          </Link>
          <Link
            to="/tools?view=favorites"
            className={`favorites-nav ${search.includes('view=favorites') ? 'active' : ''}`}
          >
            <Star size={14} /> Favorites
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="theme-button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link className="header-cta" to="/tools">
            Explore tools <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
