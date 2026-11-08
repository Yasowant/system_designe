import { useState } from 'react'

const ALPHA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function encode(n) {
  const steps = []
  let x = BigInt(n)
  if (x === 0n) return { code: '0', steps: [[ '0', '0', '0', '0' ]] }
  let code = ''
  while (x > 0n) {
    const r = x % 62n
    steps.push([x.toString(), (x / 62n).toString(), r.toString(), ALPHA[Number(r)]])
    code = ALPHA[Number(r)] + code
    x /= 62n
  }
  return { code, steps }
}

export default function Base62Lab() {
  const [id, setId] = useState('2009215674938')
  const valid = /^\d{1,18}$/.test(id)
  const { code, steps } = valid ? encode(id) : { code: '—', steps: [] }
  return (
    <div className="lab">
      <div className="lab-sim">
        <div className="lab-controls">
          <label className="mono tiny">database ID <input className="num wide" value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ''))} /></label>
          <button className="btn btn-ghost btn-sm" onClick={() => setId(String(BigInt(id || '0') + 1n))}>next ID +1</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setId(String(Math.floor(Math.random() * 3.5e12)))}>random</button>
        </div>
        <p className="b62-out mono">https://sho.rt/<strong className="accent">{code}</strong></p>
        {steps.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Number</th><th>÷ 62</th><th>Remainder</th><th>Char</th></tr></thead>
              <tbody>{steps.map((s, i) => <tr key={i} className="mono small">{s.map((c, j) => <td key={j}>{j === 3 ? <strong className="accent">{c}</strong> : c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        <p className="mono tiny muted">Read the Char column from bottom to top to get the code. 62⁷ ≈ 3.5 trillion codes fit in 7 characters.</p>
      </div>
    </div>
  )
}
