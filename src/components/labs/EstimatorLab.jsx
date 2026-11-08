import { useState } from 'react'

const PRESETS = {
  'Twitter-like': { dau: 150e6, reqs: 20, writeRatio: 10, size: 1, years: 5 },
  'URL shortener': { dau: 10e6, reqs: 10, writeRatio: 10, size: 0.5, years: 10 },
  'Chat app': { dau: 50e6, reqs: 40, writeRatio: 50, size: 0.2, years: 5 },
  'Photo app': { dau: 20e6, reqs: 30, writeRatio: 5, size: 500, years: 5 },
}

const fmt = (n) => {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' T'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' K'
  return n.toFixed(0)
}
const bytes = (kb) => {
  const units = ['KB', 'MB', 'GB', 'TB', 'PB']
  let v = kb
  let i = 0
  while (v >= 1000 && i < units.length - 1) { v /= 1000; i++ }
  return `${v.toFixed(1)} ${units[i]}`
}

export default function EstimatorLab() {
  const [v, setV] = useState(PRESETS['Twitter-like'])
  const set = (k) => (e) => setV({ ...v, [k]: Number(e.target.value) })

  const total = v.dau * v.reqs
  const qps = total / 86400
  const peak = qps * 2
  const writes = qps / (v.writeRatio + 1)
  const reads = qps - writes
  const storeDay = (total / (v.writeRatio + 1)) * v.size
  const storeAll = storeDay * 365 * v.years
  const servers = Math.ceil(peak / 1000)

  const rows = [
    ['Total requests / day', `${fmt(v.dau)} DAU × ${v.reqs}`, fmt(total)],
    ['Average QPS', `${fmt(total)} ÷ 86,400 s`, fmt(qps)],
    ['Peak QPS', 'average × 2 (rule of thumb)', fmt(peak)],
    ['Reads / writes per second', `split ${v.writeRatio}:1`, `${fmt(reads)} reads · ${fmt(writes)} writes`],
    ['New storage / day', `writes/day × ${v.size} KB`, bytes(storeDay)],
    [`Storage for ${v.years} years`, '× 365 × years (no replication)', bytes(storeAll)],
    ['With 3× replication', 'every byte stored 3 times', bytes(storeAll * 3)],
    ['Web servers (rough)', 'peak ÷ ~1,000 QPS per server', `~${servers}`],
  ]

  return (
    <div className="lab">
      <div className="lab-tabs">
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className={PRESETS[k] === v ? 'on' : ''} onClick={() => setV(PRESETS[k])}>{k}</button>
        ))}
      </div>
      <div className="lab-sim">
        <div className="est-grid">
          <label>Daily active users<input type="number" value={v.dau} min="1" onChange={set('dau')} /></label>
          <label>Requests per user / day<input type="number" value={v.reqs} min="1" onChange={set('reqs')} /></label>
          <label>Read : write ratio (x:1)<input type="number" value={v.writeRatio} min="0" onChange={set('writeRatio')} /></label>
          <label>Size per write (KB)<input type="number" value={v.size} min="0" step="0.1" onChange={set('size')} /></label>
          <label>Keep data for (years)<input type="number" value={v.years} min="1" onChange={set('years')} /></label>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>What</th><th>How</th><th>Result</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td className="mono small">{r[1]}</td><td><strong className="accent">{r[2]}</strong></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
