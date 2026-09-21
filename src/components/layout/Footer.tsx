import { Link } from 'react-router-dom';
import { Box, ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';
import { TOOLS } from '../../registry';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-page">
        <div className="footer-main">
          <div>
            <Link className="brand" to="/">
              <span className="brand-mark">
                <Box size={23} />
              </span>
              toolbox<span className="brand-dot">.</span>
            </Link>
            <p>
              Big possibilities. Little tools.
              <br />A little more time for what matters.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/tools">
              All {TOOLS.length} tools <ArrowUpRight size={14} />
            </Link>
            <Link to="/category/pdf">PDF & documents</Link>
            <Link to="/category/developer">Developer tools</Link>
          </div>
          <div className="footer-links">
            <Link to="/tools?view=new">Fresh in the box</Link>
            <Link to="/tools?view=favorites">Your favorites</Link>
            <span>
              <ShieldCheck size={15} /> Private by design
            </span>
          </div>
          <div className="footer-note">
            Less friction.
            <br />
            <em>More flow.</em>
            <span>Made for your everyday.</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Toolbox. Built to be useful.</span>
          <span>No accounts. No uploads. Just possibilities.</span>
          <span>
            Made with care <Heart size={12} />
          </span>
        </div>
      </div>
    </footer>
  );
}
