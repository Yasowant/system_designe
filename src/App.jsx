import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import SearchModal from './components/SearchModal'
import Home from './pages/Home'
import Chapter from './pages/Chapter'
import Concepts from './pages/Concepts'
import CheatSheet from './pages/CheatSheet'
import Saved from './pages/Saved'
import NotFound from './pages/NotFound'
import Compare from './pages/Compare'
import CompareDetail from './pages/CompareDetail'
import ConceptDetail from './pages/ConceptDetail'
import LldProblem from './pages/LldProblem'
import Questions from './pages/Questions'
import Question from './pages/Question'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <Header onSearch={() => setSearchOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:slug" element={<Chapter />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/:slug" element={<CompareDetail />} />
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/concepts/:slug" element={<ConceptDetail />} />
          <Route path="/lld/:slug" element={<LldProblem />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/:slug" element={<Question />} />
          <Route path="/cheatsheet" element={<CheatSheet />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
