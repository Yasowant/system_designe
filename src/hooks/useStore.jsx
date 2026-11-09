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
  // Interview question bank: status per question, ticked discussion points, personal notes, bookmarks
  const [qStatus, setQStatus] = useState(() => load('yd-q-status', {})) // { slug: 'attempted' | 'solved' }
  const [qChecks, setQChecks] = useState(() => load('yd-q-checks', {})) // { slug: [index, …] }
  const [qNotes, setQNotes] = useState(() => load('yd-q-notes', {})) // { slug: 'text' }
  const [qSaved, setQSaved] = useState(() => load('yd-q-saved', []))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('yd-theme', theme) } catch { /* ignore */ }
  }, [theme])
  useEffect(() => { save('yd-done', done) }, [done])
  useEffect(() => { save('yd-saved', saved) }, [saved])
  useEffect(() => { save('yd-quiz', quiz) }, [quiz])
  useEffect(() => { save('yd-track', track) }, [track])
  useEffect(() => { save('yd-lld-done', lldDone) }, [lldDone])
  useEffect(() => { save('yd-q-status', qStatus) }, [qStatus])
  useEffect(() => { save('yd-q-checks', qChecks) }, [qChecks])
  useEffect(() => { save('yd-q-notes', qNotes) }, [qNotes])
  useEffect(() => { save('yd-q-saved', qSaved) }, [qSaved])

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

    qStatus,
    setQuestionStatus: (slug, status) =>
      setQStatus((s) => {
        const next = { ...s }
        if (!status) delete next[slug]
        else next[slug] = status
        return next
      }),
    qChecks,
    toggleQuestionCheck: (slug, i) =>
      setQChecks((c) => {
        const cur = c[slug] || []
        return { ...c, [slug]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }
      }),
    qNotes,
    setQuestionNote: (slug, text) => setQNotes((n) => ({ ...n, [slug]: text })),
    qSaved,
    toggleQuestionSaved: toggle(qSaved, setQSaved),
    resetQuestions: () => { setQStatus({}); setQChecks({}) },
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)
