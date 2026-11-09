import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { questions, qCategories, qCompanies, LEVELS, levelRank, levelClass } from '../data/questions'
import { useStore } from '../hooks/useStore'

const PAGE_SIZES = [25, 50, 100, 200, 500]
const STATUSES = [
  ['todo', 'To do'],
  ['attempted', 'Attempted'],
  ['solved', 'Solved'],
  ['saved', 'Bookmarked'],
]

// Filters live in the URL (?cat=…&co=…&lvl=…), so a filtered view can be shared or bookmarked.
const list = (p, k) => (p.get(k) ? p.get(k).split('|') : [])

export default function Questions() {
  const [params, setParams] = useSearchParams()
  const { qStatus, qSaved, toggleQuestionSaved } = useStore()
  const navigate = useNavigate()

  const cats = list(params, 'cat')
  const cos = list(params, 'co')
  const lvls = list(params, 'lvl')
  const sts = list(params, 'st')
  const text = params.get('q') || ''
  const sort = params.get('sort') || 'n'
  const dir = params.get('dir') || 'asc'
  const size = Number(params.get('size')) || 25
  const page = Number(params.get('page')) || 1

  const update = (changes, keepPage = false) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join('|') : v
      if (val === '' || val == null) next.delete(k)
      else next.set(k, String(val))
    })
    if (!keepPage) next.delete('page')
    setParams(next, { replace: true })
  }
  const toggleIn = (key, arr, v) => update({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] })

  const statusOf = (slug) => qStatus[slug] || 'todo'

  const filtered = useMemo(() => {
    const t = text.trim().toLowerCase()
    const rows = questions.filter((q) =>
      (!cats.length || q.cats.some((c) => cats.includes(c))) &&
      (!cos.length || q.companies.some((c) => cos.includes(c))) &&
      (!lvls.length || lvls.includes(q.level)) &&
      (!sts.length || sts.some((s) => (s === 'saved' ? qSaved.includes(q.slug) : statusOf(q.slug) === s))) &&
      (!t || (q.title + ' ' + q.cats.join(' ') + ' ' + q.companies.join(' ') + ' ' + q.prompt).toLowerCase().includes(t)),
    )
    const key = sort === 'level' ? (q) => levelRank(q.level) * 1000 + q.n : (q) => q.n
    rows.sort((a, b) => (dir === 'asc' ? key(a) - key(b) : key(b) - key(a)))
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, qStatus, qSaved])

  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const cur = Math.min(page, pages)
  const shown = filtered.slice((cur - 1) * size, cur * size)

  const solved = questions.filter((q) => qStatus[q.slug] === 'solved').length
  const attempted = questions.filter((q) => qStatus[q.slug] === 'attempted').length
  const anyFilter = cats.length || cos.length || lvls.length || sts.length || text

  const setSort = (k) => update({ sort: k, dir: sort === k && dir === 'asc' ? 'desc' : 'asc' }, true)
  const arrow = (k) => (sort === k ? (dir === 'asc' ? '↑' : '↓') : '↕')

  const random = () => {
    const pool = filtered.filter((q) => statusOf(q.slug) !== 'solved')
    const pick = (pool.length ? pool : filtered)[Math.floor(Math.random() * (pool.length || filtered.length))]
    if (pick) navigate(`/questions/${pick.slug}`)
  }

  return (
    <div className="container section page">
      <div className="page-head">
        <p className="eyebrow mono"><span className="dot" /> interview / question bank</p>
        <h1>Interview <span className="serif">questions</span></h1>
        <p className="muted">
          {questions.length} real system design interview questions, tagged by company, category and complexity.
          Every one has a solution outline, a checklist of what to cover and a practice timer.
        </p>
      </div>

      <div className="progress-card q-progress">
        <div>
          <span className="mono big">{solved}/{questions.length}</span>
          <p className="muted small">solved · {attempted} attempted · {qSaved.length} bookmarked</p>
        </div>
        <div className="bar"><span style={{ width: `${(solved / questions.length) * 100}%` }} /></div>
        <button className="btn btn-sm btn-primary" onClick={random} disabled={!filtered.length}>⚄ Random question</button>
      </div>

      <div className="q-layout">
        <aside className="q-filters">
          <input
            className="field q-search"
            value={text}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search questions…"
            aria-label="Search questions"
          />
          <FilterPanel title="Category" count={cats.length} onClear={() => update({ cat: '' })} open>
            {qCategories.map((c) => (
              <Check key={c} label={c} on={cats.includes(c)} onChange={() => toggleIn('cat', cats, c)}
                n={questions.filter((q) => q.cats.includes(c)).length} />
            ))}
          </FilterPanel>
          <CompanyPanel cos={cos} onToggle={(c) => toggleIn('co', cos, c)} onClear={() => update({ co: '' })} />
          <FilterPanel title="Complexity" count={lvls.length} onClear={() => update({ lvl: '' })} open>
            {LEVELS.map((l) => (
              <Check key={l} label={l} on={lvls.includes(l)} onChange={() => toggleIn('lvl', lvls, l)}
                n={questions.filter((q) => q.level === l).length} />
            ))}
          </FilterPanel>
          <FilterPanel title="My status" count={sts.length} onClear={() => update({ st: '' })}>
            {STATUSES.map(([k, label]) => (
              <Check key={k} label={label} on={sts.includes(k)} onChange={() => toggleIn('st', sts, k)} />
            ))}
          </FilterPanel>
        </aside>

        <div className="q-main">
          <div className="q-toolbar">
            <span className="mono small muted">{filtered.length} question{filtered.length === 1 ? '' : 's'}</span>
            {anyFilter ? (
              <div className="chips">
                {[...cats.map((v) => ['cat', cats, v]), ...cos.map((v) => ['co', cos, v]), ...lvls.map((v) => ['lvl', lvls, v]),
                  ...sts.map((v) => ['st', sts, v])].map(([k, arr, v]) => (
                  <button key={k + v} className="chip chip-sm on" onClick={() => toggleIn(k, arr, v)}>
                    {k === 'st' ? STATUSES.find((s) => s[0] === v)?.[1] : v} ✕
                  </button>
                ))}
                <button className="link-btn" onClick={() => setParams({}, { replace: true })}>clear all</button>
              </div>
            ) : null}
          </div>

          <div className="table-wrap">
            <table className="table q-table">
              <thead>
                <tr>
                  <th><button className="q-sort" onClick={() => setSort('n')}># {arrow('n')}</button></th>
                  <th>Question</th>
                  <th className="q-hide-sm">Category</th>
                  <th><button className="q-sort" onClick={() => setSort('level')}>Complexity {arrow('level')}</button></th>
                  <th className="q-hide-sm">Status</th>
                  <th aria-label="Bookmark" />
                </tr>
              </thead>
              <tbody>
                {shown.map((q) => {
                  const st = statusOf(q.slug)
                  const isSaved = qSaved.includes(q.slug)
                  return (
                    <tr key={q.slug} className={st === 'solved' ? 'q-row-solved' : ''}>
                      <td className="mono small muted">{q.n}</td>
                      <td>
                        <Link to={`/questions/${q.slug}`} className="q-title">{q.title}</Link>
                        <div className="q-companies">
                          {q.companies.slice(0, 4).map((c) => (
                            <button key={c} className={`q-co ${cos.includes(c) ? 'on' : ''}`} onClick={() => toggleIn('co', cos, c)}>{c}</button>
                          ))}
                          {(q.companies.length > 4 || q.more) && <span className="mono tiny muted">+{Math.max(0, q.companies.length - 4) + (q.more || 0)}</span>}
                          <span className="q-sol mono tiny">✓ solution</span>
                        </div>
                      </td>
                      <td className="q-hide-sm small muted">{q.cats.join(', ')}</td>
                      <td><span className={`q-lvl ${levelClass(q.level)}`}>{q.level}</span></td>
                      <td className="q-hide-sm"><StatusDot st={st} /></td>
                      <td>
                        <button className={`save-btn ${isSaved ? 'on' : ''}`} onClick={() => toggleQuestionSaved(q.slug)} aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!shown.length && (
                  <tr><td colSpan={6} className="muted q-empty">No questions match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="q-pagination">
            <label className="mono small muted">
              Show{' '}
              <select className="q-select" value={size} onChange={(e) => update({ size: e.target.value })}>
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="q-pages">
              <button className="btn btn-sm btn-ghost" disabled={cur <= 1} onClick={() => update({ page: cur - 1 }, true)}>← Prev</button>
              <span className="mono small">Page {cur} of {pages}</span>
              <button className="btn btn-sm btn-ghost" disabled={cur >= pages} onClick={() => update({ page: cur + 1 }, true)}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatusDot({ st }) {
  const label = { todo: 'To do', attempted: 'Attempted', solved: 'Solved' }[st]
  return <span className={`q-status q-status-${st}`}><i />{label}</span>
}

function FilterPanel({ title, count, onClear, open, children }) {
  return (
    // Panels start collapsed on phones so the table is visible without scrolling past every filter.
    <details className="q-panel" open={open && typeof window !== 'undefined' && window.innerWidth > 900}>
      <summary>
        <span>{title}{count ? <span className="q-count mono">{count}</span> : null}</span>
        {count ? <button className="link-btn" onClick={(e) => { e.preventDefault(); onClear() }}>Clear</button> : null}
      </summary>
      <div className="q-panel-body">{children}</div>
    </details>
  )
}

function Check({ label, on, onChange, n }) {
  return (
    <label className={`q-check ${on ? 'on' : ''}`}>
      <input type="checkbox" checked={on} onChange={onChange} />
      <span>{label}</span>
      {n != null && <span className="mono tiny muted">{n}</span>}
    </label>
  )
}

function CompanyPanel({ cos, onToggle, onClear }) {
  const [find, setFind] = useState('')
  const [all, setAll] = useState(false)
  const matches = qCompanies.filter((c) => c.name.toLowerCase().includes(find.toLowerCase()))
  const visible = find || all ? matches : matches.slice(0, 12)
  return (
    <FilterPanel title="Companies" count={cos.length} onClear={onClear}>
      <input className="field q-mini-search" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find a company…" />
      {visible.map((c) => <Check key={c.name} label={c.name} n={c.count} on={cos.includes(c.name)} onChange={() => onToggle(c.name)} />)}
      {!find && matches.length > 12 && (
        <button className="link-btn" onClick={() => setAll(!all)}>{all ? 'show less' : `show all ${matches.length}`}</button>
      )}
    </FilterPanel>
  )
}
