import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { allConcepts, hldGroups, lldGroups } from '../data/allConcepts'
import { useStore } from '../hooks/useStore'

export default function Concepts() {
  const [params] = useSearchParams()
  const { track, setTrack } = useStore()
  const [q, setQ] = useState(params.get('q') || '')
  const [g, setG] = useState('All')

  const groups = ['All', ...(track === 'lld' ? lldGroups : hldGroups)]
  const list = useMemo(() => {
    const t = q.toLowerCase()
    return allConcepts.filter(
      (c) => c.track === track && (g === 'All' || c.group === g) && (c.term + c.def + c.example).toLowerCase().includes(t),
    )
  }, [q, g, track])

  const switchTo = (t) => { setTrack(t); setG('All') }

  return (
    <div className="container section page">
      <div className="page-head">
        <p className="eyebrow mono"><span className="dot" /> glossary · {track === 'lld' ? 'low-level design' : 'high-level design'}</p>
        <h1>Core <span className="serif">concepts</span></h1>
        <p className="muted">
          {track === 'lld'
            ? 'OOP, SOLID, design patterns, UML and concurrency, each with a real-life comparison and TypeScript code. Click any card for the full explanation.'
            : 'The vocabulary that shows up in every system design discussion. Click any card for the full explanation, code and the chapters where it appears.'}
        </p>
      </div>
      <div className="concept-tabs">
        <button className={track === 'hld' ? 'on' : ''} onClick={() => switchTo('hld')}>
          <strong>HLD</strong><span className="mono tiny">{allConcepts.filter((c) => c.track === 'hld').length} concepts · architecture</span>
        </button>
        <button className={track === 'lld' ? 'on' : ''} onClick={() => switchTo('lld')}>
          <strong>LLD</strong><span className="mono tiny">{allConcepts.filter((c) => c.track === 'lld').length} concepts · classes &amp; patterns</span>
        </button>
      </div>
      <div className="filters">
        <input className="field" placeholder="Filter concepts…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          {groups.map((x) => <button key={x} className={`chip chip-sm ${g === x ? 'on' : ''}`} onClick={() => setG(x)}>{x}</button>)}
        </div>
      </div>
      <div className="concept-grid">
        {list.map((c, i) => (
          <Link to={`/concepts/${c.slug}`} className="concept concept-link" key={c.slug} style={{ '--i': i }}>
            <span className="mono tiny accent">{c.group}</span>
            <h3>{c.term}</h3>
            <p className="small">{c.def}</p>
            <p className="example mono tiny">e.g. {c.example}</p>
            <span className="concept-more mono tiny">read more →</span>
          </Link>
        ))}
        {list.length === 0 && <p className="muted">Nothing matches “{q}”.</p>}
      </div>
    </div>
  )
}
