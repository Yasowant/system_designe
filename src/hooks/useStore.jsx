import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const StoreCtx = createContext(null)

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')
  const [done, setDone] = useState(() => load('yd-done', []))
  const [saved, setSaved] = useState(() => load('yd-saved', []))
  const [quiz, setQuiz] = useState(() => load('yd-quiz', {}))
  const [track, setTrack] = useState(() => load('yd-track', 'hld')) // 'hld' | 'lld'
  const [lldDone, setLldDone] = useState(() => load('yd-lld-done', []))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('yd-theme', theme) } catch { /* ignore */ }
  }, [theme])
  useEffect(() => { save('yd-done', done) }, [done])
  useEffect(() => { save('yd-saved', saved) }, [saved])
  useEffect(() => { save('yd-quiz', quiz) }, [quiz])
  useEffect(() => { save('yd-track', track) }, [track])
  useEffect(() => { save('yd-lld-done', lldDone) }, [lldDone])

  const toggle = (list, setList) => (slug) =>
    setList(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug])

  const value = {
    theme,
    toggleTheme: useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []),
    done,
    toggleDone: toggle(done, setDone),
    saved,
    toggleSaved: toggle(saved, setSaved),
    quiz,
    setQuizScore: (slug, score) => setQuiz((q) => ({ ...q, [slug]: score })),
    track,
    setTrack,
    lldDone,
    toggleLldDone: toggle(lldDone, setLldDone),
    resetProgress: () => { setDone([]); setQuiz({}) },
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)
