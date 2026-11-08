import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { chapters } from '../data'
import { lldProblems } from '../data/lldProblems'
import { BRAND } from '../brand'
import { usePwa } from '../hooks/usePwa'

export const Logo = () => (
  <Link to="/" className="logo" aria-label={`${BRAND.full} home`}>
    <span className="logo-mark">
      <span>&gt;</span>_
    </span>
    <span className="logo-text">
      {BRAND.name}<em>{BRAND.tld}</em>
    </span>
  </Link>
)

export default function Header({ onSearch }) {
  const { theme, toggleTheme, done, track, setTrack, lldDone } = useStore()
  const navigate = useNavigate()
  const switchTrack = (t) => { setTrack(t); setOpen(false); navigate('/') }
  const [open, setOpen] = useState(false)
  const { online, canInstall, install } = usePwa()
  const [doneN, totalN, unit] = track === 'lld' ? [lldDone.length, lldProblems.length, 'LLD problems'] : [done.length, chapters.length, 'chapters']
  const pct = Math.round((doneN / totalN) * 100)
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="header-inner">
        <Logo />
        <div className="track-switch mono" role="tablist" aria-label="Choose track">
          <button role="tab" aria-selected={track === 'hld'} className={track === 'hld' ? 'on' : ''} onClick={() => switchTrack('hld')} title="High-level design: architecture of whole systems">HLD</button>
          <button role="tab" aria-selected={track === 'lld'} className={track === 'lld' ? 'on' : ''} onClick={() => switchTrack('lld')} title="Low-level design: classes, OOP, SOLID and design patterns">LLD</button>
        </div>
        <nav className={`nav ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Topics</NavLink>
          {track === 'hld' && <NavLink to="/compare" onClick={close}>Compare</NavLink>}
          <NavLink to="/concepts" onClick={close}>Concepts</NavLink>
          <NavLink to="/cheatsheet" onClick={close}>Cheat Sheet</NavLink>
          <NavLink to="/saved" onClick={close}>Saved</NavLink>
        </nav>
        <div className="header-actions">
          {!online && <span className="offline-pill mono tiny" title="You are offline. Every chapter still works.">● offline</span>}
          {canInstall && (
            <button className="btn btn-sm btn-ghost install-btn" onClick={install} title="Install ScaleNotes and read offline">
              ⤓ Install app
            </button>
          )}
          <button className="search-btn" onClick={onSearch} aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className="search-label">Search</span>
            <kbd>⌘K</kbd>
          </button>
          <div className="progress-pill" title={`${doneN} of ${totalN} ${unit} done`}>
            <span style={{ '--p': pct }} className="ring" />
            {pct}%
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            )}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
          </button>
        </div>
      </div>
    </header>
  )
}
