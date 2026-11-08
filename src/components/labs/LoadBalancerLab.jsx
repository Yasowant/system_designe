import { useEffect, useRef, useState } from 'react'

const ALGOS = {
  rr: { name: 'Round robin', why: 'Sends requests to servers in turn: 1, 2, 3, 4, 1, 2… Simple and fair when every request costs about the same.' },
  lc: { name: 'Least connections', why: 'Sends each request to the server with the fewest active requests. Better when some requests are slow (uploads, reports).' },
  ip: { name: 'IP hash', why: 'hash(client IP) % servers. The same user always lands on the same server (“sticky”), but adding or removing a server reshuffles users.' },
}
const IPS = ['49.36.12.8', '103.21.4.77', '152.58.9.1', '27.61.200.3', '106.51.7.44', '117.99.3.10']
const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)

export default function LoadBalancerLab() {
  const [algo, setAlgo] = useState('rr')
  const [servers, setServers] = useState(() => [0, 1, 2, 3].map((i) => ({ id: i + 1, up: true, active: 0, total: 0 })))
  const [log, setLog] = useState([])
  const [auto, setAuto] = useState(false)
  const rr = useRef(0)
  const sv = useRef(servers)
  sv.current = servers

  const send = () => {
    const list = sv.current
    const healthy = list.filter((s) => s.up)
    if (!healthy.length) { setLog((l) => [{ k: Math.random(), txt: 'no healthy servers → 503', bad: true }, ...l].slice(0, 6)); return }
    const ip = IPS[Math.floor(Math.random() * IPS.length)]
    let target
    if (algo === 'rr') { target = healthy[rr.current % healthy.length]; rr.current++ }
    else if (algo === 'lc') target = healthy.reduce((a, b) => (b.active < a.active ? b : a))
    else target = healthy[hash(ip) % healthy.length]
    const slow = Math.random() < 0.3
    const ms = slow ? 4000 : 900
    setServers((ss) => ss.map((s) => (s.id === target.id ? { ...s, active: s.active + 1, total: s.total + 1, flash: Math.random() } : s)))
    setLog((l) => [{ k: Math.random(), txt: `${ip} → Server ${target.id}${slow ? ' (slow request)' : ''}` }, ...l].slice(0, 6))
    setTimeout(() => setServers((ss) => ss.map((s) => (s.id === target.id ? { ...s, active: Math.max(0, s.active - 1) } : s))), ms)
  }

  useEffect(() => {
    if (!auto) return undefined
    const iv = setInterval(send, 450)
    return () => clearInterval(iv)
  }, [auto, algo]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setServers((ss) => ss.map((s) => (s.id === id ? { ...s, up: !s.up, active: 0 } : s)))
  const reset = () => { rr.current = 0; setLog([]); setServers((ss) => ss.map((s) => ({ ...s, up: true, active: 0, total: 0 }))) }

  return (
    <div className="lab">
      <div className="lab-tabs" role="tablist">
        {Object.entries(ALGOS).map(([k, v]) => (
          <button key={k} className={algo === k ? 'on' : ''} onClick={() => setAlgo(k)}>{v.name}</button>
        ))}
      </div>
      <p className="muted small" style={{ margin: 0 }}>{ALGOS[algo].why}</p>
      <div className="lab-sim">
        <div className="lb-stage">
          <div className="lb-node mono small">Clients</div>
          <div className="lb-wire"><i /></div>
          <div className="lb-node lb-main mono small">Load balancer<br /><span className="tiny muted">{ALGOS[algo].name}</span></div>
          <div className="lb-servers">
            {servers.map((s) => (
              <button key={s.id} className={`lb-server ${s.up ? '' : 'down'}`} onClick={() => toggle(s.id)} title="click to kill / revive">
                <span key={s.flash} className="lb-flash" />
                <strong>Server {s.id}</strong>
                <span className="mono tiny">{s.up ? `${s.active} active · ${s.total} total` : '✕ down (health check failed)'}</span>
                <span className="lb-load"><span style={{ width: `${Math.min(100, s.active * 20)}%` }} /></span>
              </button>
            ))}
          </div>
        </div>
        <div className="lab-controls">
          <button className="btn btn-primary btn-sm" onClick={send}>Send request</button>
          <button className={`btn btn-sm ${auto ? 'btn-on' : 'btn-ghost'}`} onClick={() => setAuto(!auto)}>{auto ? '■ stop traffic' : '▶ auto traffic'}</button>
          <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          <span className="mono tiny muted lab-clock">tip: click a server to kill it</span>
        </div>
        <ul className="lb-log mono tiny">
          {log.map((l) => <li key={l.k} className={l.bad ? 'bad' : ''}>{l.txt}</li>)}
        </ul>
      </div>
    </div>
  )
}
