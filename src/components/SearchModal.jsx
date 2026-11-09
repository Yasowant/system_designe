import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chapters } from '../data'
import { allConcepts } from '../data/allConcepts'
import { lldProblems } from '../data/lldProblems'
import { comparisons } from '../data/comparisons'
import { questions } from '../data/questions'

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const nav = useNavigate()
  const input = useRef(null)

  useEffect(() => {
    input.current?.focus()
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    const ch = chapters
      .filter((c) => !t || (c.title + ' ' + c.tagline + ' ' + c.category + ' ' + c.summary).toLowerCase().includes(t))
      .map((c) => ({ type: 'Chapter', label: c.title, sub: c.tagline, to: `/learn/${c.slug}`, n: c.n }))
    const co = t
      ? allConcepts
          .filter((c) => (c.term + ' ' + c.def + ' ' + c.group).toLowerCase().includes(t))
          .map((c) => ({ type: 'Concept', label: c.term, sub: `${c.track.toUpperCase()} · ${c.def}`, to: `/concepts/${c.slug}` }))
      : []
    const ll = t
      ? lldProblems
          .filter((p) => (p.title + ' ' + p.tagline + ' lld').toLowerCase().includes(t))
          .map((p) => ({ type: 'LLD', label: p.title, sub: p.tagline, to: `/lld/${p.slug}` }))
      : []
    const vs = comparisons
      .filter((c) => !t || (c.title + ' ' + c.tagline + ' ' + c.options.join(' ')).toLowerCase().includes(t))
      .map((c) => ({ type: 'Compare', label: c.title, sub: c.tagline, to: `/compare/${c.slug}` }))
    const qs = t
      ? questions
          .filter((x) => (x.title + ' ' + x.cats.join(' ') + ' ' + x.companies.join(' ') + ' interview question').toLowerCase().includes(t))
          .map((x) => ({ type: 'Question', label: x.title, sub: `${x.level} · ${x.companies.slice(0, 3).join(', ')}`, to: `/questions/${x.slug}` }))
      : []
    return [...ch, ...ll, ...qs, ...(t ? vs : []), ...co].slice(0, 14)
  }, [q])

  useEffect(() => { setIdx(0) }, [q])

  const go = (r) => {
    nav(r.to)
    onClose()
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[idx]) go(results[idx])
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="modal-input">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search systems, questions & concepts… (e.g. cache, uber, chat)" />
          <kbd>esc</kbd>
        </div>
        <ul className="modal-results">
          {results.length === 0 && <li className="empty">No matches for “{q}”.</li>}
          {results.map((r, i) => (
            <li key={r.type + r.label} className={i === idx ? 'active' : ''} onMouseEnter={() => setIdx(i)} onClick={() => go(r)}>
              <span className={`tag ${r.type === 'Concept' ? 'tag-alt' : ''}`}>{r.type === 'Chapter' ? String(r.n).padStart(2, '0') : r.type === 'Compare' ? 'vs' : r.type === 'LLD' ? 'lld' : r.type === 'Question' ? 'q' : 'concept'}</span>
              <div>
                <strong>{r.label}</strong>
                <span className="muted small clamp1">{r.sub}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
