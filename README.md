# ScaleNotes — System Design

By Yasowant ([yasowantdev.info](https://yasowantdev.info)). The site name lives in `src/brand.js`.

A React study site for developers: 28 real-world system design case studies, 34 core concepts, a numbers cheat sheet and quick quizzes, with light and dark mode.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Features

- 28 chapters in 6 tracks (Foundations → Money & Transactions)
- Each chapter has a TL;DR, requirements, an architecture flow diagram, deep-dive sections, a trade-offs table, interview tips and a quiz
- Light and dark mode, saved in the browser and following the OS setting by default
- ⌘K / Ctrl+K or `/` search across chapters and concepts
- Progress tracking, bookmarks and quiz scores, all saved in localStorage
- Reading progress bar, a scroll-tracking table of contents and a chapter sidebar
- Animated architecture diagrams and interactive labs (rate limiter, load balancer, hash ring, Snowflake IDs, base62, estimation calculator)
- ✦ Design it yourself: drag-and-drop canvas on 24 chapters, scored against the reference architecture (saved in localStorage)
- X vs Y comparison pages at /compare (SQL vs NoSQL, Kafka vs RabbitMQ, REST vs GraphQL vs gRPC, WebSocket vs SSE, Redis vs Memcached, Monolith vs Microservices)
- HLD | LLD switch in the header (saved in localStorage)
- Every concept opens its own page at /concepts/:slug (34 HLD + 26 LLD concepts with analogies, code and related chapters)
- LLD track: OOP, SOLID, design patterns, UML and concurrency in TypeScript, plus problems at /lld/:slug (parking lot, LRU cache, Splitwise) with UML class diagrams
- Copy button on every code block
- Installable PWA that works offline (service worker in public/sw.js, registered in production builds only; bump VERSION in sw.js after changing it)

Test offline mode with `npm run build && npm run preview`, open the site once, then turn off Wi-Fi and reload.
- Responsive on mobile and tablet; respects reduced-motion settings

## Fonts

| Use | Font |
| --- | --- |
| Headings | Bricolage Grotesque |
| Body | Plus Jakarta Sans |
| Accent words | *Instrument Serif* italic |
| Labels and code | JetBrains Mono |

## Add or edit content

All content is plain JS data:

- `src/data/chapters1.js`, `src/data/chapters2.js`: chapters
- `src/data/concepts.js`: glossary and cheat sheet
- `src/data/index.js`: track names and read-time calculation

To add a chapter, copy any chapter object, give it a new `n` and `slug`, and it shows up everywhere automatically.

## Deploy

- **Vercel:** import the repo. `vercel.json` already handles SPA routing.
- **Netlify:** set the build command to `npm run build` and the publish folder to `dist`. `public/_redirects` handles routing.

## Credits

The topic list is inspired by [liquidslr/system-design-notes](https://github.com/liquidslr/system-design-notes) and Alex Xu's *System Design Interview* (Vol. 1 & 2). All explanations here are written from scratch.

Built by **Yasowant**: [Portfolio](https://yasowantdev.info) · [GitHub](https://github.com/Yasowant) · [Instagram](https://instagram.com/yasowant.dev)
