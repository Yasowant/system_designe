import { Link } from 'react-router-dom'
import { comparisons } from '../data/comparisons'

export default function Compare() {
  return (
    <div className="container section page">
      <div className="page-head">
        <p className="eyebrow mono"><span className="dot" /> head to head</p>
        <h1>X <span className="serif">vs</span> Y</h1>
        <p className="muted">The choices you make in every design, side by side: what each is, when to pick it, code, and the mistakes people make.</p>
      </div>
      <div className="grid">
        {comparisons.map((c, i) => (
          <article key={c.slug} className="card" style={{ '--i': i }}>
            <Link to={`/compare/${c.slug}`} className="card-link" aria-label={c.title} />
            <div className="vs-chips">
              {c.options.map((o, j) => (
                <span key={o} className="vs-chip mono tiny">{j > 0 && <b>vs</b>}{o.split(' (')[0]}</span>
              ))}
            </div>
            <h3>{c.title}</h3>
            <p className="muted small">{c.tagline}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
