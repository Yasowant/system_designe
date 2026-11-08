import { useEffect, useReducer, useRef, useState } from 'react'
import { algos, RULE } from '../../data/rateLimiterAlgos'
import { EdgeBurstDiagram } from '../Diagrams'
import CodeBlock from '../CodeBlock'

const { limit: LIMIT, window: WIN, refillEvery: EVERY } = RULE

// ---------- simulation engines (same logic as the code samples) ----------
function makeEngine(id, t0) {
  switch (id) {
    case 'token':
      return {
        tokens: LIMIT, last: t0,
        update(t) { this.tokens = Math.min(LIMIT, this.tokens + (t - this.last) / EVERY); this.last = t },
        hit(t) { this.update(t); if (this.tokens >= 1) { this.tokens -= 1; return 'ok' } return 'deny' },
      }
    case 'leaky':
      return {
        queue: [], nextLeak: null, processed: 0, seq: 0,
        update(t) {
          while (this.queue.length && t >= this.nextLeak) {
            this.queue.shift(); this.processed++
            this.nextLeak = this.queue.length ? this.nextLeak + EVERY : null
          }
        },
        hit(t) {
          this.update(t)
          if (this.queue.length >= LIMIT) return 'deny'
          this.queue.push(++this.seq)
          if (this.nextLeak == null) this.nextLeak = t + EVERY
          return 'queued'
        },
      }
    case 'fixed':
      return {
        win: 0, count: 0,
        update(t) { const w = Math.floor(t / WIN); if (w !== this.win) { this.win = w; this.count = 0 } },
        hit(t) { this.update(t); if (this.count < LIMIT) { this.count++; return 'ok' } return 'deny' },
      }
    case 'log':
      return {
        log: [],
        update(t) { this.log = this.log.filter((x) => x > t - WIN) },
        hit(t) { this.update(t); if (this.log.length < LIMIT) { this.log.push(t); return 'ok' } return 'deny' },
      }
    case 'counter':
    default:
      return {
        win: 0, cur: 0, prev: 0, est: 0,
        update(t) {
          const w = Math.floor(t / WIN)
          if (w !== this.win) { this.prev = w === this.win + 1 ? this.cur : 0; this.cur = 0; this.win = w }
          const p = (t % WIN) / WIN
          this.est = this.cur + this.prev * (1 - p)
        },
        hit(t) { this.update(t); if (this.est < LIMIT) { this.cur++; this.update(t); return 'ok' } return 'deny' },
      }
  }
}

const now = () => performance.now() / 1000

function useSim(id) {
  const [, force] = useReducer((x) => x + 1, 0)
  const start = useRef(now())
  const eng = useRef(makeEngine(id, 0))
  const hist = useRef([])
  const [auto, setAuto] = useState(false)

  const t = () => now() - start.current
  const reset = () => {
    start.current = now(); eng.current = makeEngine(id, 0); hist.current = []; force()
  }
  const send = (n = 1) => {
    for (let k = 0; k < n; k++) {
      const tt = t() + k * 0.001
      hist.current = [...hist.current, { t: tt, r: eng.current.hit(tt), id: Math.random() }].slice(-40)
    }
    force()
  }

  useEffect(() => { reset() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const iv = setInterval(() => { eng.current.update(t()); force() }, 100)
    return () => clearInterval(iv)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!auto) return undefined
    const iv = setInterval(() => {
      if (Math.random() < 0.12) send(3 + Math.floor(Math.random() * 4)) // occasional burst
      else if (Math.random() < 0.55) send(1)
    }, 600)
    return () => clearInterval(iv)
  }, [auto, id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { e: eng.current, hist: hist.current, time: t(), send, reset, auto, setAuto }
}

// ---------- visuals ----------
function TokenViz({ e, time }) {
  const full = Math.floor(e.tokens)
  const frac = e.tokens - full
  return (
    <div className="viz-bucket">
      <div className="faucet mono tiny">+1 token / {EVERY}s
        <span className="drip" style={{ animationDuration: `${EVERY}s` }} />
      </div>
      <div className="bucket">
        {Array.from({ length: LIMIT }, (_, i) => (
          <span key={i} className={`token ${i < full ? 'on' : ''}`} style={i === full ? { '--fill': frac } : undefined}>
            {i === full && <b style={{ transform: `scale(${frac})` }} />}
          </span>
        ))}
      </div>
      <p className="mono small">tokens = <strong className="accent">{e.tokens.toFixed(2)}</strong> / {LIMIT}</p>
      <span hidden>{time}</span>
    </div>
  )
}

function LeakyViz({ e, time }) {
  const left = e.nextLeak == null ? null : Math.max(0, e.nextLeak - time)
  return (
    <div className="viz-bucket">
      <div className="mono tiny muted">incoming ↓</div>
      <div className="bucket queue">
        {Array.from({ length: LIMIT }, (_, i) => {
          const item = e.queue[LIMIT - 1 - i] // front of queue sits at the bottom
          return <span key={i} className={`slot ${item ? 'on' : ''}`}>{item ? `#${item}` : ''}</span>
        })}
      </div>
      <div className="leak mono tiny">
        <span className="drip slow" style={{ animationDuration: `${EVERY}s`, opacity: e.queue.length ? 1 : 0.2 }} />
        ↓ 1 req / {EVERY}s → API
      </div>
      <p className="mono small">
        queue <strong className="accent">{e.queue.length}</strong>/{LIMIT} · processed <strong>{e.processed}</strong>
        {left != null && <> · next in {left.toFixed(1)}s</>}
      </p>
    </div>
  )
}

function FixedViz({ e, time }) {
  const p = (time % WIN) / WIN
  return (
    <div className="viz-window">
      <div className="win-row">
        <span className="mono tiny muted">window {e.win * WIN}–{(e.win + 1) * WIN}s</span>
        <span className="mono tiny muted">resets in {(WIN - (time % WIN)).toFixed(1)}s</span>
      </div>
      <div className="win-bar"><span style={{ width: `${p * 100}%` }} /></div>
      <div className="counter-cells">
        {Array.from({ length: LIMIT }, (_, i) => <span key={i} className={i < e.count ? 'on' : ''} />)}
      </div>
      <p className="mono small">count = <strong className="accent">{e.count}</strong> / {LIMIT}</p>
    </div>
  )
}

function LogViz({ e, time }) {
  return (
    <div className="viz-window">
      <div className="win-row">
        <span className="mono tiny muted">now − {WIN}s</span>
        <span className="mono tiny muted">now</span>
      </div>
      <div className="timeline">
        {e.log.map((ts) => (
          <span key={ts} className="ts" style={{ left: `${100 - ((time - ts) / WIN) * 100}%` }} title={`${ts.toFixed(1)}s`} />
        ))}
      </div>
      <p className="mono small">
        log = [{e.log.map((x) => x.toFixed(1)).join(', ')}] · size <strong className="accent">{e.log.length}</strong>/{LIMIT}
      </p>
    </div>
  )
}

function CounterViz({ e, time }) {
  const p = (time % WIN) / WIN
  const max = LIMIT + 1
  return (
    <div className="viz-window">
      <div className="two-win">
        <div className="win-col">
          <div className="win-fill prev" style={{ height: `${(e.prev / max) * 100}%` }} />
          <div className="win-weight" style={{ width: `${(1 - p) * 100}%` }} />
          <span className="mono tiny">prev: {e.prev}</span>
        </div>
        <div className="win-col">
          <div className="win-fill" style={{ height: `${(e.cur / max) * 100}%` }} />
          <div className="win-weight cur" style={{ width: `${p * 100}%` }} />
          <span className="mono tiny">current: {e.cur}</span>
        </div>
        <div className="slider" style={{ left: `${p * 50}%` }} />
      </div>
      <p className="mono small">
        estimate = {e.cur} + {e.prev} × {(1 - p).toFixed(2)} = <strong className={e.est >= LIMIT ? 'bad' : 'accent'}>{e.est.toFixed(2)}</strong> {e.est >= LIMIT ? '≥' : '<'} {LIMIT}
      </p>
    </div>
  )
}

const VIZ = { token: TokenViz, leaky: LeakyViz, fixed: FixedViz, log: LogViz, counter: CounterViz }

function Sim({ algo }) {
  const s = useSim(algo.id)
  const V = VIZ[algo.id]
  const ok = s.hist.filter((h) => h.r !== 'deny').length
  return (
    <div className="lab-sim">
      <div className="lab-stage"><V e={s.e} time={s.time} /></div>
      <div className="lab-controls">
        <button className="btn btn-primary btn-sm" onClick={() => s.send(1)}>Send request</button>
        <button className="btn btn-ghost btn-sm" onClick={() => s.send(8)}>Burst ×8</button>
        <button className={`btn btn-sm ${s.auto ? 'btn-on' : 'btn-ghost'}`} onClick={() => s.setAuto(!s.auto)}>
          {s.auto ? '■ stop traffic' : '▶ auto traffic'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={s.reset}>Reset</button>
        <span className="mono tiny muted lab-clock">t = {s.time.toFixed(1)}s</span>
      </div>
      <div className="lab-hist" aria-label="request results">
        {s.hist.length === 0 && <span className="mono tiny muted">Results show here: green = allowed, amber = queued, red = 429</span>}
        {s.hist.map((h) => (
          <span key={h.id} className={`hit ${h.r}`} title={`${h.t.toFixed(2)}s · ${h.r}`} />
        ))}
      </div>
      {s.hist.length > 0 && (
        <p className="mono tiny muted">{ok} accepted · {s.hist.length - ok} rejected (last {s.hist.length})</p>
      )}
    </div>
  )
}

export default function RateLimiterLab() {
  const [tab, setTab] = useState(algos[0].id)
  const a = algos.find((x) => x.id === tab)
  return (
    <div className="lab">
      <p className="mono tiny muted lab-rule">
        rule for every demo → <strong className="accent">max {LIMIT} requests / {WIN}s</strong>
      </p>
      <div className="lab-tabs" role="tablist">
        {algos.map((x, i) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setTab(x.id)}>
            <span className="mono tiny">{String(i + 1).padStart(2, '0')}</span> {x.name}
          </button>
        ))}
      </div>

      <div className="lab-card" key={a.id}>
        <h3>{a.name}</h3>
        <p className="lab-one">{a.oneLiner}</p>
        <Sim algo={a} />

        <div className="callout soft">
          <span className="callout-label mono">real-life analogy</span>
          <p>{a.analogy}</p>
        </div>

        <h4 className="lab-h mono">how it works, step by step</h4>
        <ol className="steps">{a.how.map((h) => <li key={h}>{h}</li>)}</ol>

        <h4 className="lab-h mono">worked example</h4>
        <p className="muted small">{a.example.caption}</p>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{a.example.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{a.example.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {a.edgeDiagram && <EdgeBurstDiagram />}

        <h4 className="lab-h mono">javascript</h4>
        <CodeBlock code={a.code} lang="javascript" />
        <h4 className="lab-h mono">redis (works across many servers)</h4>
        <CodeBlock code={a.redis} lang="redis" />

        <div className="req-grid">
          <div className="req"><h4 className="mono good">pros</h4><ul>{a.pros.map((p) => <li key={p}>{p}</li>)}</ul></div>
          <div className="req"><h4 className="mono bad">cons</h4><ul>{a.cons.map((p) => <li key={p}>{p}</li>)}</ul></div>
        </div>
        <p className="mono small used-by">used by → {a.usedBy}</p>
      </div>

      <h4 className="lab-h mono">side-by-side</h4>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Algorithm</th><th>Memory / user</th><th>Bursts</th><th>Accuracy</th><th>Pick when</th></tr></thead>
          <tbody>
            <tr><td><strong>Token bucket</strong></td><td>2 numbers</td><td>✅ up to capacity</td><td>Good</td><td>General APIs, default choice</td></tr>
            <tr><td><strong>Leaking bucket</strong></td><td>Queue (N items)</td><td>❌ smoothed</td><td>Good</td><td>Downstream needs a steady rate</td></tr>
            <tr><td><strong>Fixed window</strong></td><td>1 counter</td><td>⚠️ 2× at edges</td><td>Low</td><td>Simple quotas, low stakes</td></tr>
            <tr><td><strong>Sliding log</strong></td><td>1 timestamp / request</td><td>❌ none</td><td>Exact</td><td>Logins, OTP, payments</td></tr>
            <tr><td><strong>Sliding counter</strong></td><td>2 counters</td><td>Mostly smoothed</td><td>~99.99%</td><td>Huge scale, cheap and accurate</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
