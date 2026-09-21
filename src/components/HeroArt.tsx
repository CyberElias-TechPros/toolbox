import { FileText, Image, Braces, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
export function HeroArt() {
  return (
    <div className="hero-art" aria-label="Your everyday tools, beautifully connected">
      <div className="art-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="art-spark spark-one">✳</span>
      <span className="art-spark spark-two">+</span>
      <div className="floating-label label-top">
        <span className="status-dot" /> A little less busywork.
      </div>
      <Link to="/tools/word-to-pdf" className="art-file art-word" aria-label="Open Word to PDF">
        <span className="file-fold" />
        <div className="file-letter">W</div>
        <div className="document-lines">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="art-file-name">DOCUMENT.DOCX</span>
      </Link>
      <Link to="/tools/image-converter" className="art-file art-image" aria-label="Open image converter">
        <span className="file-fold" />
        <Image size={42} strokeWidth={1.2} />
        <div className="landscape">
          <span className="landscape-sun" />
          <div className="mountain one" />
          <div className="mountain two" />
        </div>
        <span className="art-file-name">SOMETHING.GREAT</span>
      </Link>
      <Link to="/tools/pdf-merger" className="art-file art-pdf" aria-label="Open PDF merger">
        <span className="file-fold" />
        <FileText size={39} strokeWidth={1.3} />
        <strong>PDF</strong>
        <div className="document-lines">
          <i />
          <i />
          <i />
        </div>
        <span className="art-file-name">POSSIBILITIES.PDF</span>
      </Link>
      <Link to="/tools/json-formatter" className="code-tile" aria-label="Open JSON formatter">
        <Braces size={34} strokeWidth={1.4} />
      </Link>
      <div className="toolbox-shadow" />
      <div className="box-back" />
      <div className="box-side" />
      <div className="box-front">
        <div className="box-ridge" />
        <span>
          make room
          <br />
          for <em>more.</em>
        </span>
        <ArrowUpRight size={34} />
        <div className="box-handle" />
      </div>
      <div className="floating-label label-bottom">
        <span className="art-check">
          <Check size={13} />
        </span>
        Done. Just like that.
        <Sparkles size={13} />
      </div>
      <div className="art-caption">ONE BOX. ENDLESS POSSIBILITIES.</div>
    </div>
  );
}
