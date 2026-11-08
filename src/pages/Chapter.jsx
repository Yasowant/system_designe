import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapters, bySlug, readTime } from '../data'
import { useStore } from '../hooks/useStore'
import FlowDiagram from '../components/FlowDiagram'
import Quiz from '../components/Quiz'
import { DIAGRAMS } from '../components/Diagrams'
import Diagram from '../components/Diagram'
import CodeBlock from '../components/CodeBlock'
import DesignCanvas, { referenceTypes } from '../components/DesignCanvas'
import { LABS } from '../components/labs'
import NotFound from './NotFound'

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function Chapter() {
  const { slug } = useParams()
  const c = bySlug(slug)
  const { done, toggleDone, saved, toggleSaved } = useStore()
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')
  const [sideOpen, setSideOpen] = useState(false)
  const [canvasOpen, setCanvasOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 || 0)
      const heads = [...document.querySelectorAll('.article [data-toc]')]
      let cur = heads[0]?.id
      for (const el of heads) if (el.getBoundingClientRect().top < 140) cur = el.id
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [slug])

  useEffect(() => { setSideOpen(false); setCanvasOpen(false) }, [slug])

  if (!c) return <NotFound />

  const i = chapters.indexOf(c)
  const prev = chapters[i - 1]
  const next = chapters[i + 1]
  const isDone = done.includes(c.slug)
  const isSaved = saved.includes(c.slug)

  const canDesign = referenceTypes(c.flow).length >= 3
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Requirements' },
    ...(canDesign ? [{ id: 'design-yourself', label: '✦ Design it yourself' }] : []),
    { id: 'architecture', label: 'Architecture flow' },
    ...c.sections.map((s) => ({ id: slugify(s.h), label: s.h })),
    { id: 'tradeoffs', label: 'Trade-offs' },
    { id: 'tips', label: 'Interview tips' },
    { id: 'quiz', label: 'Quick quiz' },
  ]

  return (
    <>
      <div className="read-progress" style={{ width: `${progress}%` }} />
      <div className="container chapter-layout">
        <aside className={`sidebar ${sideOpen ? 'open' : ''}`}>
          <button className="sidebar-toggle mono small" onClick={() => setSideOpen(!sideOpen)}>
            {sideOpen ? '× close' : '☰ all chapters'}
          </button>
          <ol className="side-list">
            {chapters.map((x) => (
              <li key={x.slug}>
                <Link to={`/learn/${x.slug}`} className={x.slug === c.slug ? 'current' : ''}>
                  <span className="mono tiny">{done.includes(x.slug) ? '✓' : String(x.n).padStart(2, '0')}</span>
                  {x.title.replace(/^Design (a |an )?/, '')}
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        <article className="article">
          <div className="crumbs mono tiny">
            <Link to="/">topics</Link> / <span>{c.category.toLowerCase()}</span> / <span className="accent">{String(c.n).padStart(2, '0')}</span>
          </div>
          <h1 className="article-title">{c.title}</h1>
          <p className="article-tagline serif">{c.tagline}</p>
          <div className="article-meta">
            <span className={`level level-${c.level.toLowerCase()}`}>{c.level}</span>
            <span className="mono small muted">{readTime(c)} min read</span>
            <button className={`btn btn-sm ${isSaved ? 'btn-on' : 'btn-ghost'}`} onClick={() => toggleSaved(c.slug)}>
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
          </div>

          <section id="overview" data-toc className="callout">
            <span className="callout-label mono">TL;DR</span>
            <p>{c.summary}</p>
          </section>

          <section id="requirements" data-toc>
            <h2>Requirements</h2>
            <div className="req-grid">
              <div className="req">
                <h4 className="mono">functional</h4>
                <ul>{c.requirements.functional.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div className="req">
                <h4 className="mono">non-functional</h4>
                <ul>{c.requirements.nonFunctional.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </div>
          </section>

          {canDesign && (
            <section id="design-yourself" data-toc>
              <h2>Design it yourself</h2>
              {!canvasOpen ? (
                <div className="callout try-callout">
                  <span className="callout-label mono">practice first</span>
                  <p>Before reading the solution, sketch your own architecture: drag in the building blocks, connect them, and see how close you get to the reference. Your design is saved in this browser.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setCanvasOpen(true)}>✦ Open the canvas</button>
                </div>
              ) : (
                <DesignCanvas chapter={c} />
              )}
            </section>
          )}

          <section id="architecture" data-toc>
            <h2>Architecture flow</h2>
            <FlowDiagram steps={c.flow} />
          </section>

          {c.sections.map((s) => (
            <section key={s.h} id={slugify(s.h)} data-toc>
              <h2>{s.h}</h2>
              {s.p && <p>{s.p}</p>}
              {s.analogy && (
                <div className="callout analogy">
                  <span className="callout-label mono">think of it like</span>
                  <p>{s.analogy}</p>
                </div>
              )}
              {s.steps && <ol className="steps">{s.steps.map((x) => <li key={x}>{x}</li>)}</ol>}
              {s.points.length > 0 && (
                <ul className="points">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
              )}
              {typeof s.diagram === 'string' && DIAGRAMS[s.diagram] && (() => { const D = DIAGRAMS[s.diagram]; return <D /> })()}
              {s.diagram && typeof s.diagram === 'object' && <Diagram spec={s.diagram} />}
              {s.table && (
                <>
                  {s.table.caption && <p className="muted small table-cap">{s.table.caption}</p>}
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr>{s.table.cols.map((x) => <th key={x}>{x}</th>)}</tr></thead>
                      <tbody>{s.table.rows.map((r, ri) => <tr key={ri}>{r.map((x, ci) => <td key={ci}>{x}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </>
              )}
              {s.code && <CodeBlock code={s.code} />}
              {s.lab && LABS[s.lab] && (() => { const L = LABS[s.lab]; return <L /> })()}
            </section>
          ))}

          <section id="tradeoffs" data-toc>
            <h2>Trade-offs</h2>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Decision</th><th>👍 Upside</th><th>👎 Downside</th></tr></thead>
                <tbody>
                  {c.tradeoffs.map((t) => (
                    <tr key={t.choice}><td><strong>{t.choice}</strong></td><td>{t.pro}</td><td>{t.con}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="tips" data-toc>
            <h2>Interview tips</h2>
            <ul className="tips">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>

          <section id="quiz" data-toc>
            <h2>Quick quiz</h2>
            <Quiz key={c.slug} slug={c.slug} questions={c.quiz} />
          </section>

          <div className="complete-row">
            <button className={`btn ${isDone ? 'btn-on' : 'btn-primary'}`} onClick={() => toggleDone(c.slug)}>
              {isDone ? '✓ Marked as complete' : 'Mark chapter as complete'}
            </button>
          </div>

          <nav className="pager">
            {prev ? (
              <Link to={`/learn/${prev.slug}`} className="pager-link">
                <span className="mono tiny muted">← previous</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : <span />}
            {next && (
              <Link to={`/learn/${next.slug}`} className="pager-link right">
                <span className="mono tiny muted">next →</span>
                <strong>{next.title}</strong>
              </Link>
            )}
          </nav>
        </article>

        <aside className="toc">
          <p className="mono tiny muted">on this page</p>
          <ul>
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? 'active' : ''}>{t.label}</a></li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  )
}
