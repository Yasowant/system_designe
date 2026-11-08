import { cheatsheet } from '../data/concepts'

const Table = ({ title, head, rows, note }) => (
  <div className="sheet">
    <h3>{title}</h3>
    {note && <p className="muted small">{note}</p>}
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((x, i) => <td key={i} className={i ? 'mono' : ''}>{x}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>
)

export default function CheatSheet() {
  return (
    <div className="container section page">
      <div className="page-head">
        <p className="eyebrow mono"><span className="dot" /> back-of-the-envelope</p>
        <h1>Numbers every dev <span className="serif">should know</span></h1>
        <p className="muted">Approximate values — use them for estimation, not benchmarks. Hardware gets faster; the ratios stay useful.</p>
      </div>
      <div className="sheets">
        <Table title="Latency" head={['Operation', 'Time']} rows={cheatsheet.latency} note="ns = nanosecond, µs = microsecond, ms = millisecond" />
        <div className="sheets-col">
          <Table title="Powers of two" head={['Power', 'Approx.', 'Size']} rows={cheatsheet.powers} />
          <Table title="Availability" head={['SLA', 'Down / year', 'Down / month']} rows={cheatsheet.availability} />
        </div>
        <Table title="Handy shortcuts" head={['Rule', 'Value']} rows={cheatsheet.handy} />
      </div>
    </div>
  )
}
