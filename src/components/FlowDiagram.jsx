import { useState } from 'react'

// Animated architecture flow: a "request packet" travels from the first box to the last,
// lighting up each component as it passes. Loops forever; can be paused.
const STEP = 0.9 // seconds per hop

export default function FlowDiagram({ steps }) {
  const [paused, setPaused] = useState(false)
  const total = steps.length * STEP + 1.2
  return (
    <div className={`flow-wrap ${paused ? 'paused' : ''}`}>
      <div className="flow-bar mono tiny">
        <span><span className="live-dot" /> request path · animated</span>
        <button className="btn btn-sm btn-ghost" onClick={() => setPaused(!paused)}>
          {paused ? '▶ play' : '❚❚ pause'}
        </button>
      </div>
      <div className="flow" role="list" style={{ '--T': `${total}s`, '--S': `${STEP}s` }}>
        {steps.map((s, i) => (
          <div className="flow-step" role="listitem" key={s} style={{ '--i': i }}>
            <span className="flow-label">
              <span className="flow-idx mono">{String(i + 1).padStart(2, '0')}</span>
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className="flow-wire" aria-hidden>
                <i />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
