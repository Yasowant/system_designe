// ScaleNotes service worker: makes the whole site readable offline.
// Bump VERSION when you change this file to force old caches to be cleared.
const VERSION = 'scalenotes-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png']

// Precache the app shell AND the hashed JS/CSS bundles referenced by index.html,
// so every chapter works offline right after the first visit.
self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const c = await caches.open(VERSION)
      await c.addAll(SHELL)
      const html = await (await c.match('/index.html')).text()
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
      await c.addAll(assets)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const putInCache = async (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const c = await caches.open(VERSION)
    await c.put(req, res.clone())
  }
  return res
}

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // 1. Page navigations (/learn/rate-limiter, /compare/...): network first, fall back to the cached app shell.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => putInCache('/index.html', res))
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  // 2. Built JS/CSS (file names contain a hash, so they never change): cache first.
  if (url.origin === location.origin && url.pathname.startsWith('/assets/')) {
    e.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => putInCache(request, res))))
    return
  }

  // 3. Google Fonts and other same-origin files: serve from cache, refresh in the background.
  if (url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(request).then((hit) => {
        const net = fetch(request).then((res) => putInCache(request, res)).catch(() => hit)
        return hit || net
      }),
    )
  }
})
