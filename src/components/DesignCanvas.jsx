import { useEffect, useMemo, useRef, useState } from 'react'
import FlowDiagram from './FlowDiagram'

// "Design it yourself": drag building blocks onto a canvas, connect them,
// then compare your design with the chapter's reference architecture.

export const BLOCKS = [
  { type: 'client', label: 'Client', icon: '👤', keys: ['client', 'user', 'browser', 'producer', 'author', 'driver', 'rider', 'player', 'creator', 'viewer', 'sender', 'mobile', 'broker / client'], why: 'Every design starts with who sends the requests.' },
  { type: 'dns', label: 'DNS', icon: '🌐', keys: ['dns'], why: 'Turns a domain into an IP; GeoDNS sends users to the nearest region.' },
  { type: 'cdn', label: 'CDN', icon: '🛰️', keys: ['cdn', 'edge'], why: 'Serves static files and media close to users, cutting latency and load.' },
  { type: 'lb', label: 'Load balancer', icon: '⚖️', keys: ['load balancer', 'balancer'], why: 'Spreads traffic over many servers and removes dead ones.' },
  { type: 'gateway', label: 'API gateway', icon: '🚪', keys: ['gateway', 'middleware'], why: 'One entry point for auth, rate limiting and routing.' },
  { type: 'api', label: 'API servers', icon: '🖥️', keys: ['server', 'service', 'api', 'web', 'app', 'coordinator', 'engine', 'manager', 'webhook'], why: 'Stateless servers that run your business logic.' },
  { type: 'cache', label: 'Cache (Redis)', icon: '⚡', keys: ['cache', 'redis', 'memcached'], why: 'Keeps hot data in memory so most reads skip the database.' },
  { type: 'sql', label: 'SQL database', icon: '🗄️', keys: ['db', 'database', 'sql', 'primary', 'replica', 'ledger', 'mysql', 'postgres'], why: 'Durable source of truth with transactions.' },
  { type: 'nosql', label: 'NoSQL / KV store', icon: '🧩', keys: ['nosql', 'cassandra', 'kv', 'key-value', 'dynamo', 'mongodb', 'wide-column', 'sstable', 'memtable'], why: 'Huge scale and fast key lookups.' },
  { type: 'queue', label: 'Message queue', icon: '📬', keys: ['queue', 'kafka', 'topic', 'partition', 'stream', 'pub/sub', 'frontier', 'append-only', 'publisher', 'sequencer'], why: 'Decouples slow work and absorbs traffic spikes.' },
  { type: 'worker', label: 'Workers', icon: '⚙️', keys: ['worker', 'consumer', 'fan-out', 'processor', 'job', 'downloader', 'parser', 'extractor', 'aggregat', 'reconciliation'], why: 'Background processes that do the slow work from the queue.' },
  { type: 'storage', label: 'Object storage', icon: '🪣', keys: ['s3', 'blob', 'object', 'storage', 'file'], why: 'Cheap, durable storage for images, videos and files.' },
  { type: 'ws', label: 'WebSocket server', icon: '🔌', keys: ['websocket', 'socket', 'chat server', 'real-time', 'presence'], why: 'Keeps persistent connections to push updates instantly.' },
  { type: 'search', label: 'Search index', icon: '🔎', keys: ['search', 'elastic', 'trie', 'index', 'geohash', 'quadtree'], why: 'Fast full-text, prefix or geo lookups.' },
  { type: 'notify', label: 'Push / SMS / Email', icon: '🔔', keys: ['apns', 'fcm', 'push', 'sms', 'email', 'notification'], why: 'Reaches users outside the app.' },
  { type: 'limiter', label: 'Rate limiter', icon: '🚦', keys: ['rate limit', '429', 'limiter', 'load rules'], why: 'Protects the system from abuse and overload.' },
]
const byType = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))
const W = 132
const H = 44

// Which blocks does the reference architecture use?
export function referenceTypes(flow) {
  const set = new Set()
  for (const step of flow) {
    const s = step.toLowerCase()
    // match keywords only at the start of a word ("edge" must not match "ledger")
    for (const b of BLOCKS) if (b.keys.some((k) => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`).test(s))) set.add(b.type)
  }
  return [...set]
}

const load = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    if (v && Array.isArray(v.nodes)) return v
  } catch { /* ignore */ }
  return { nodes: [], edges: [] }
}

export default function DesignCanvas({ chapter }) {
  const storeKey = `yd-canvas-${chapter.slug}`
  const [state, setState] = useState(() => load(storeKey))
  const [mode, setMode] = useState('move') // move | connect | delete
  const [from, setFrom] = useState(null)
  const [showRef, setShowRef] = useState(false)
  const board = useRef(null)
  const drag = useRef(null)
  const seq = useRef(Date.now())

  useEffect(() => { setState(load(storeKey)); setShowRef(false); setFrom(null) }, [storeKey])
  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(state)) } catch { /* storage unavailable */ }
  }, [state, storeKey])

  const { nodes, edges } = state
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const add = (type) => {
    const id = `n${seq.current++}`
    setState((s) => {
      // place new blocks on a grid, using the latest state so fast clicks never stack
      const i = s.nodes.length
      const x = 30 + (i % 4) * 175
      const y = 30 + (Math.floor(i / 4) % 4) * 100
      return { ...s, nodes: [...s.nodes, { id, type, x, y }] }
    })
  }

  const onNodeDown = (e, n) => {
    e.stopPropagation()
    if (mode === 'delete') {
      setState((s) => ({ nodes: s.nodes.filter((x) => x.id !== n.id), edges: s.edges.filter((ed) => ed.from !== n.id && ed.to !== n.id) }))
      return
    }
    if (mode === 'connect') {
      if (!from) { setFrom(n.id); return }
      if (from !== n.id && !edges.some((ed) => ed.from === from && ed.to === n.id)) {
        setState((s) => ({ ...s, edges: [...s.edges, { id: `e${seq.current++}`, from, to: n.id }] }))
      }
      setFrom(null)
      return
    }
    const r = board.current.getBoundingClientRect()
    drag.current = { id: n.id, dx: e.clientX - r.left - n.x, dy: e.clientY - r.top - n.y }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (!drag.current) return
    const r = board.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(r.width - W, e.clientX - r.left - drag.current.dx))
    const y = Math.max(0, Math.min(r.height - H, e.clientY - r.top - drag.current.dy))
    setState((s) => ({ ...s, nodes: s.nodes.map((n) => (n.id === drag.current.id ? { ...n, x, y } : n)) }))
  }
  const onUp = () => { drag.current = null }

  const removeEdge = (id) => mode === 'delete' && setState((s) => ({ ...s, edges: s.edges.filter((e) => e.id !== id) }))
  const clear = () => { if (nodes.length === 0 || window.confirm('Clear your design?')) { setState({ nodes: [], edges: [] }); setShowRef(false) } }

  const ref = useMemo(() => referenceTypes(chapter.flow), [chapter.flow])
  const mine = new Set(nodes.map((n) => n.type))
  const hit = ref.filter((t) => mine.has(t))
  const extra = [...mine].filter((t) => !ref.includes(t))
  const score = ref.length ? Math.round((hit.length / ref.length) * 100) : 0

  const edgePath = (e) => {
    const a = byId[e.from]
    const b = byId[e.to]
    if (!a || !b) return null
    const ax = a.x + W / 2, ay = a.y + H / 2, bx = b.x + W / 2, by = b.y + H / 2
    // stop the arrow at the edge of the target box
    const dx = bx - ax, dy = by - ay
    const t = Math.min(Math.abs((W / 2 + 4) / (dx || 1e-9)), Math.abs((H / 2 + 4) / (dy || 1e-9)))
    return `M ${ax} ${ay} L ${bx - dx * t} ${by - dy * t}`
  }

  return (
    <div className="canvas-wrap">
      <div className="canvas-tools">
        <div className="seg">
          {[['move', '✥ Move'], ['connect', '↗ Connect'], ['delete', '✕ Delete']].map(([m, l]) => (
            <button key={m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setFrom(null) }}>{l}</button>
          ))}
        </div>
        <span className="mono tiny muted canvas-hint">
          {mode === 'move' && 'Click a block below to add it, then drag it into place.'}
          {mode === 'connect' && (from ? `Now click where ${byType[byId[from]?.type]?.label ?? 'it'} sends requests.` : 'Click the box that sends a request first.')}
          {mode === 'delete' && 'Click a box or an arrow to remove it.'}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={clear}>Clear</button>
      </div>

      <div className="palette">
        {BLOCKS.map((b) => (
          <button key={b.type} className="palette-item" onClick={() => add(b.type)} title={b.why}>
            <span>{b.icon}</span>{b.label}
          </button>
        ))}
      </div>

      <div className="board-scroll">
        <div ref={board} className={`board mode-${mode}`} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          {nodes.length === 0 && (
            <p className="board-empty mono small muted">
              How would <strong>you</strong> build “{chapter.title.replace(/^Design (a |an )?/, '')}”?<br />
              Add blocks from above, connect them, then compare with the reference.
            </p>
          )}
          <svg className="board-svg">
            <defs>
              <marker id="cv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
              </marker>
            </defs>
            {edges.map((e) => {
              const d = edgePath(e)
              return d && (
                <g key={e.id} onClick={() => removeEdge(e.id)} className="board-edge">
                  <path d={d} className="hitbox" />
                  <path d={d} className="line" markerEnd="url(#cv-arrow)" />
                </g>
              )
            })}
          </svg>
          {nodes.map((n) => {
            const b = byType[n.type]
            return (
              <div
                key={n.id}
                className={`board-node ${from === n.id ? 'picked' : ''} ${showRef ? (ref.includes(n.type) ? 'good' : 'extra') : ''}`}
                style={{ left: n.x, top: n.y, width: W, height: H }}
                onPointerDown={(e) => onNodeDown(e, n)}
                title={b?.why}
              >
                <span>{b?.icon}</span>{b?.label}
              </div>
            )
          })}
        </div>
      </div>

      <div className="canvas-foot">
        <span className="mono tiny muted">{nodes.length} blocks · {edges.length} arrows · saved in this browser</span>
        <button className={`btn btn-sm ${showRef ? 'btn-on' : 'btn-primary'}`} onClick={() => setShowRef(!showRef)} disabled={nodes.length === 0}>
          {showRef ? 'Hide reference' : 'Compare with reference →'}
        </button>
      </div>

      {showRef && (
        <div className="ref-panel">
          <div className="ref-score">
            <span className="ring-score" style={{ '--p': score }}><b>{score}%</b></span>
            <div>
              <h4>You covered {hit.length} of {ref.length} key building blocks</h4>
              <p className="muted small">
                {score === 100 ? 'Excellent, every core block is there. Now check your arrows against the flow below.' : score >= 60 ? 'Good start. Look at what is missing and why it matters.' : 'Read the missing blocks below, then try again. That is how it sticks.'}
              </p>
            </div>
          </div>
          <ul className="ref-list">
            {ref.map((t) => (
              <li key={t} className={mine.has(t) ? 'ok' : 'miss'}>
                <span>{mine.has(t) ? '✓' : '✗'}</span>
                <div><strong>{byType[t].icon} {byType[t].label}</strong><p className="muted small">{byType[t].why}</p></div>
              </li>
            ))}
            {extra.map((t) => (
              <li key={t} className="extra">
                <span>＋</span>
                <div><strong>{byType[t].icon} {byType[t].label}</strong><p className="muted small">Not in the reference. Fine if you can explain why you need it.</p></div>
              </li>
            ))}
          </ul>
          <p className="mono tiny muted">reference request flow</p>
          <FlowDiagram steps={chapter.flow} />
        </div>
      )}
    </div>
  )
}
