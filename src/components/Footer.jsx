import { Logo } from './Header'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p className="muted small">
            ScaleNotes: system design explained in plain words, with animated diagrams. Built with React by Yasowant, MERN developer.
          </p>
        </div>
        <div className="footer-links">
          <a href="https://yasowantdev.info" target="_blank" rel="noreferrer">Portfolio ↗</a>
          <a href="https://github.com/Yasowant" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://instagram.com/yasowant.dev" target="_blank" rel="noreferrer">Instagram ↗</a>
        </div>
        <p className="muted tiny credits">
          Topic list inspired by{' '}
          <a href="https://github.com/liquidslr/system-design-notes" target="_blank" rel="noreferrer">liquidslr/system-design-notes</a>{' '}
          and Alex Xu’s <i>System Design Interview</i> (Vol. 1 &amp; 2). All explanations on this site are original.
        </p>
      </div>
    </footer>
  )
}
