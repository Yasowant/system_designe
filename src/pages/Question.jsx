import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { questions, questionBySlug, levelClass } from '../data/questions'
import { bySlug } from '../data'
import { useStore } from '../hooks/useStore'
import FlowDiagram from '../components/FlowDiagram'
import NotFound from './NotFound'
import { questionResources, describeResource } from '../data/questionResources'

const STATUS = [['todo', 'To do'], ['attempted', 'Attempted'], ['solved', 'Solved']]

export default function Question() {
  const { slug } = useParams()
  const q = questionBySlug(slug)
  const { qStatus, setQuestionStatus, qChecks, toggleQuestionCheck, qNotes, setQuestionNote, qSaved, toggleQuestionSaved, track, setTrack } = useStore()
  const [practice, setPractice] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => { if (track !== 'hld') setTrack('hld') }, [track, setTrack])
  useEffect(() => { setRevealed(false); setNavOpen(false) }, [slug])

  if (!q) return <NotFound />
  const i = questions.indexOf(q)
  const prev = questions[i - 1]
  const next = questions[i + 1]
  const st = qStatus[q.slug] || 'todo'
  const checks = qChecks[q.slug] || []
  const chapter = q.chapter && bySlug(q.chapter)
  const isSaved = qSaved.includes(q.slug)
  const hidden = practice && !revealed
  // Questions that share the most categories with this one.
  const related = questions
    .filter((x) => x.slug !== q.slug)
    .map((x) => ({ x, score: x.cats.filter((c) => q.cats.includes(c)).length + (x.chapter && x.chapter === q.chapter ? 2 : 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.x.n - b.x.n)
    .slice(0, 4)
    .map((r) => r.x)

  return (
    <div className="container chapter-layout q-detail">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <button className="sidebar-toggle mono small" onClick={() => setNavOpen(!navOpen)}>☰ all {questions.length} questions</button>
        <p className="mono tiny muted">
          <Link to="/questions" className="accent">← back to main table</Link>
        </p>
        <ul className="side-list">
          {questions.map((x) => (
            <li key={x.slug}>
              <Link to={`/questions/${x.slug}`} className={x.slug === q.slug ? 'current' : ''}>
                <span className="mono">{x.n}</span>
                <span className="q-side-title">
                  {x.title}
                  <span className={`q-lvl q-lvl-xs ${levelClass(x.level)}`}>{x.level}</span>
                  {qStatus[x.slug] === 'solved' && <span className="accent"> ✓</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <article className="article">
        <div className="crumbs mono tiny">
          <Link to="/questions">questions</Link> / <span className="accent">#{q.n}</span>
        </div>
        <h1 className="article-title q-h1">{q.title}</h1>
        <div className="article-meta">
          <span className={`q-lvl ${levelClass(q.level)}`}>{q.level}</span>
          {q.cats.map((c) => <Link key={c} to={`/questions?cat=${encodeURIComponent(c)}`} className="tag">{c}</Link>)}
          <button className={`save-btn ${isSaved ? 'on' : ''}`} onClick={() => toggleQuestionSaved(q.slug)} aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'} style={{ marginLeft: 'auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
          </button>
        </div>

        <div className="q-companies q-companies-lg">
          <span className="mono tiny muted">asked at</span>
          {q.companies.map((c) => <Link key={c} to={`/questions?co=${encodeURIComponent(c)}`} className="q-co">{c}</Link>)}
          {q.more ? <span className="mono tiny muted">+{q.more} more</span> : null}
        </div>

        <section className="callout">
          <span className="callout-label mono">THE QUESTION</span>
          <p>{q.prompt}</p>
        </section>

        <section className="q-practice">
          <div className="q-status-row">
            <span className="mono tiny muted">my status</span>
            <div className="seg">
              {STATUS.map(([k, label]) => (
                <button key={k} className={st === k ? 'on' : ''} onClick={() => setQuestionStatus(q.slug, k === 'todo' ? null : k)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="q-status-row">
            <label className="q-check">
              <input type="checkbox" checked={practice} onChange={(e) => { setPractice(e.target.checked); setRevealed(false) }} />
              <span>Practice mode: hide the solution until I reveal it</span>
            </label>
          </div>
          <Timer key={q.slug} onStart={() => st === 'todo' && setQuestionStatus(q.slug, 'attempted')} />
        </section>

        <section>
          <h2>1. Details you should know</h2>
          <p className="muted small">The points an interviewer expects you to address. Tick each one as you cover it out loud; ticks are saved in this browser.</p>
          <ul className="q-checklist">
            {q.discuss.map((d, idx) => (
              <li key={d}>
                <label className={`q-check ${checks.includes(idx) ? 'on' : ''}`}>
                  <input type="checkbox" checked={checks.includes(idx)} onChange={() => toggleQuestionCheck(q.slug, idx)} />
                  <span>{d}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mono tiny muted">{checks.length}/{q.discuss.length} covered</p>
        </section>

        {hidden ? (
          <section className="q-reveal">
            <p className="muted">Try your own design first: requirements → estimates → API → data model → high-level design → deep dives.</p>
            <button className="btn btn-primary" onClick={() => setRevealed(true)}>Reveal solution outline</button>
          </section>
        ) : (
          <>
            <section>
              <h2>2. Request path</h2>
              <FlowDiagram steps={q.flow} />
            </section>

            <section>
              <h2>3. Solution outline</h2>
              <ol className="steps">{q.approach.map((a) => <li key={a}>{a}</li>)}</ol>
            </section>

            <section>
              <h2>4. Trade-offs to mention</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Decision</th><th>What to say</th></tr></thead>
                  <tbody>{q.tradeoffs.map(([d, w]) => <tr key={d}><td><strong>{d}</strong></td><td>{w}</td></tr>)}</tbody>
                </table>
              </div>
            </section>

            {chapter && (
              <section className="callout q-deep">
                <span className="callout-label mono">DEEP DIVE</span>
                <p>
                  The full walkthrough with animated diagrams, estimates and a quiz is in chapter{' '}
                  <Link to={`/learn/${chapter.slug}`} className="accent">{String(chapter.n).padStart(2, '0')} · {chapter.title} →</Link>
                </p>
              </section>
            )}
          </>
        )}

        <section>
          <h2>{hidden ? '2' : '5'}. Recommended resources</h2>
          <ul className="q-res">
            {chapter && (
              <li>
                <Link to={`/learn/${chapter.slug}`} className="q-res-link">
                  <span className="tag">ScaleNotes</span>
                  <span><strong>Chapter {String(chapter.n).padStart(2, '0')}: {chapter.title}</strong><span className="muted small">Full walkthrough with diagrams and a quiz</span></span>
                </Link>
              </li>
            )}
            {(questionResources[q.slug] || []).map(describeResource).map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="q-res-link">
                  <span className="tag tag-alt">{r.kind}</span>
                  <span><strong>{r.label} ↗</strong><span className="muted small">{r.source}</span></span>
                </a>
              </li>
            ))}
          </ul>
          <div className="q-more">
            <span className="mono tiny muted">search for more</span>
            {resources(q).map((r) => (
              <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="q-co">{r.label} ↗</a>
            ))}
          </div>
          {related.length > 0 && (
            <>
              <h3 className="q-related-h">Related questions</h3>
              <div className="q-related">
                {related.map((x) => (
                  <Link key={x.slug} to={`/questions/${x.slug}`} className="q-related-card">
                    <span className="mono tiny muted">#{x.n}</span>
                    <strong>{x.title}</strong>
                    <span className={`q-lvl q-lvl-xs ${levelClass(x.level)}`}>{x.level}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <section>
          <h2>{hidden ? '3' : '6'}. My notes</h2>
          <textarea
            className="field q-notes"
            value={qNotes[q.slug] || ''}
            onChange={(e) => setQuestionNote(q.slug, e.target.value)}
            placeholder="Write your own design here: requirements, numbers, APIs, components… Saved automatically in this browser."
            rows={8}
          />
        </section>

        <nav className="pager">
          {prev ? (
            <Link to={`/questions/${prev.slug}`} className="pager-link"><span className="mono tiny muted">← #{prev.n}</span><strong>{prev.title}</strong></Link>
          ) : <Link to="/questions" className="pager-link"><span className="mono tiny muted">← all</span><strong>Question table</strong></Link>}
          {next ? (
            <Link to={`/questions/${next.slug}`} className="pager-link right"><span className="mono tiny muted">#{next.n} →</span><strong>{next.title}</strong></Link>
          ) : <Link to="/questions" className="pager-link right"><span className="mono tiny muted">all →</span><strong>Question table</strong></Link>}
        </nav>
      </article>
    </div>
  )
}

// Mock-interview countdown (default 45 min).
function Timer({ onStart }) {
  const [mins, setMins] = useState(45)
  const [left, setLeft] = useState(45 * 60)
  const [running, setRunning] = useState(false)
  const tick = useRef(null)

  useEffect(() => {
    if (!running) return
    tick.current = setInterval(() => setLeft((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000)
    return () => clearInterval(tick.current)
  }, [running])

  const reset = (m = mins) => { setRunning(false); setMins(m); setLeft(m * 60) }
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className={`q-timer ${left === 0 ? 'over' : ''}`}>
      <span className="mono q-clock">{mm}:{ss}</span>
      <div className="q-timer-btns">
        <button className="btn btn-sm btn-primary" onClick={() => { if (!running) onStart(); setRunning(!running) }} disabled={left === 0}>
          {running ? '❚❚ Pause' : left < mins * 60 ? '▶ Resume' : '▶ Start mock interview'}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => reset()}>Reset</button>
        <select className="q-select" value={mins} onChange={(e) => reset(Number(e.target.value))} aria-label="Duration">
          {[20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
        </select>
      </div>
      {left === 0 && <span className="mono small q-over">time’s up — wrap up and summarise</span>}
    </div>
  )
}

// Outside material: search links, so they never go stale or point at a dead page.
function resources(q) {
  const topic = q.title.replace(/^(Design|Develop|Create|Build)( and Implement)?( an?| the)? /i, '').replace(/:.*$/, '')
  const enc = (t) => encodeURIComponent(t)
  return [
    { kind: 'video', label: 'Video walkthroughs', sub: `YouTube: “${topic} system design”`, url: `https://www.youtube.com/results?search_query=${enc(topic + ' system design interview')}` },
    { kind: 'blog', label: 'Written solutions', sub: 'Engineering blogs and articles', url: `https://www.google.com/search?q=${enc(topic + ' system design')}` },
    { kind: 'eng blog', label: 'How real companies built it', sub: 'Engineering blog posts from companies that run it', url: `https://www.google.com/search?q=${enc(topic + ' architecture engineering blog')}` },
    { kind: 'mock', label: 'Practise out loud', sub: 'Mock interview recordings for this question', url: `https://www.youtube.com/results?search_query=${enc(topic + ' mock system design interview')}` },
  ]
}
