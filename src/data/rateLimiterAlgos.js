// Deep-dive content for the 5 rate-limiting algorithms.
// Every example uses the same rule so they are easy to compare:
//   "max 5 requests per 10 seconds per user"

export const RULE = { limit: 5, window: 10, refillEvery: 2 }

export const algos = [
  {
    id: 'token',
    name: 'Token bucket',
    oneLiner: 'A bucket holds tokens. Each request spends one. Tokens drip back in at a fixed rate.',
    analogy:
      'Think of a metro card with a daily top-up. You can spend several rides back to back (a burst), but once the balance is zero you wait for the next top-up.',
    how: [
      'Each user gets a bucket with a capacity (here 5 tokens). It starts full.',
      'Tokens are added at a fixed refill rate (here 1 token every 2 s) until the bucket is full. Extra tokens overflow and are lost.',
      'When a request arrives: if there is at least 1 token, remove it and allow the request. Otherwise reject it with 429.',
      'You do not need a timer per user. Store only `tokens` and `lastRefill`; on each request compute how many tokens should have been added since `lastRefill`.',
    ],
    example: {
      caption: 'Capacity 5, refill 1 token / 2 s. The user fires a burst, waits, then fires again.',
      cols: ['Time', 'Event', 'Tokens before', 'Result', 'Tokens after'],
      rows: [
        ['0.0 s', '5 requests at once', '5', '✅ ×5 allowed', '0'],
        ['0.5 s', '1 request', '0', '❌ 429', '0'],
        ['2.0 s', '— refill +1 —', '0', '', '1'],
        ['2.1 s', '1 request', '1', '✅ allowed', '0'],
        ['10.0 s', '— idle, refilled to cap —', '0', '', '5 (capped)'],
      ],
    },
    code: `function tokenBucket({ capacity, refillPerSec }) {
  const buckets = new Map() // userId -> { tokens, last }

  return function allow(userId, now = Date.now() / 1000) {
    const b = buckets.get(userId) ?? { tokens: capacity, last: now }
    // 1. lazily refill based on elapsed time
    b.tokens = Math.min(capacity, b.tokens + (now - b.last) * refillPerSec)
    b.last = now
    // 2. spend a token if we have one
    const ok = b.tokens >= 1
    if (ok) b.tokens -= 1
    buckets.set(userId, b)
    return ok
  }
}

const allow = tokenBucket({ capacity: 5, refillPerSec: 0.5 })
allow('user-42') // true`,
    redis: `-- KEYS[1] = "tb:user-42"   ARGV = capacity, refillPerSec, now
local cap, rate, now = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local b = redis.call('HMGET', KEYS[1], 'tokens', 'last')
local tokens = tonumber(b[1]) or cap
local last   = tonumber(b[2]) or now
tokens = math.min(cap, tokens + (now - last) * rate)
local ok = 0
if tokens >= 1 then tokens = tokens - 1; ok = 1 end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'last', now)
redis.call('EXPIRE', KEYS[1], math.ceil(cap / rate) * 2)
return ok`,
    pros: ['Allows short bursts up to capacity: friendly to real users', 'Only 2 numbers per user: tiny memory', 'Easy to explain and implement'],
    cons: ['Two knobs (capacity and refill rate) to tune', 'A full bucket lets a burst through all at once'],
    usedBy: 'Amazon API Gateway, Stripe, most cloud APIs',
  },
  {
    id: 'leaky',
    name: 'Leaking bucket',
    oneLiner: 'Requests join a fixed-size FIFO queue. A worker takes them out at a constant rate.',
    analogy:
      'A bucket with a small hole at the bottom. Pour water in as fast as you like; it only drips out at one speed. If you pour too fast, it overflows.',
    how: [
      'Each user has a queue of fixed size (here 5).',
      'An incoming request is added to the queue if there is space; otherwise it is dropped (429).',
      'A processor removes requests from the front at a fixed rate (here 1 every 2 s) and sends them to the API.',
      'The output rate is perfectly smooth, regardless of how bursty the input is.',
    ],
    example: {
      caption: 'Queue size 5, processes 1 request / 2 s.',
      cols: ['Time', 'Event', 'Queue before', 'Result', 'Queue after'],
      rows: [
        ['0.0 s', '7 requests at once', '0', '✅ 5 queued, ❌ 2 dropped', '5'],
        ['2.0 s', '— leak: 1 processed —', '5', '→ API', '4'],
        ['2.5 s', '1 request', '4', '✅ queued', '5'],
        ['4.0 s', '— leak: 1 processed —', '5', '→ API', '4'],
      ],
    },
    code: `class LeakyBucket {
  constructor({ size, leakEveryMs, handler }) {
    this.queue = []
    this.size = size
    setInterval(() => {               // constant outflow
      const req = this.queue.shift()
      if (req) handler(req)
    }, leakEveryMs)
  }
  offer(req) {
    if (this.queue.length >= this.size) return false // overflow -> 429
    this.queue.push(req)
    return true                                      // accepted (will run later)
  }
}`,
    redis: `# Producer (API gateway): bounded list per user
LLEN  lb:user-42                 # if >= 5 -> reply 429
RPUSH lb:user-42 <request-id>

# Consumer (worker), runs every 2 s
LPOP  lb:user-42                 # forward this request to the API`,
    pros: ['Very stable, predictable outflow: protects fragile downstreams', 'Memory bounded by queue size'],
    cons: ['A burst of old requests can block new ones (head-of-line)', 'Requests wait in the queue, which adds latency', 'Also two knobs: queue size and outflow rate'],
    usedBy: 'Shopify (REST Admin API), traffic shaping in networks, NGINX limit_req',
  },
  {
    id: 'fixed',
    name: 'Fixed window counter',
    oneLiner: 'Split time into fixed windows (00–10 s, 10–20 s…). Count requests in the current window.',
    analogy:
      'A gym that allows 5 entries per hour slot. At 10:00 the counter resets, no matter how many came in at 9:59.',
    how: [
      'Compute the window key: `floor(now / windowSize)`, e.g. `user-42:1700000010`.',
      'Increment the counter for that key. If the new value is above the limit, reject.',
      'Set a TTL equal to the window size so old counters delete themselves.',
      'Weak spot: a burst at the end of one window plus a burst at the start of the next can let 2× the limit through within a short span.',
    ],
    example: {
      caption: 'Limit 5 per 10 s window. Watch the edge problem between 9 s and 11 s.',
      cols: ['Time', 'Window', 'Count before', 'Result', 'Count after'],
      rows: [
        ['1 s', '0–10', '0', '✅', '1'],
        ['9 s', '0–10', '1', '✅ ×4 (burst)', '5'],
        ['9.5 s', '0–10', '5', '❌ 429', '5'],
        ['10 s', '10–20 (reset)', '0', '✅ ×5 (burst)', '5'],
        ['→', '9 s → 10.5 s', '', '⚠️ 9 requests in ~1.5 s', ''],
      ],
    },
    edgeDiagram: true,
    code: `function fixedWindow({ limit, windowSec }) {
  const counts = new Map() // "user:window" -> count

  return function allow(userId, now = Date.now() / 1000) {
    const key = userId + ':' + Math.floor(now / windowSec)
    const n = (counts.get(key) ?? 0) + 1
    counts.set(key, n)
    return n <= limit
  }
}`,
    redis: `# key = rl:user-42:<floor(now/10)>
MULTI
INCR   rl:user-42:170000001
EXPIRE rl:user-42:170000001 10
EXEC
# if INCR result > 5 -> 429`,
    pros: ['Simplest possible: one counter per user per window', 'Very cheap in Redis (INCR + EXPIRE)', 'Easy to show “resets at 10:00” to users'],
    cons: ['Edge bursts can allow up to 2× the limit', 'Everyone resets at the same moment, which can cause a thundering herd'],
    usedBy: 'Simple per-minute API quotas, GitHub-style hourly limits',
  },
  {
    id: 'log',
    name: 'Sliding window log',
    oneLiner: 'Keep a timestamp for every request. Count only those in the last 10 s.',
    analogy:
      'A guard with a notebook who writes down each entry time and, before letting you in, crosses out entries older than 10 minutes.',
    how: [
      'For each user keep a sorted set (log) of request timestamps.',
      'On a new request, first remove timestamps older than `now − window`.',
      'If the remaining count is below the limit, add `now` and allow. Otherwise reject.',
      'The window always ends at “now”, so there is no edge problem: it is exact.',
    ],
    example: {
      caption: 'Limit 5 in any rolling 10 s.',
      cols: ['Time', 'Log after cleanup', 'Count', 'Result'],
      rows: [
        ['1, 2, 3, 4, 5 s', '[1,2,3,4,5]', '5', '✅ ×5'],
        ['9 s', '[1,2,3,4,5]', '5', '❌ 429'],
        ['11.5 s', '[2,3,4,5] (1 expired)', '4', '✅ → [2,3,4,5,11.5]'],
        ['12 s', '[3,4,5,11.5] (2 expired)', '4', '✅'],
      ],
    },
    code: `function slidingLog({ limit, windowSec }) {
  const logs = new Map() // userId -> number[]

  return function allow(userId, now = Date.now() / 1000) {
    const log = (logs.get(userId) ?? []).filter((t) => t > now - windowSec)
    const ok = log.length < limit
    if (ok) log.push(now)
    logs.set(userId, log)
    return ok
  }
}`,
    redis: `# Sorted set: score = timestamp (ms)
MULTI
ZREMRANGEBYSCORE rl:user-42 0 <now-10000>   # drop old entries
ZCARD            rl:user-42                 # count in window
EXEC
# if count < 5:
ZADD   rl:user-42 <now> <now>-<uuid>
EXPIRE rl:user-42 10`,
    pros: ['Exactly accurate, with no edge bursts', 'Window always rolls with real time'],
    cons: ['Stores one timestamp per request: memory heavy for high limits (10k/min = 10k entries per user)', 'More Redis work per request'],
    usedBy: 'Low-volume, high-value limits: login attempts, OTP sends, payments',
  },
  {
    id: 'counter',
    name: 'Sliding window counter',
    oneLiner: 'Keep only 2 counters (previous and current window) and estimate the rolling count with a weighted average.',
    analogy:
      'Instead of a full notebook, the guard remembers “last hour: 8 people, this hour so far: 3”. If we are 30% into this hour, the estimate is 3 + 8 × 70%.',
    how: [
      'Store counts for the current fixed window and the previous one.',
      'Let `p` = how far we are into the current window (0 → 1).',
      'Estimated count = `current + previous × (1 − p)`. This assumes the previous window’s requests were spread evenly.',
      'If estimate < limit, allow and increment `current`. Otherwise reject.',
    ],
    example: {
      caption: 'Limit 5 / 10 s. Previous window (0–10 s) had 4 requests. Now it is 13 s (p = 0.3).',
      cols: ['Step', 'Calculation', 'Value'],
      rows: [
        ['Current window count', 'requests in 10–20 s so far', '2'],
        ['Weight of previous', '1 − 0.3', '0.7'],
        ['Estimate', '2 + 4 × 0.7', '4.8'],
        ['Decision', '4.8 < 5', '✅ allow → current = 3'],
        ['Next request at 13.2 s', '3 + 4 × 0.68 = 5.72', '❌ 429'],
      ],
    },
    code: `function slidingCounter({ limit, windowSec }) {
  const counts = new Map() // "user:window" -> count

  return function allow(userId, now = Date.now() / 1000) {
    const win = Math.floor(now / windowSec)
    const cur = counts.get(userId + ':' + win) ?? 0
    const prev = counts.get(userId + ':' + (win - 1)) ?? 0
    const p = (now % windowSec) / windowSec
    const estimate = cur + prev * (1 - p)
    if (estimate >= limit) return false
    counts.set(userId + ':' + win, cur + 1)
    return true
  }
}`,
    redis: `# Two plain counters, same as fixed window
GET  rl:user-42:<win-1>          # previous
GET  rl:user-42:<win>            # current
# estimate = cur + prev * (1 - p); if < 5:
INCR   rl:user-42:<win>
EXPIRE rl:user-42:<win> 20       # keep for 2 windows`,
    pros: ['Smooths the edge burst problem', 'Only 2 counters per user: tiny memory', 'Great default for large-scale APIs'],
    cons: ['An approximation: assumes evenly spread traffic', 'Slightly harder to explain to end users'],
    usedBy: 'Cloudflare (measured ~0.003% error over 400M requests)',
  },
]
