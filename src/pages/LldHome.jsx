import { Link } from 'react-router-dom'
import { lldProblems, upcomingLld } from '../data/lldProblems'
import { allConcepts, lldGroups } from '../data/allConcepts'
import { useStore } from '../hooks/useStore'

export default function LldHome() {
  const { lldDone } = useStore()
  const concepts = allConcepts.filter((c) => c.track === 'lld')
  const next = lldProblems.find((p) => !lldDone.includes(p.slug)) ?? lldProblems[0]
  const approach = concepts.find((c) => c.term.startsWith('How to Approach'))

  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden />
        <div className="container hero-inner">
          <p className="eyebrow mono"><span className="dot" /> learn / low-level-design</p>
          <h1>
            Low-level design,
            <br />
            <span className="serif">explained</span> in real
            <span className="accent"> TypeScript.</span>
          </h1>
          <p className="hero-sub">
            The machine-coding and LLD round: OOP, SOLID and design patterns with real-life comparisons, then classic problems
            with UML class diagrams and working code.
          </p>
          <div className="hero-cta">
            <Link to={`/lld/${next.slug}`} className="btn btn-primary">{lldDone.length ? 'Continue' : 'Start with'} → {next.title.replace(/^Design (a |an )?/, '')}</Link>
            {approach && <Link to={`/concepts/${approach.slug}`} className="btn btn-ghost">How to approach LLD</Link>}
          </div>
          <dl className="stats">
            <div><dt className="mono">{lldProblems.length}</dt><dd>LLD problems</dd></div>
            <div><dt className="mono">{concepts.length}</dt><dd>LLD concepts</dd></div>
            <div><dt className="mono">{concepts.filter((c) => c.group.includes('Patterns')).length}</dt><dd>design patterns</dd></div>
            <div><dt className="mono">{lldDone.length}/{lldProblems.length}</dt><dd>you’ve finished</dd></div>
          </dl>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>LLD <span className="serif">problems</span></h2>
          <p className="muted">Requirements → entities → class diagram → patterns → code → edge cases.</p>
        </div>
        <div className="grid">
          {lldProblems.map((p, i) => (
            <article key={p.slug} className={`card ${lldDone.includes(p.slug) ? 'is-done' : ''}`} style={{ '--i': i }}>
              <Link to={`/lld/${p.slug}`} className="card-link" aria-label={p.title} />
              <div className="card-top"><span className="card-num">{String(p.n).padStart(2, '0')}</span></div>
              <h3>{p.title.replace(/^Design (a |an )?/, '')}</h3>
              <p className="muted small">{p.tagline}</p>
              <div className="card-meta">
                <span className={`level level-${p.level.toLowerCase()}`}>{p.level}</span>
                <span className="deep-badge mono tiny">✦ class diagram + code</span>
                {lldDone.includes(p.slug) && <span className="done-badge">✓ done</span>}
              </div>
            </article>
          ))}
          {upcomingLld.map((t) => (
            <article key={t} className="card card-soon">
              <h3>{t}</h3>
              <p className="muted small mono tiny">coming soon</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>LLD <span className="serif">concepts</span></h2>
          <p className="muted">Learn these first. Every problem above uses them.</p>
        </div>
        <div className="lld-groups">
          {lldGroups.map((g) => (
            <div key={g} className="lld-group">
              <h4 className="mono">{g}</h4>
              <ul>
                {concepts.filter((c) => c.group === g).map((c) => (
                  <li key={c.slug}><Link to={`/concepts/${c.slug}`}>{c.term}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
