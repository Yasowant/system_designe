import { useRef, useState } from 'react'

const EPOCH = 1288834974657n // Twitter's custom epoch (Nov 2010)

export default function SnowflakeLab() {
  const [dc, setDc] = useState(3)
  const [machine, setMachine] = useState(7)
  const [ids, setIds] = useState([])
  const last = useRef({ ms: -1n, seq: 0n })

  const gen = (n = 1) => {
    const out = []
    for (let i = 0; i < n; i++) {
      const ms = BigInt(Date.now()) - EPOCH
      if (ms === last.current.ms) last.current.seq = (last.current.seq + 1n) & 4095n
      else last.current = { ms, seq: 0n }
      const { seq } = last.current
      const id = (ms << 22n) | (BigInt(dc) << 17n) | (BigInt(machine) << 12n) | seq
      out.push({ id, ms, seq, dc, machine })
    }
    setIds((x) => [...out.reverse(), ...x].slice(0, 6))
  }

  const top = ids[0]
  const bin = (v, len) => v.toString(2).padStart(len, '0')
  return (
    <div className="lab">
      <div className="lab-sim">
        <div className="lab-controls">
          <label className="mono tiny">datacenter <input className="num" type="number" min="0" max="31" value={dc} onChange={(e) => setDc(Math.min(31, Math.max(0, +e.target.value)))} /></label>
          <label className="mono tiny">machine <input className="num" type="number" min="0" max="31" value={machine} onChange={(e) => setMachine(Math.min(31, Math.max(0, +e.target.value)))} /></label>
          <button className="btn btn-primary btn-sm" onClick={() => gen(1)}>Generate ID</button>
          <button className="btn btn-ghost btn-sm" onClick={() => gen(5)}>5 in the same millisecond</button>
        </div>
        {top ? (
          <>
            <div className="bits mono">
              <span className="b-sign" title="sign bit">0</span>
              <span className="b-ts" title="timestamp">{bin(top.ms, 41)}</span>
              <span className="b-dc" title="datacenter">{bin(BigInt(top.dc), 5)}</span>
              <span className="b-m" title="machine">{bin(BigInt(top.machine), 5)}</span>
              <span className="b-seq" title="sequence">{bin(top.seq, 12)}</span>
            </div>
            <div className="bits-legend mono tiny">
              <span><i className="b-sign" /> 1 bit sign</span>
              <span><i className="b-ts" /> 41 bits ms since epoch = {top.ms.toString()}</span>
              <span><i className="b-dc" /> 5 bits datacenter = {top.dc}</span>
              <span><i className="b-m" /> 5 bits machine = {top.machine}</span>
              <span><i className="b-seq" /> 12 bits sequence = {top.seq.toString()}</span>
            </div>
            <ul className="lb-log mono small">
              {ids.map((x) => <li key={x.id.toString()}><strong className="accent">{x.id.toString()}</strong> <span className="muted tiny">seq {x.seq.toString()}</span></li>)}
            </ul>
          </>
        ) : (
          <p className="mono tiny muted">Press “Generate ID” to build a 64-bit Snowflake ID from the current time.</p>
        )}
      </div>
    </div>
  )
}
