import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { readTime } from '../data'

export default function ChapterCard({ c, style }) {
  const { done, saved, toggleSaved } = useStore()
  const isDone = done.includes(c.slug)
  const isSaved = saved.includes(c.slug)

  return (
    <article className={`card ${isDone ? 'is-done' : ''}`} style={style}>
      <Link to={`/learn/${c.slug}`} className="card-link" aria-label={c.title} />
      <div className="card-top">
        <span className="card-num">{String(c.n).padStart(2, '0')}</span>
        <button
          className={`save-btn ${isSaved ? 'on' : ''}`}
          onClick={() => toggleSaved(c.slug)}
          aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
        </button>
      </div>
      <h3>{c.title.replace(/^Design (a |an )?/, '')}</h3>
      <p className="muted small">{c.tagline}</p>
      <div className="card-meta">
        <span className={`level level-${c.level.toLowerCase()}`}>{c.level}</span>
        <span className="mono tiny muted">{readTime(c)} min</span>
        {(c.deep || c.sections.some((x) => x.lab)) && <span className="deep-badge mono tiny">✦ interactive</span>}
        {isDone && <span className="done-badge">✓ done</span>}
      </div>
    </article>
  )
}
