import { Link, useParams } from 'react-router-dom'
import { comparisons, bySlugCompare } from '../data/comparisons'
import { bySlug } from '../data'
import CodeBlock from '../components/CodeBlock'
import NotFound from './NotFound'

export default function CompareDetail() {
  const { slug } = useParams()
  const c = bySlugCompare(slug)
  if (!c) return <NotFound />
  const i = comparisons.indexOf(c)
  const next = comparisons[(i + 1) % comparisons.length]

  return (
    <div className="container compare-page">
      <article className="article">
        <div className="crumbs mono tiny">
          <Link to="/compare">compare</Link> / <span className="accent">{c.slug}</span>
        </div>
        <h1 className="article-title">{c.title}</h1>
        <p className="article-tagline serif">{c.tagline}</p>

        <section className="callout">
          <span className="callout-label mono">TL;DR</span>
          <p>{c.tldr}</p>
        </section>

        <section>
          <h2>Side by side</h2>
          <div className="table-wrap">
            <table className="table vs-table">
              <thead>
                <tr><th>Aspect</th>{c.options.map((o) => <th key={o}>{o}</th>)}</tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r[0]}><td><strong>{r[0]}</strong></td>{r.slice(1).map((v, j) => <td key={j}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>When to pick which</h2>
          <div className="pick-grid" style={{ '--n': c.pick.length }}>
            {c.pick.map((p) => (
              <div key={p.option} className="req pick">
                <h4 className="mono">pick {p.option} when…</h4>
                <ul>{p.when.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        {c.code && (
          <section>
            <h2>{c.code.title}</h2>
            <CodeBlock code={c.code.src} lang={c.code.lang} />
          </section>
        )}

        <section>
          <h2>Common mistakes</h2>
          <ul className="points">{c.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>

        {c.related?.length > 0 && (
          <section>
            <h2>See it in a real design</h2>
            <div className="related">
              {c.related.map(bySlug).filter(Boolean).map((ch) => (
                <Link key={ch.slug} to={`/learn/${ch.slug}`} className="pager-link">
                  <span className="mono tiny muted">chapter {String(ch.n).padStart(2, '0')}</span>
                  <strong>{ch.title}</strong>
                </Link>
              ))}
            </div>
          </section>
        )}

        <nav className="pager">
          <Link to="/compare" className="pager-link"><span className="mono tiny muted">← all comparisons</span><strong>X vs Y</strong></Link>
          <Link to={`/compare/${next.slug}`} className="pager-link right"><span className="mono tiny muted">next →</span><strong>{next.title}</strong></Link>
        </nav>
      </article>
    </div>
  )
}
