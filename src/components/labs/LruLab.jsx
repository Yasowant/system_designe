import { useState } from 'react'

// Visual LRU cache: most recent on the left, least recent (next to evict) on the right.
const CAP = 4
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function LruLab() {
  const [list, setList] = useState([]) // [{ k, v }], index 0 = most recent
  const [log, setLog] = useState([])
  const [hl, setHl] = useState(null) // { k, kind }
  const [counter, setCounter] = useState(1)

  const note = (txt, kind) => setLog((l) => [{ txt, kind, id: Math.random() }, ...l].slice(0, 6))

  const put = (k) => {
    const v = counter
    setCounter(counter + 1)
    const exists = list.find((x) => x.k === k)
    let next = [{ k, v }, ...list.filter((x) => x.k !== k)]
    let evicted = null
    if (next.length > CAP) { evicted = next[next.length - 1]; next = next.slice(0, CAP) }
    setList(next)
    setHl({ k, kind: 'put' })
    note(`put(${k}, ${v})${exists ? ' → updated, moved to front' : ''}${evicted ? ` → evicted ${evicted.k} (least recently used)` : ''}`, evicted ? 'bad' : 'ok')
  }
  const get = (k) => {
    const item = list.find((x) => x.k === k)
    if (!item) { setHl(null); note(`get(${k}) → undefined (miss)`, 'bad'); return }
    setList([item, ...list.filter((x) => x.k !== k)])
    setHl({ k, kind: 'get' })
    note(`get(${k}) → ${item.v} (hit, moved to front)`, 'ok')
  }

  return (
    <div className="lab">
      <div className="lab-sim">
        <div className="lru-row">
          <span className="mono tiny muted">head<br />most recent</span>
          <div className="lru-list">
            {Array.from({ length: CAP }, (_, i) => {
              const x = list[i]
              return (
                <div key={x ? x.k : `empty${i}`} className={`lru-node ${x ? '' : 'empty'} ${x && hl?.k === x.k ? hl.kind : ''} ${x && i === list.length - 1 && list.length === CAP ? 'next-out' : ''}`}>
                  {x ? <><strong>{x.k}</strong><span className="mono tiny">{x.v}</span></> : <span className="mono tiny muted">empty</span>}
                </div>
              )
            })}
          </div>
          <span className="mono tiny muted">tail<br />evicted next</span>
        </div>
        <div className="lru-controls">
          <span className="mono tiny muted">put</span>
          {KEYS.map((k) => <button key={'p' + k} className="btn btn-ghost btn-sm" onClick={() => put(k)}>{k}</button>)}
        </div>
        <div className="lru-controls">
          <span className="mono tiny muted">get</span>
          {KEYS.map((k) => <button key={'g' + k} className="btn btn-ghost btn-sm" onClick={() => get(k)}>{k}</button>)}
          <button className="btn btn-ghost btn-sm" onClick={() => { setList([]); setLog([]); setHl(null); setCounter(1) }}>Reset</button>
        </div>
        <ul className="lb-log mono tiny">
          {log.length === 0 && <li className="muted">capacity = {CAP}. Put A, B, C, D, then get A, then put E. Which key gets evicted?</li>}
          {log.map((l) => <li key={l.id} className={l.kind === 'bad' ? 'bad' : ''}>{l.txt}</li>)}
        </ul>
        <p className="mono tiny muted">The Map gives O(1) lookup; the linked list (shown above) gives O(1) move-to-front and evict.</p>
      </div>
    </div>
  )
}
