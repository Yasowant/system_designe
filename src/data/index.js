import { chapters1 } from './chapters1'
import { chapters2 } from './chapters2'
import { deepDives } from './deepDives'

// Chapters with a deep dive get their richer sections (and optionally a better flow).
export const chapters = [...chapters1, ...chapters2].map((c) =>
  deepDives[c.slug] ? { ...c, ...deepDives[c.slug], deep: true } : c,
)

export const categories = [
  { name: 'Foundations', icon: '◎', blurb: 'Scaling basics, estimation and the interview framework.' },
  { name: 'Building Blocks', icon: '▦', blurb: 'Rate limiters, hashing, KV stores, IDs and queues.' },
  { name: 'Classic Systems', icon: '◈', blurb: 'URL shortener, chat, feeds, YouTube, Drive and more.' },
  { name: 'Location & Real-time', icon: '◉', blurb: 'Geo search, live friends, maps and leaderboards.' },
  { name: 'Data & Infra', icon: '▤', blurb: 'Monitoring, aggregation, email and object storage.' },
  { name: 'Money & Transactions', icon: '₹', blurb: 'Hotels, payments, wallets and stock exchanges.' },
]

const words = (c) =>
  [c.summary, ...c.sections.flatMap((s) => [s.h, s.p, s.analogy, ...(s.steps ?? []), ...s.points]), ...c.tips].filter(Boolean).join(' ').split(/\s+/).length

export const readTime = (c) => Math.max(3, Math.round(words(c) / 180))

export const bySlug = (slug) => chapters.find((c) => c.slug === slug)
