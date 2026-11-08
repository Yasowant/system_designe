import { useMemo, useRef, useState } from 'react'

// FNV-1a 32-bit hash -> position on the ring (0..1)
const fnv = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  // murmur3 finalizer: spreads similar inputs ("S2", "S4") far apart on the ring
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16
  return h >>> 0
}
const pos = (s) => fnv(s) / 2 ** 32
const COLORS = ['#c6f432', '#ff7a59', '#7cc4ff', '#f5b800', '#c084fc', '#4ade80', '#f472b6', '#2dd4bf']
const KEYS = Array.from({ length: 36 }, (_, i) => `user:${1000 + i * 37}`)
const R = 120
const xy = (p, r = R) => [160 + r * Math.sin(p * 2 * Math.PI), 160 - r * Math.cos(p * 2 * Math.PI)]

function owners(servers, vnodes) {
  const points = servers.flatMap((s) => Array.from({ length: vnodes }, (_, v) => ({ s, p: pos(`${s.name}#${v}`) }))).sort((a, b) => a.p - b.p)
  const owner = (k) => {
    if (!points.length) return null
    const kp = pos(k)
    return (points.find((pt) => pt.p >= kp) ?? points[0]).s // first server clockwise
  }
  return { points, owner }
}

export default function HashRingLab() {
  const [servers, setServers] = useState(() => [0, 1, 2].map((i) => ({ name: `S${i + 1}`, color: COLORS[i] })))
  const [vnodes, setVnodes] = useState(1)
  const [moved, setMoved] = useState(null)
  const next = useRef(4)

  const { points, owner } = useMemo(() => owners(servers, vnodes), [servers, vnodes])
  const counts = Object.fromEntries(servers.map((s) => [s.name, 0]))
  KEYS.forEach((k) => { const o = owner(k); if (o) counts[o.name]++ })

  const change = (nextServers) => {
    const before = owners(servers, vnodes).owner
    const after = owners(nextServers, vnodes).owner
    const ring = KEYS.filter((k) => before(k)?.name !== after(k)?.name).length
    const mod = KEYS.filter((k) => fnv(k) % servers.length !== fnv(k) % Math.max(1, nextServers.length)).length
    setMoved({ ring, mod, keys: new Set(KEYS.filter((k) => before(k)?.name !== after(k)?.name)) })
    setServers(nextServers)
  }
  const add = () => {
    if (servers.length >= 8) return
    const n = next.current++
    change([...servers, { name: `S${n}`, color: COLORS[(n - 1) % COLORS.length] }])
  }
  const remove = () => servers.length > 1 && change(servers.slice(0, -1))

  return (
    <div className="lab">
      <div className="lab-sim">
        <div className="ring-wrap">
          <svg viewBox="0 0 320 320" className="ring-svg">
            <circle cx="160" cy="160" r={R} className="ring" />
            {KEYS.map((k) => {
              const [x, y] = xy(pos(k), R - 22)
              const o = owner(k)
              return <circle key={k} cx={x} cy={y} r={moved?.keys.has(k) ? 6 : 4} fill={o?.color} className={moved?.keys.has(k) ? 'key moved' : 'key'}><title>{`${k} → ${o?.name}`}</title></circle>
            })}
            {points.map((pt, i) => {
              const [x, y] = xy(pt.p)
              return (
                <g key={i} className="srv-pt">
                  <circle cx={x} cy={y} r={vnodes > 1 ? 7 : 11} fill={pt.s.color} stroke="var(--bg)" strokeWidth="3" />
                  {vnodes === 1 && <text x={x} y={y - 16} textAnchor="middle" className="ring-lbl">{pt.s.name}</text>}
                </g>
              )
            })}
            <text x="160" y="156" textAnchor="middle" className="ring-lbl">hash ring</text>
            <text x="160" y="174" textAnchor="middle" className="ring-sub">0 → 2³²</text>
          </svg>
          <div className="ring-side">
            <p className="mono tiny muted">keys per server (36 keys)</p>
            {servers.map((s) => (
              <div key={s.name} className="ring-bar">
                <span className="mono tiny" style={{ color: s.color }}>{s.name}</span>
                <span className="lb-load"><span style={{ width: `${(counts[s.name] / KEYS.length) * 100 * 2}%`, background: s.color }} /></span>
                <span className="mono tiny">{counts[s.name]}</span>
              </div>
            ))}
            <label className="mono tiny vn">
              virtual nodes per server: <strong className="accent">{vnodes}</strong>
              <input type="range" min="1" max="20" value={vnodes} onChange={(e) => { setMoved(null); setVnodes(Number(e.target.value)) }} />
            </label>
          </div>
        </div>
        <div className="lab-controls">
          <button className="btn btn-primary btn-sm" onClick={add}>+ Add server</button>
          <button className="btn btn-ghost btn-sm" onClick={remove}>− Remove server</button>
        </div>
        {moved && (
          <p className="mono small">
            keys moved with consistent hashing: <strong className="accent">{moved.ring}/36</strong> · with <code>hash % N</code>: <strong className="bad">{moved.mod}/36</strong>
          </p>
        )}
        <p className="mono tiny muted">Each key walks clockwise to the first server dot. Big dots = keys that just moved. Slide virtual nodes up to see the load even out.</p>
      </div>
    </div>
  )
}
