import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { allConcepts, conceptBySlug, conceptByTerm } from '../data/allConcepts'
import { bySlug } from '../data'
import { lldBySlug } from '../data/lldProblems'
import { comparisons } from '../data/comparisons'
import { useStore } from '../hooks/useStore'
import CodeBlock from '../components/CodeBlock'
import NotFound from './NotFound'

export default function ConceptDetail() {
  const { slug } = useParams()
  const c = conceptBySlug(slug)
  const { track, setTrack } = useStore()

  // opening an LLD concept switches the site to the LLD track (and vice versa)
  useEffect(() => { if (c && c.track !== track) setTrack(c.track) }, [c, track, setTrack])

  if (!c) return <NotFound />

  const sameTrack = allConcepts.filter((x) => x.track === c.track)
  const i = sameTrack.indexOf(c)
  const prev = sameTrack[i - 1]
  const next = sameTrack[i + 1]
  const related = sameTrack.filter((x) => x.group === c.group && x !== c).slice(0, 6)
  const chapters = (c.chapters ?? []).map(bySlug).filter(Boolean)
  const problems = [...(c.problems ?? []), ...(c.lld ? [c.lld] : [])].map(lldBySlug).filter(Boolean)
  const compare = c.compare && comparisons.find((x) => x.slug === c.compare)
  const usedIn = chapters.length + problems.length + (compare ? 1 : 0)

  return (
    <div className="container compare-page">
      <article className="article">
        <div className="crumbs mono tiny">
          <Link to="/concepts">concepts</Link> / <span>{c.track}</span> / <span>{c.group.toLowerCase()}</span>
        </div>
        <h1 className="article-title">{c.term}</h1>
        <div className="article-meta">
          <span className={`level ${c.track === 'lld' ? 'level-intermediate' : 'level-beginner'}`}>{c.track.toUpperCase()}</span>
          <span className="mono small muted">{c.group}</span>
        </div>

        <section className="callout">
          <span className="callout-label mono">in one line</span>
          <p>{c.def}</p>
        </section>

        {c.analogy && (
          <section className="callout analogy">
            <span className="callout-label mono">think of it like</span>
            <p>{c.analogy}</p>
          </section>
        )}

        {(c.more || c.points) && (
          <section>
            <h2>How it works</h2>
            {c.more && <p>{c.more}</p>}
            {c.points && <ul className="points">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>}
          </section>
        )}

        <section>
          <h2>Example</h2>
          <p className="example mono small">{c.example}</p>
          {c.code && <CodeBlock code={c.code} lang={c.track === 'lld' ? 'typescript' : undefined} />}
        </section>

        {c.mistake && (
          <section className="callout mistake">
            <span className="callout-label mono">common mistake</span>
            <p>{c.mistake}</p>
          </section>
        )}

        {usedIn > 0 && (
          <section>
            <h2>See it in action</h2>
            <div className="related">
              {compare && (
                <Link to={`/compare/${compare.slug}`} className="pager-link"><span className="mono tiny muted">comparison</span><strong>{compare.title}</strong></Link>
              )}
              {chapters.map((ch) => (
                <Link key={ch.slug} to={`/learn/${ch.slug}`} className="pager-link"><span className="mono tiny muted">HLD chapter {String(ch.n).padStart(2, '0')}</span><strong>{ch.title}</strong></Link>
              ))}
              {problems.map((p) => (
                <Link key={p.slug} to={`/lld/${p.slug}`} className="pager-link"><span className="mono tiny muted">LLD problem {String(p.n).padStart(2, '0')}</span><strong>{p.title}</strong></Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2>Related concepts</h2>
            <div className="chips">
              {related.map((r) => <Link key={r.slug} to={`/concepts/${r.slug}`} className="chip chip-sm">{r.term}</Link>)}
            </div>
          </section>
        )}

        <nav className="pager">
          {prev ? (
            <Link to={`/concepts/${prev.slug}`} className="pager-link"><span className="mono tiny muted">← previous</span><strong>{prev.term}</strong></Link>
          ) : <span />}
          {next && (
            <Link to={`/concepts/${next.slug}`} className="pager-link right"><span className="mono tiny muted">next →</span><strong>{next.term}</strong></Link>
          )}
        </nav>
      </article>
    </div>
  )
}

export { conceptByTerm }
