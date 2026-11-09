import { questions1 } from './questions1'
import { questions2 } from './questions2'

export const questions = [...questions1, ...questions2]

export const LEVELS = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']
export const levelRank = (l) => LEVELS.indexOf(l)
export const levelClass = (l) => 'q-lvl-' + l.toLowerCase().replace(/\s+/g, '-')

const uniq = (arr) => [...new Set(arr)]

export const qCategories = uniq(questions.flatMap((q) => q.cats)).sort()

// Companies ordered by how many questions they appear in.
export const qCompanies = (() => {
  const count = {}
  questions.forEach((q) => q.companies.forEach((c) => { count[c] = (count[c] || 0) + 1 }))
  return Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b)).map((name) => ({ name, count: count[name] }))
})()

export const questionBySlug = (slug) => questions.find((q) => q.slug === slug)
