import { useState } from 'react'
import { useStore } from '../hooks/useStore'

export default function Quiz({ slug, questions }) {
  const { setQuizScore, quiz } = useStore()
  const [answers, setAnswers] = useState({})
  const answered = Object.keys(answers).length
  const correct = questions.filter((q, i) => answers[i] === q.a).length

  const pick = (qi, oi) => {
    if (answers[qi] !== undefined) return
    const next = { ...answers, [qi]: oi }
    setAnswers(next)
    if (Object.keys(next).length === questions.length) {
      const score = questions.filter((q, i) => next[i] === q.a).length
      setQuizScore(slug, `${score}/${questions.length}`)
    }
  }

  return (
    <div className="quiz">
      {questions.map((q, qi) => (
        <div className="quiz-q" key={qi}>
          <p className="quiz-title"><span className="mono accent">Q{qi + 1}.</span> {q.q}</p>
          <div className="quiz-opts">
            {q.options.map((o, oi) => {
              const chosen = answers[qi] === oi
              const show = answers[qi] !== undefined
              const cls = show ? (oi === q.a ? 'right' : chosen ? 'wrong' : 'dim') : ''
              return (
                <button key={oi} className={`quiz-opt ${cls}`} onClick={() => pick(qi, oi)}>
                  <span className="mono">{String.fromCharCode(65 + oi)}</span> {o}
                </button>
              )
            })}
          </div>
          {answers[qi] !== undefined && <p className="quiz-why small">{answers[qi] === q.a ? '✓ Correct. ' : '✗ Not quite. '}{q.why}</p>}
        </div>
      ))}
      <div className="quiz-foot mono small">
        {answered === questions.length ? (
          <>
            Score: <strong className="accent">{correct}/{questions.length}</strong>
            <button className="link-btn" onClick={() => setAnswers({})}>retry</button>
          </>
        ) : (
          <>Answered {answered}/{questions.length}{quiz[slug] && <span className="muted"> · last score {quiz[slug]}</span>}</>
        )}
      </div>
    </div>
  )
}
