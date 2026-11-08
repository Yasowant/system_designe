import { Link } from 'react-router-dom'
import { chapters } from '../data'
import { useStore } from '../hooks/useStore'
import ChapterCard from '../components/ChapterCard'

export default function Saved() {
  const { saved, done, quiz, resetProgress } = useStore()
  const list = chapters.filter((c) => saved.includes(c.slug))
  const pct = Math.round((done.length / chapters.length) * 100)

  return (
    <div className="container section page">
      <div className="page-head">
        <p className="eyebrow mono"><span className="dot" /> your space</p>
        <h1>Saved &amp; <span className="serif">progress</span></h1>
        <p className="muted">Stored only in this browser — no account needed.</p>
      </div>

      <div className="progress-card">
        <div>
          <span className="mono big">{pct}%</span>
          <p className="muted small">{done.length} of {chapters.length} chapters completed · {Object.keys(quiz).length} quizzes taken</p>
        </div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        {done.length > 0 && <button className="link-btn" onClick={resetProgress}>reset progress</button>}
      </div>

      <h2 className="sub-h">Bookmarks</h2>
      {list.length ? (
        <div className="grid">{list.map((c, i) => <ChapterCard key={c.slug} c={c} style={{ '--i': i }} />)}</div>
      ) : (
        <p className="muted">No bookmarks yet. Tap the bookmark icon on any chapter card. <Link to="/" className="accent">Browse topics →</Link></p>
      )}
    </div>
  )
}
