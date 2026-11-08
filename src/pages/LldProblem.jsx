import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lldProblems, lldBySlug } from '../data/lldProblems'
import { conceptByTerm } from '../data/allConcepts'
import { useStore } from '../hooks/useStore'
import ClassDiagram from '../components/ClassDiagram'
import CodeBlock from '../components/CodeBlock'
import Quiz from '../components/Quiz'
import { LABS } from '../components/labs'
import NotFound from './NotFound'

export default function LldProblem() {
  const { slug } = useParams()
  const p = lldBySlug(slug)
  const { track, setTrack, lldDone, toggleLldDone } = useStore()
  const [file, setFile] = useState(0)

  useEffect(() => { if (track !== 'lld') setTrack('lld') }, [track, setTrack])
  useEffect(() => { setFile(0) }, [slug])

  if (!p) return <NotFound />
  const i = lldProblems.indexOf(p)
  const prev = lldProblems[i - 1]
  const next = lldProblems[i + 1]
  const isDone = lldDone.includes(p.slug)
  const Lab = p.lab && LABS[p.lab]

  return (
    <div className="container compare-page">
      <article className="article">
        <div className="crumbs mono tiny">
          <Link to="/">lld</Link> / <span>problems</span> / <span className="accent">{String(p.n).padStart(2, '0')}</span>
        </div>
        <h1 className="article-title">{p.title}</h1>
        <p className="article-tagline serif">{p.tagline}</p>
        <div className="article-meta">
          <span className={`level level-${p.level.toLowerCase()}`}>{p.level}</span>
          <span className="mono small muted">TypeScript · {p.code.length} files</span>
        </div>

        <section className="callout">
          <span className="callout-label mono">TL;DR</span>
          <p>{p.summary}</p>
        </section>

        <section>
          <h2>1. Requirements</h2>
          <div className="req-grid">
            <div className="req"><h4 className="mono">functional</h4><ul>{p.requirements.functional.map((r) => <li key={r}>{r}</li>)}</ul></div>
            <div className="req"><h4 className="mono">non-functional</h4><ul>{p.requirements.nonFunctional.map((r) => <li key={r}>{r}</li>)}</ul></div>
          </div>
        </section>

        <section>
          <h2>2. Entities</h2>
          <p className="muted small">Nouns in the requirements become classes; verbs become methods.</p>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Class</th><th>Responsibility</th></tr></thead>
              <tbody>{p.entities.map(([n, d]) => <tr key={n}><td className="mono small"><strong>{n}</strong></td><td>{d}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>3. Class diagram</h2>
          <ClassDiagram spec={p.diagram} />
        </section>

        {Lab && (
          <section>
            <h2>Try it</h2>
            <Lab />
          </section>
        )}

        <section>
          <h2>4. Patterns &amp; principles used</h2>
          <div className="pattern-list">
            {p.patterns.map(([name, why]) => {
              const c = conceptByTerm(name)
              return (
                <div key={name} className="pattern">
                  {c ? <Link to={`/concepts/${c.slug}`} className="pattern-name">{name} →</Link> : <strong className="pattern-name">{name}</strong>}
                  <p className="small muted">{why}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2>5. How it works</h2>
          <ol className="steps">{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        </section>

        <section>
          <h2>6. Code</h2>
          <div className="file-tabs mono tiny" role="tablist">
            {p.code.map((f, k) => (
              <button key={f.file} role="tab" aria-selected={file === k} className={file === k ? 'on' : ''} onClick={() => setFile(k)}>{f.file}</button>
            ))}
          </div>
          <CodeBlock key={p.code[file].file} code={p.code[file].src} lang={p.code[file].file} />
        </section>

        <section>
          <h2>7. Edge cases</h2>
          <ul className="points">{p.edgeCases.map((e) => <li key={e}>{e}</li>)}</ul>
        </section>

        <section>
          <h2>Follow-up questions</h2>
          <ul className="tips">{p.followUps.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>

        <section>
          <h2>Quick quiz</h2>
          <Quiz key={p.slug} slug={`lld:${p.slug}`} questions={p.quiz} />
        </section>

        <div className="complete-row">
          <button className={`btn ${isDone ? 'btn-on' : 'btn-primary'}`} onClick={() => toggleLldDone(p.slug)}>
            {isDone ? '✓ Marked as complete' : 'Mark problem as complete'}
          </button>
        </div>

        <nav className="pager">
          {prev ? (
            <Link to={`/lld/${prev.slug}`} className="pager-link"><span className="mono tiny muted">← previous</span><strong>{prev.title}</strong></Link>
          ) : <Link to="/" className="pager-link"><span className="mono tiny muted">← all</span><strong>LLD home</strong></Link>}
          {next && (
            <Link to={`/lld/${next.slug}`} className="pager-link right"><span className="mono tiny muted">next →</span><strong>{next.title}</strong></Link>
          )}
        </nav>
      </article>
    </div>
  )
}
