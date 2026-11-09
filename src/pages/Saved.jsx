import { Link } from 'react-router-dom'
import { chapters } from '../data'
import { useStore } from '../hooks/useStore'
import ChapterCard from '../components/ChapterCard'
import { questions, levelClass } from '../data/questions'
import { StatusDot } from './Questions'

export default function Saved() {
  const { saved, done, quiz, resetProgress, qSaved, qStatus, resetQuestions } = useStore()
  const qList = questions.filter((q) => qSaved.includes(q.slug))
  const qSolved = questions.filter((q) => qStatus[q.slug] === 'solved').length
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

      <h2 className="sub-h" style={{ marginTop: 48 }}>Interview questions</h2>
      <div className="progress-card">
        <div>
          <span className="mono big">{qSolved}/{questions.length}</span>
          <p className="muted small">questions solved · {Object.values(qStatus).filter((s) => s === 'attempted').length} attempted</p>
        </div>
        <div className="bar"><span style={{ width: `${(qSolved / questions.length) * 100}%` }} /></div>
        {Object.keys(qStatus).length > 0 && <button className="link-btn" onClick={resetQuestions}>reset</button>}
      </div>
      {qList.length ? (
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {qList.map((q) => (
                <tr key={q.slug}>
                  <td className="mono small muted">{q.n}</td>
                  <td><Link to={`/questions/${q.slug}`} className="q-title">{q.title}</Link></td>
                  <td><span className={`q-lvl ${levelClass(q.level)}`}>{q.level}</span></td>
                  <td><StatusDot st={qStatus[q.slug] || 'todo'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">No bookmarked questions yet. <Link to="/questions" className="accent">Browse the question bank →</Link></p>
      )}
    </div>
  )
}
