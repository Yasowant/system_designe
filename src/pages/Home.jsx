import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { chapters, categories } from '../data'
import { concepts } from '../data/concepts'
import { useStore } from '../hooks/useStore'
import ChapterCard from '../components/ChapterCard'
import { BRAND } from '../brand'
import LldHome from './LldHome'
import { questions } from '../data/questions'

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function Home() {
  const { track } = useStore()
  if (track === 'lld') return <LldHome />
  return <HldHome />
}

function HldHome() {
  const [cat, setCat] = useState('All')
  const [level, setLevel] = useState('All')
  const { done } = useStore()

  const next = chapters.find((c) => !done.includes(c.slug)) || chapters[0]

  const filtered = useMemo(
    () => chapters.filter((c) => (cat === 'All' || c.category === cat) && (level === 'All' || c.level === level)),
    [cat, level]
  )

  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden />
        <div className="container hero-inner">
          <p className="eyebrow mono">
            <span className="dot" /> {BRAND.name}{BRAND.tld} / learn / system-design
          </p>
          <h1>
            System design,
            <br />
            <span className="serif">explained</span> like a senior dev
            <span className="accent"> would.</span>
          </h1>
          <p className="hero-sub">
            28 real-world systems — from a URL shortener to a stock exchange — plus {concepts.length} core concepts,
            a bank of {questions.length} real interview questions, a numbers cheat sheet and quick quizzes. Read it on the metro, revise it before the interview.
          </p>
          <div className="hero-cta">
            <Link to={`/learn/${next.slug}`} className="btn btn-primary">
              {done.length ? 'Continue' : 'Start learning'} → <span className="mono small">{String(next.n).padStart(2, '0')}</span>
            </Link>
            <Link to="/questions" className="btn btn-ghost">{questions.length} interview questions</Link>
            <Link to="/cheatsheet" className="btn btn-ghost">Numbers cheat sheet</Link>
          </div>
          <dl className="stats">
            <div><dt className="mono">28</dt><dd>case studies</dd></div>
            <div><dt className="mono">{concepts.length}</dt><dd>core concepts</dd></div>
            <div><dt className="mono">{chapters.reduce((a, c) => a + c.quiz.length, 0)}</dt><dd>quiz questions</dd></div>
            <div><dt className="mono">{done.length}/28</dt><dd>you’ve finished</dd></div>
          </dl>
          <div className="term" aria-hidden>
            <div className="term-bar"><i /><i /><i /><span className="mono tiny">design.sh</span></div>
            <pre className="mono">
<span className="muted">$</span> design <span className="accent">--system</span> url-shortener{'\n'}
<span className="muted">›</span> clarify   <span className="ok">✓</span> 100M urls/day{'\n'}
<span className="muted">›</span> estimate  <span className="ok">✓</span> ~1,160 write QPS{'\n'}
<span className="muted">›</span> code len  <span className="ok">✓</span> 62^7 ≈ 3.5T{'\n'}
<span className="muted">›</span> cache     <span className="ok">✓</span> redis, hot 20%{'\n'}
<span className="muted">›</span> redirect  <span className="warn">?</span> 301 or 302{'\n'}
{'\n'}<span className="accent">ready for the deep dive_</span>
            </pre>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Pick a <span className="serif">track</span></h2>
          <p className="muted">Grouped from fundamentals to the hardest money-moving systems.</p>
        </div>
        <div className="tracks">
          {categories.map((c) => {
            const items = chapters.filter((x) => x.category === c.name)
            const d = items.filter((x) => done.includes(x.slug)).length
            return (
              <button key={c.name} className={`track ${cat === c.name ? 'active' : ''}`} onClick={() => setCat(cat === c.name ? 'All' : c.name)}>
                <span className="track-icon">{c.icon}</span>
                <strong>{c.name}</strong>
                <span className="muted small">{c.blurb}</span>
                <span className="track-bar"><span style={{ width: `${(d / items.length) * 100}%` }} /></span>
                <span className="mono tiny muted">{d}/{items.length} done</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="container section" id="topics">
        <div className="filters">
          <div className="chips">
            {['All', ...categories.map((c) => c.name)].map((c) => (
              <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="chips">
            {levels.map((l) => (
              <button key={l} className={`chip chip-sm ${level === l ? 'on' : ''}`} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid">
          {filtered.map((c, i) => <ChapterCard key={c.slug} c={c} style={{ '--i': i }} />)}
          {filtered.length === 0 && <p className="muted">No chapters match these filters.</p>}
        </div>
      </section>
    </>
  )
}
