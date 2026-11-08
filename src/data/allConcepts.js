import { concepts as hld } from './concepts'
import { hldExtras } from './hldConceptExtras'
import { lldConcepts, lldGroups } from './lldConcepts'

export const conceptSlug = (term) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Every concept, tagged with its track ('hld' | 'lld') and a URL slug.
export const allConcepts = [
  ...hld.map((c) => ({ ...c, ...(hldExtras[c.term] ?? {}), track: 'hld', slug: conceptSlug(c.term) })),
  ...lldConcepts.map((c) => ({ ...c, track: 'lld', slug: conceptSlug(c.term) })),
]

export const hldGroups = [...new Set(hld.map((c) => c.group))]
export { lldGroups }

export const conceptBySlug = (slug) => allConcepts.find((c) => c.slug === slug)
export const conceptByTerm = (term) => allConcepts.find((c) => c.term === term)
