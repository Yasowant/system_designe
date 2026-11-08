// Original explanations written for ScaleNotes (by Yasowant).
// Topic list inspired by github.com/liquidslr/system-design-notes (chapter index only).

export const chapters1 = [
  {
    n: 1,
    slug: 'scaling-zero-to-millions',
    title: 'Scale From Zero to Millions of Users',
    tagline: 'How a single server grows into a global system, one bottleneck at a time.',
    category: 'Foundations',
    level: 'Beginner',
    summary:
      'Every big system starts as one box running the web app, database and cache together. Scaling is the habit of finding the next bottleneck and removing it: split the database out, add more web servers behind a load balancer, add caches and a CDN, make servers stateless, replicate and shard the data, and move slow work to queues.',
    requirements: {
      functional: ['Serve web and mobile clients', 'Store user data reliably'],
      nonFunctional: ['Handle growth from 1 to millions of users', 'Stay available when a server dies', 'Keep latency low worldwide'],
    },
    sections: [
      {
        h: 'Step 1 — Separate the tiers',
        p: 'Move the database to its own machine so the web tier and data tier can scale independently. Pick SQL when you need joins and transactions; pick NoSQL when you need huge scale, flexible schema or very low latency key lookups.',
        points: ['Vertical scaling (bigger box) is simple but has a hard ceiling and is a single point of failure', 'Horizontal scaling (more boxes) is what lets you grow without limit'],
      },
      {
        h: 'Step 2 — Load balancer + stateless web tier',
        p: 'Put a load balancer in front of several web servers. Users talk to the balancer’s public IP; servers talk on private IPs. To add or remove servers freely, keep no session data on them — store sessions in Redis or a database.',
        points: ['Round robin, least connections and IP hash are common algorithms', 'Health checks remove dead servers automatically', 'Sticky sessions work but make scaling and failover harder'],
      },
      {
        h: 'Step 3 — Database replication',
        p: 'Use one primary for writes and several replicas for reads. Most apps read far more than they write, so this multiplies read capacity and gives you a hot standby.',
        points: ['If a replica dies, reads go to others', 'If the primary dies, promote a replica (watch out for replication lag and data loss)'],
      },
      {
        h: 'Step 4 — Cache and CDN',
        p: 'A cache (Redis/Memcached) keeps hot data in memory so most reads never touch the database. A CDN serves static files — images, JS, CSS, videos — from edge servers close to the user.',
        points: ['Set TTLs so stale data expires', 'Plan for eviction (LRU is the usual default)', 'Avoid a single cache node — it becomes a single point of failure'],
      },
      {
        h: 'Step 5 — Multiple data centers, queues, sharding',
        p: 'GeoDNS routes users to the nearest data center. Message queues decouple producers from slow workers (image resizing, emails). When one database can no longer hold the data, shard it by a key such as user_id.',
        points: ['Sharding problems: resharding, hot keys (celebrity problem), cross-shard joins', 'Add logging, metrics and automation before you need them'],
      },
    ],
    flow: ['User', 'DNS / GeoDNS', 'CDN', 'Load Balancer', 'Stateless Web Servers', 'Cache', 'DB Primary + Replicas', 'Message Queue → Workers'],
    tradeoffs: [
      { choice: 'Vertical vs horizontal scaling', pro: 'Vertical is simple, no code changes', con: 'Hard limit and single point of failure' },
      { choice: 'Sticky sessions vs shared session store', pro: 'Sticky needs no extra infra', con: 'Uneven load, failover loses sessions' },
      { choice: 'Sharding', pro: 'Near-unlimited data size and write throughput', con: 'Complex queries, resharding pain, hot partitions' },
    ],
    tips: ['Start simple, then say “the next bottleneck is…” — interviewers love that thinking', 'Always mention removing single points of failure', 'Name concrete tools (Nginx, Redis, Kafka) but explain the idea, not just the brand'],
    quiz: [
      { q: 'Why should web servers be stateless?', options: ['They use less memory', 'Any server can handle any request, so you can add/remove servers freely', 'It makes SQL queries faster', 'It removes the need for a database'], a: 1, why: 'Without local session state, the load balancer can send a user anywhere and autoscaling becomes easy.' },
      { q: 'What does a read replica mostly help with?', options: ['Write throughput', 'Read throughput and availability', 'Schema changes', 'Reducing storage cost'], a: 1, why: 'Replicas copy the primary and serve reads; writes still go to the primary.' },
    ],
  },
  {
    n: 2,
    slug: 'back-of-the-envelope',
    title: 'Back-of-the-Envelope Estimation',
    tagline: 'Rough math that tells you whether a design can even work.',
    category: 'Foundations',
    level: 'Beginner',
    summary:
      'Before drawing boxes, estimate the load: requests per second, storage per year, bandwidth and memory for caching. You don’t need exact numbers — you need the right order of magnitude, clear assumptions and quick arithmetic using powers of two and known latency numbers.',
    requirements: { functional: ['Estimate QPS, storage, bandwidth, cache size'], nonFunctional: ['State assumptions out loud', 'Round aggressively'] },
    sections: [
      { h: 'Powers of two', p: 'Data sizes grow by roughly 1,000 per step. Memorise the ladder and conversions become instant.', points: ['2^10 ≈ 1 thousand → 1 KB', '2^20 ≈ 1 million → 1 MB', '2^30 ≈ 1 billion → 1 GB', '2^40 ≈ 1 trillion → 1 TB', '2^50 → 1 PB'] },
      { h: 'Latency intuition', p: 'Memory is fast, disk is slow, and the network across continents is slowest. A cross-region round trip (~150 ms) costs as much as millions of memory reads.', points: ['Memory read ≈ 100 ns', 'SSD random read ≈ 100 µs', 'Same-datacenter round trip ≈ 0.5 ms', 'Disk seek ≈ 10 ms', 'Cross-continent round trip ≈ 150 ms', 'Compress data before sending it over the network'] },
      { h: 'Availability nines', p: 'SLAs are written as “nines”. Each extra nine cuts allowed downtime by 10×.', points: ['99% → ~3.65 days/year', '99.9% → ~8.8 hours/year', '99.99% → ~53 minutes/year', '99.999% → ~5 minutes/year'] },
      { h: 'Worked example — a Twitter-like app', p: 'Assume 300M monthly users, 50% daily active, 2 posts per user per day, 10% of posts have media of 1 MB, kept 5 years.', points: ['DAU = 150M', 'Write QPS = 150M × 2 / 86,400 ≈ 3,500; peak ≈ 7,000', 'Media per day = 150M × 2 × 10% × 1 MB = 30 TB', '5-year media ≈ 30 TB × 365 × 5 ≈ 55 PB'] },
    ],
    flow: ['Users (MAU)', 'DAU', 'Actions/day', '÷ 86,400 = avg QPS', '× 2–3 = peak QPS', 'Size × count = storage'],
    tradeoffs: [{ choice: 'Precision vs speed', pro: 'Rounding (99,987/9.1 → 100,000/10) keeps you moving', con: 'Slightly wrong numbers — fine if order of magnitude is right' }],
    tips: ['Write units on every number (QPS, GB, MB/s)', 'One day ≈ 100,000 seconds is a handy approximation', 'Interviewers grade the process, not the final digit'],
    quiz: [
      { q: '10 million writes per day is roughly how many writes per second?', options: ['~12', '~115', '~1,150', '~11,500'], a: 1, why: '10,000,000 / 86,400 ≈ 115.' },
      { q: '99.99% availability allows about how much downtime per year?', options: ['8.8 hours', '53 minutes', '5 minutes', '3.6 days'], a: 1, why: 'Four nines ≈ 52.6 minutes per year.' },
    ],
  },
  {
    n: 3,
    slug: 'system-design-framework',
    title: 'A Framework for System Design Interviews',
    tagline: 'A repeatable 4-step plan so you never freeze in an interview.',
    category: 'Foundations',
    level: 'Beginner',
    summary:
      'A design interview is a collaborative conversation, not a quiz. Use four steps: understand the problem and scope it, propose a high-level design and get buy-in, deep dive into the most interesting parts, then wrap up with bottlenecks and improvements. Manage your time and keep talking.',
    requirements: { functional: ['Clarify features, users, scale'], nonFunctional: ['Show trade-off thinking', 'Communicate clearly'] },
    sections: [
      { h: '1. Understand & scope (3–10 min)', p: 'Never jump straight to a solution. Ask what features matter, who the users are, how many there are, how fast it must grow, and what tech already exists.', points: ['“Is this mobile, web, or both?”', '“What are the most important features?”', '“How many daily users? Read-heavy or write-heavy?”'] },
      { h: '2. High-level design (10–15 min)', p: 'Draw the main boxes — clients, APIs, servers, databases, caches, queues — and walk through one or two core flows. Do quick estimations if they shape the design. Ask the interviewer if they agree before going deeper.', points: ['Define the main APIs', 'Sketch the data model', 'Treat the interviewer like a teammate'] },
      { h: '3. Deep dive (10–25 min)', p: 'Pick the 2–3 components that are hardest or most interesting — often the ones the interviewer hints at. Discuss algorithms, data partitioning, consistency and failure handling.', points: ['Don’t spend time on things that don’t matter (e.g. how login works for a URL shortener)', 'Explain why, not just what'] },
      { h: '4. Wrap up (3–5 min)', p: 'Summarise, identify bottlenecks, discuss failure scenarios, monitoring, and how you would scale 10× further.', points: ['Error cases: server failure, network partition', 'Ops: metrics, logging, rollout', 'Next scale curve'] },
    ],
    flow: ['Clarify', 'Estimate', 'APIs', 'High-level boxes', 'Data model', 'Deep dive', 'Bottlenecks', 'Wrap up'],
    tradeoffs: [{ choice: 'Breadth vs depth', pro: 'Breadth shows full-system thinking', con: 'Too broad looks shallow — pick 2–3 areas to go deep' }],
    tips: ['Red flag: over-engineering and refusing to consider trade-offs', 'Think out loud — silence gives the interviewer no signal', 'Write down requirements and keep referring back to them'],
    quiz: [{ q: 'What is the first thing you should do in a design interview?', options: ['Draw the database schema', 'Ask clarifying questions to scope the problem', 'Choose Kafka vs RabbitMQ', 'Write code'], a: 1, why: 'Building the wrong thing well is still a fail — scope first.' }],
  },
  {
    n: 4,
    slug: 'rate-limiter',
    title: 'Design a Rate Limiter',
    tagline: 'Protect your APIs from abuse and overload by capping requests.',
    category: 'Building Blocks',
    level: 'Intermediate',
    summary:
      'A rate limiter controls how many requests a client can send in a time window — for example 5 login attempts per minute. It prevents abuse and denial-of-service, cuts cost and keeps servers healthy. It usually lives in an API gateway or middleware and stores counters in a fast shared store like Redis.',
    requirements: {
      functional: ['Limit requests per user / IP / API key', 'Return HTTP 429 when limited', 'Support different rules per endpoint'],
      nonFunctional: ['Very low latency (adds to every request)', 'Works across many servers', 'Fails open if the limiter itself is down'],
    },
    sections: [
      {
        h: 'Why rate limit at all?',
        p: 'Every public API needs a limit. Without one, a single buggy script or attacker can use up all your capacity and money.',
        points: [
          'Stop abuse: brute-force logins, scraping, spam sign-ups, DoS attacks',
          'Control cost: each call to a paid third party (SMS, OpenAI, maps) costs real money',
          'Fairness: one heavy customer should not slow everyone else down',
          'Protect downstream services: databases and legacy systems have hard capacity limits',
        ],
      },
      {
        h: 'Where to put it',
        p: 'Client-side limits are easy to bypass, so enforce limits on the server. Most teams put the limiter in the API gateway (NGINX, Kong, AWS API Gateway, Cloudflare) so every service is protected without changing its code. If you need business-aware rules ("free plan: 100/day"), add middleware inside the app.',
        points: [
          'Client → useful for UX (disable the button) but never trusted',
          'API gateway / reverse proxy → the best default; one place, protects everything',
          'App middleware → when limits depend on user plan, endpoint or business logic',
        ],
        code: `// Express middleware (uses the token bucket from the lab below)
app.use(async (req, res, next) => {
  const key = req.user?.id ?? req.ip
  const { ok, remaining, retryAfter } = await limiter.check(key)
  res.set('X-RateLimit-Limit', '5')
  res.set('X-RateLimit-Remaining', String(remaining))
  if (!ok) {
    res.set('Retry-After', String(retryAfter))
    return res.status(429).json({ error: 'Too many requests' })
  }
  next()
})`,
      },
      {
        h: 'Algorithms (interactive)',
        p: 'There are five classic algorithms. Each one trades memory, accuracy and burst handling differently. Pick a tab, press "Burst ×8" and watch how each one reacts to the same traffic.',
        points: [],
        lab: 'rate-limiter',
      },
      {
        h: 'Rules: what are we limiting?',
        p: 'Rules usually live in config files (YAML or a DB), are loaded by every gateway and cached in memory. Each rule picks a key (who), a limit and a window.',
        points: [
          'By user ID: the most fair; needs authentication',
          'By IP: works for anonymous traffic, but many users behind one office or mobile NAT share an IP',
          'By API key / tenant: for B2B plans (free vs pro)',
          'By endpoint: /login is much stricter than /products',
        ],
        code: `# rules.yaml
- domain: auth
  key: ip
  endpoint: POST /login
  limit: 5
  per: minute
- domain: api
  key: api_key
  plan: free
  limit: 1000
  per: day`,
      },
      {
        h: 'Distributed counters',
        p: 'With one server you can keep counters in memory. With many gateways, they must share state, otherwise each server allows its own 5 and the user gets 5 × N. Put the counters in Redis: it is in memory, fast (under 1 ms) and supports TTLs.',
        points: [],
        diagram: 'distributed',
      },
      {
        h: 'The race condition (and the fix)',
        p: 'A naive "GET count → check → SET count+1" is not atomic. Two gateways can read the same value at the same moment and both let a request through.',
        points: [
          'Fix 1: use atomic commands, e.g. INCR returns the new value in one step',
          'Fix 2: put the whole check-and-update in a Lua script; Redis runs it atomically',
          'Avoid locks: they add latency to every single request',
        ],
        diagram: 'race',
        code: `-- limiter.lua: fixed window, atomic
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
if n > tonumber(ARGV[1]) then return 0 end
return 1

-- Node: const ok = await redis.eval(script, 1, 'rl:user-42:1700000', 5, 10)`,
      },
      {
        h: 'Telling the client',
        p: 'Return HTTP 429 Too Many Requests with headers so well-behaved clients know when to retry. Clients should back off exponentially with random jitter rather than retrying in a tight loop.',
        points: ['X-RateLimit-Limit: the allowed number', 'X-RateLimit-Remaining: what is left in this window', 'Retry-After: seconds until a retry can succeed'],
        code: `HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
Retry-After: 7

{ "error": "rate_limited", "message": "Try again in 7 seconds" }`,
      },
      {
        h: 'Production concerns',
        p: 'Things interviewers like to hear once the basic design is on the board.',
        points: [
          'Fail open: if Redis is down, allow traffic (log loudly) rather than taking the whole product down',
          'Multi-region: keep counters per region and accept small inaccuracy, or sync asynchronously',
          'Hard vs soft limits: soft limits allow a small overflow and send a warning',
          'Rejected requests can be queued for later (e.g. order processing) instead of dropped',
          'Monitor 429 rates: too many means your rules are too strict or you are under attack',
        ],
      },
    ],
    flow: ['Client request', 'API Gateway', 'Load rules (cached)', 'Redis: atomic check', 'Allowed → API servers', 'Denied → 429 + Retry-After'],
    tradeoffs: [
      { choice: 'Token bucket', pro: 'Simple, memory efficient, allows bursts', con: 'Two parameters to tune (bucket size, refill rate)' },
      { choice: 'Sliding log', pro: 'Exact', con: 'Stores every timestamp' },
      { choice: 'Fail open vs fail closed', pro: 'Fail open keeps the product working if Redis dies', con: 'Briefly no protection' },
    ],
    tips: ['Mention rules stored in config and cached on servers', 'Talk about limiting by user vs IP (NAT shares IPs)', 'Consider hard vs soft limits'],
    quiz: [
      { q: 'Which algorithm naturally allows short bursts?', options: ['Leaking bucket', 'Token bucket', 'Fixed window', 'None'], a: 1, why: 'Saved-up tokens can be spent at once, allowing a burst up to bucket size.' },
      { q: 'Which HTTP status means “rate limited”?', options: ['403', '404', '429', '503'], a: 2, why: '429 Too Many Requests.' },
    ],
  },
  {
    n: 5,
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    tagline: 'Spread data across servers so adding a node moves only a little data.',
    category: 'Building Blocks',
    level: 'Intermediate',
    summary:
      'With simple hash(key) % N, changing N remaps almost every key — a disaster for caches and databases. Consistent hashing places servers and keys on a ring; each key belongs to the next server clockwise. Adding or removing a server only moves the keys in one slice of the ring. Virtual nodes keep the load even.',
    requirements: { functional: ['Map keys to servers'], nonFunctional: ['Minimal data movement on resize', 'Even distribution'] },
    sections: [
      { h: 'The rehashing problem', p: 'If you have 4 servers and go to 5, hash % N changes for about 80% of keys. Caches go cold and databases get stampeded.', points: [] },
      { h: 'The hash ring', p: 'Hash servers (by name/IP) onto a ring of 0…2^32. Hash each key onto the same ring and walk clockwise to the first server.', points: ['Add a server → only keys between it and its predecessor move', 'Remove a server → its keys move to the next server'] },
      { h: 'Virtual nodes', p: 'With few servers, slices are uneven. Give each physical server 100–200 virtual points on the ring. More points = more even load, and powerful machines can get more points.', points: [] },
    ],
    flow: ['Key', 'hash(key)', 'Position on ring', 'Walk clockwise', 'First (virtual) node', 'Physical server'],
    tradeoffs: [{ choice: 'More virtual nodes', pro: 'Better balance', con: 'More metadata to store and look up' }],
    tips: ['Name real users: Dynamo, Cassandra, Discord, Akamai CDN', 'Explain with a drawing of a ring', 'Mention it also reduces hot spots when combined with replication on next N nodes'],
    quiz: [{ q: 'When adding a server in consistent hashing, which keys move?', options: ['All keys', 'About half', 'Only keys in the new server’s range', 'None'], a: 2, why: 'Only keys between the new node and the previous node are reassigned.' }],
  },
  {
    n: 6,
    slug: 'key-value-store',
    title: 'Design a Key-Value Store',
    tagline: 'A distributed put/get database like DynamoDB or Cassandra.',
    category: 'Building Blocks',
    level: 'Advanced',
    summary:
      'A key-value store supports put(key, value) and get(key). Making it distributed means choosing what to give up under network partitions (CAP), partitioning data with consistent hashing, replicating it, resolving conflicts, detecting failures and storing data efficiently on disk.',
    requirements: {
      functional: ['put(key, value)', 'get(key)'],
      nonFunctional: ['Small values (<10 KB)', 'Huge data size', 'High availability', 'Tunable consistency', 'Low latency'],
    },
    sections: [
      { h: 'CAP theorem', p: 'During a network partition you must choose Consistency (every read sees the latest write) or Availability (every request gets a response). Partition tolerance is not optional in real networks.', points: ['CP: banks, inventory — refuse requests rather than return stale data', 'AP: shopping cart, social feeds — always answer, reconcile later'] },
      { h: 'Partitioning & replication', p: 'Use consistent hashing to spread keys, then copy each key to the next N distinct servers on the ring (often N = 3), ideally in different data centers.', points: [] },
      { h: 'Quorum consensus', p: 'With N replicas, a write needs W acks and a read needs R responses. If W + R > N, reads overlap the latest write — strong consistency.', points: ['R = 1, W = N → fast reads', 'W = 1, R = N → fast writes', 'N = 3, W = R = 2 is a common balance'] },
      { h: 'Conflicts & failures', p: 'Vector clocks track versions so the system can detect concurrent writes. Gossip protocols spread heartbeat info so nodes detect failures. Sloppy quorum + hinted handoff keeps writes flowing during short outages; Merkle trees sync replicas after long ones.', points: [] },
      { h: 'Storage engine', p: 'Writes go to a commit log, then an in-memory table, which flushes to sorted files on disk (SSTables). Bloom filters skip files that don’t contain the key during reads.', points: [] },
    ],
    flow: ['Client', 'Coordinator node', 'Consistent hash ring', 'N replicas', 'Commit log → Memtable → SSTable'],
    tradeoffs: [
      { choice: 'Strong vs eventual consistency', pro: 'Strong is simpler for app developers', con: 'Higher latency, lower availability' },
      { choice: 'Vector clocks', pro: 'Detect conflicts precisely', con: 'Client must resolve; clocks grow over time' },
    ],
    tips: ['Draw a table: goal → technique (partitioning → consistent hashing, etc.)', 'Know W + R > N cold', 'Mention DynamoDB, Cassandra, Riak as references'],
    quiz: [
      { q: 'N = 3. Which W and R give strong consistency?', options: ['W=1, R=1', 'W=2, R=1', 'W=2, R=2', 'W=1, R=2'], a: 2, why: '2 + 2 = 4 > 3, so read and write sets always overlap.' },
      { q: 'What does a Bloom filter help with?', options: ['Compressing values', 'Quickly ruling out files that don’t contain a key', 'Sorting keys', 'Encrypting data'], a: 1, why: 'It answers “definitely not here” or “maybe here” cheaply.' },
    ],
  },
  {
    n: 7,
    slug: 'unique-id-generator',
    title: 'Design a Unique ID Generator',
    tagline: 'Create billions of unique, sortable IDs without a central database.',
    category: 'Building Blocks',
    level: 'Intermediate',
    summary:
      'Auto-increment doesn’t work across many database servers. Options include multi-master increments, UUIDs, a ticket server, or a Twitter Snowflake-style 64-bit ID made of a timestamp, data center ID, machine ID and sequence number. Snowflake gives unique, roughly time-ordered, numeric IDs at huge scale.',
    requirements: { functional: ['IDs are unique', 'Numeric, 64-bit', 'Roughly ordered by time'], nonFunctional: ['10,000+ IDs per second per node', 'No single point of failure'] },
    sections: [
      { h: 'Options compared', p: '', points: ['Multi-master: each DB increments by k (number of servers). Hard to scale and not time-ordered across servers.', 'UUID: 128-bit, no coordination. But too long, not numeric, not sortable.', 'Ticket server: one DB hands out IDs. Simple, but a single point of failure.', 'Snowflake: split 64 bits into fields. Fast, distributed and sortable.'] },
      { h: 'Snowflake layout (64 bits)', p: '', points: ['1 bit sign (always 0)', '41 bits timestamp in ms since a custom epoch (~69 years)', '5 bits data center ID (32 DCs)', '5 bits machine ID (32 machines per DC)', '12 bits sequence (4,096 IDs per ms per machine)'] },
      { h: 'Gotchas', p: 'Clock drift between machines can break ordering; use NTP. If the clock moves backwards, wait or refuse. Tune bits to your needs — fewer sequence bits if low concurrency, more timestamp bits for longer life.', points: [] },
    ],
    flow: ['Request ID', 'Read clock (ms)', 'Same ms? sequence++', 'Shift & OR fields', '64-bit ID'],
    tradeoffs: [{ choice: 'UUID vs Snowflake', pro: 'UUID needs zero config', con: 'Snowflake is shorter, numeric, sortable — better DB index performance' }],
    tips: ['Draw the bit layout', 'Mention clock synchronisation', 'MongoDB ObjectId and ULID are similar ideas'],
    quiz: [{ q: 'In Snowflake, what makes IDs sortable by time?', options: ['Sequence bits', 'Machine ID', 'Timestamp is in the highest bits', 'Random bits'], a: 2, why: 'Since the timestamp occupies the most significant bits, larger IDs are later.' }],
  },
  {
    n: 8,
    slug: 'url-shortener',
    title: 'Design a URL Shortener',
    tagline: 'Turn long links into short ones like bit.ly/abc123.',
    category: 'Classic Systems',
    level: 'Beginner',
    summary:
      'A URL shortener maps a long URL to a short code and redirects visitors. The core questions are how to generate short, unique codes (hash + collision check, or base-62 of a unique ID), which redirect status to use, and how to make reads — which vastly outnumber writes — very fast with caching.',
    requirements: {
      functional: ['Shorten a long URL', 'Redirect short → long', 'Optional custom alias and expiry'],
      nonFunctional: ['100M new URLs/day', 'Reads ≈ 10× writes', 'Short as possible', 'Highly available'],
    },
    sections: [
      { h: 'APIs', p: '', points: ['POST /api/v1/shorten { longUrl } → shortUrl', 'GET /{code} → 301/302 redirect'] },
      { h: '301 vs 302', p: '301 (permanent) lets browsers cache the redirect — less load on you. 302 (temporary) sends every click through your server — needed if you want click analytics.', points: [] },
      { h: 'How long is the code?', p: 'Using [0-9a-zA-Z] gives 62 characters. 62^7 ≈ 3.5 trillion, enough for 100M/day for decades. So 7 characters.', points: [] },
      { h: 'Generating codes', p: '', points: ['Hash + collision: take the first 7 chars of a hash (MD5/CRC32), check DB, re-hash on collision. Bloom filter speeds the check.', 'Base-62 conversion: get a unique numeric ID (e.g. Snowflake), convert to base 62. No collisions, but codes are predictable.'] },
      { h: 'Read path', p: 'Check cache (Redis) for code → longUrl. On miss, read DB, populate cache, redirect. Rate-limit the shorten endpoint to stop spam.', points: [] },
    ],
    flow: ['User clicks short link', 'Load Balancer', 'Web Server', 'Redis cache', 'DB (on miss)', '301/302 → long URL'],
    tradeoffs: [
      { choice: 'Hash + collision', pro: 'Fixed length, not guessable', con: 'Needs DB lookups to resolve collisions' },
      { choice: 'Base-62 of ID', pro: 'No collisions, simple', con: 'Sequential codes are guessable; needs an ID generator' },
    ],
    tips: ['Start with the math for code length — it impresses', 'Mention analytics → 302', 'Discuss DB choice: simple key-value lookups suit NoSQL'],
    quiz: [
      { q: 'Which redirect is better if you need click analytics?', options: ['301', '302', '404', '200'], a: 1, why: '302 is not cached by browsers, so every click hits your server.' },
      { q: 'How many unique codes does a 7-char base-62 string give?', options: ['~62 million', '~3.5 billion', '~3.5 trillion', '~62 trillion'], a: 2, why: '62^7 ≈ 3.52 × 10^12.' },
    ],
  },
  {
    n: 9,
    slug: 'web-crawler',
    title: 'Design a Web Crawler',
    tagline: 'Download billions of pages politely, without loops or duplicates.',
    category: 'Classic Systems',
    level: 'Intermediate',
    summary:
      'A crawler starts from seed URLs, downloads pages, extracts links and repeats. At scale it must parallelise, be polite (not hammer one site), prioritise important pages, avoid duplicate content and spider traps, and keep data fresh.',
    requirements: { functional: ['Crawl HTML pages', 'Store content for search indexing', 'Re-crawl for freshness'], nonFunctional: ['1B pages/month (~400 pages/s)', 'Polite', 'Robust to bad HTML and traps', 'Extensible to images/PDFs'] },
    sections: [
      { h: 'Core loop', p: 'Seed URLs → URL Frontier → HTML Downloader (with DNS resolver) → Content Parser → “Content seen?” → Link Extractor → URL Filter → “URL seen?” → back to the Frontier.', points: [] },
      { h: 'URL Frontier', p: 'A smart queue. Front queues order URLs by priority (PageRank, traffic). Back queues are one-per-host, each with one worker, so you never send parallel requests to the same site.', points: ['Politeness: delay between requests to the same host', 'Freshness: re-crawl important or frequently changing pages more often', 'Respect robots.txt (cache it)'] },
      { h: 'Deduplication', p: 'Compare page content by hash to skip duplicates (~30% of the web). Use a Bloom filter or hash table for “URL seen?”.', points: [] },
      { h: 'BFS not DFS', p: 'DFS can go infinitely deep on one site. BFS with priority and per-host queues keeps the crawl broad and polite.', points: [] },
      { h: 'Robustness', p: 'Use timeouts, consistent hashing to spread work across downloaders, save crawl state to resume after crashes, and set max URL length / depth to escape spider traps.', points: [] },
    ],
    flow: ['Seed URLs', 'URL Frontier', 'DNS Resolver', 'Downloader', 'Parser', 'Content seen?', 'Link Extractor', 'URL seen?', 'Frontier'],
    tradeoffs: [{ choice: 'Bloom filter for URL seen', pro: 'Tiny memory', con: 'Small false-positive rate means a few pages skipped' }],
    tips: ['Explain politeness clearly — it’s the classic deep-dive', 'Mention server-side rendering for JS-heavy pages', 'Talk about geo-distributed crawlers'],
    quiz: [{ q: 'Why does the frontier keep one queue per host?', options: ['To save memory', 'To guarantee politeness — one request at a time per site', 'To sort alphabetically', 'To avoid DNS'], a: 1, why: 'Mapping each host to one queue/worker prevents flooding a single server.' }],
  },
  {
    n: 10,
    slug: 'notification-system',
    title: 'Design a Notification System',
    tagline: 'Send push, SMS and email reliably to millions of devices.',
    category: 'Classic Systems',
    level: 'Intermediate',
    summary:
      'A notification system accepts events from services and delivers them via third-party providers: APNs for iOS, FCM for Android, Twilio for SMS, SendGrid/SES for email. Queues per channel isolate failures, workers retry, and a log prevents duplicates. Respect user settings and rate limits.',
    requirements: { functional: ['Push, SMS, email', 'Soft real-time', 'User opt-out', 'Templates'], nonFunctional: ['10M push, 1M SMS, 5M email per day', 'No lost notifications', 'Scales independently per channel'] },
    sections: [
      { h: 'Contact info', p: 'Store device tokens, phone numbers and emails per user (one user → many devices).', points: [] },
      { h: 'High-level flow', p: 'Services call the Notification Server API. It validates, checks user settings and rate limits, fetches templates, then puts a message on a per-channel queue. Workers pull and call the third-party provider.', points: ['Separate queues mean an SMS outage doesn’t block push', 'Workers scale horizontally'] },
      { h: 'Reliability', p: 'Persist notifications in a log/DB before sending. On failure, re-queue with exponential backoff. Exactly-once is impossible end-to-end, so dedupe with an event ID.', points: [] },
      { h: 'Extras', p: '', points: ['Templates keep formatting consistent', 'Track sent, delivered, opened, clicked', 'Rate-limit per user so you don’t spam', 'Authenticate callers (appKey/appSecret)'] },
    ],
    flow: ['Service A/B/C', 'Notification Servers', 'Cache + DB (users, devices, settings)', 'Queues: iOS / Android / SMS / Email', 'Workers', 'APNs / FCM / Twilio / SendGrid', 'Device'],
    tradeoffs: [{ choice: 'Queue per channel', pro: 'Isolation and independent scaling', con: 'More infra to operate' }],
    tips: ['Name the third-party providers', 'Talk about retries + idempotency', 'Mention analytics events for opens/clicks'],
    quiz: [{ q: 'Why use a separate queue for each notification type?', options: ['Cheaper storage', 'A failure in one provider won’t block others', 'Faster templates', 'Required by APNs'], a: 1, why: 'Decoupling isolates outages and lets each channel scale on its own.' }],
  },
  {
    n: 11,
    slug: 'news-feed-system',
    title: 'Design a News Feed System',
    tagline: 'Show each user a fresh feed of posts from people they follow.',
    category: 'Classic Systems',
    level: 'Intermediate',
    summary:
      'A news feed has two flows: publishing a post and building/reading a feed. The key decision is fan-out on write (push the post into followers’ feed caches immediately) versus fan-out on read (pull at read time). Real systems use a hybrid: push for normal users, pull for celebrities with millions of followers.',
    requirements: { functional: ['Publish post', 'See friends’ posts, newest first', 'Text, images, video'], nonFunctional: ['10M DAU', 'Up to 5,000 friends', 'Feed loads fast'] },
    sections: [
      { h: 'APIs', p: '', points: ['POST /v1/me/feed { content, auth }', 'GET /v1/me/feed'] },
      { h: 'Fan-out on write (push)', p: 'When a user posts, write the post ID into every friend’s feed cache. Reading is instant.', points: ['Pro: fast reads, real-time', 'Con: hotkey problem — a celebrity post means millions of writes; wasted work for inactive users'] },
      { h: 'Fan-out on read (pull)', p: 'Build the feed when the user opens it, by fetching recent posts from everyone they follow.', points: ['Pro: no wasted writes, good for celebrities', 'Con: slow reads'] },
      { h: 'Hybrid', p: 'Push for most users; for celebrities, let followers pull their posts at read time and merge.', points: [] },
      { h: 'Caching layers', p: 'Feed cache (post IDs), content cache (posts), social graph cache, action cache (likes/replies), counters cache. Store only IDs in feeds to save memory.', points: [] },
    ],
    flow: ['User posts', 'Post Service → Post DB/Cache', 'Fan-out Service', 'Graph DB (friends)', 'Message Queue', 'Fan-out Workers', 'News Feed Cache', 'Reader: Feed Service hydrates IDs → posts + users'],
    tradeoffs: [
      { choice: 'Push', pro: 'Fast reads', con: 'Expensive for celebrities' },
      { choice: 'Pull', pro: 'Cheap writes', con: 'Slow, heavy reads' },
    ],
    tips: ['Always bring up the celebrity / hotkey problem', 'Store IDs, not full posts, in the feed cache', 'Discuss ranking as a future improvement'],
    quiz: [{ q: 'Why is fan-out on write a problem for celebrities?', options: ['Their posts are bigger', 'One post triggers millions of cache writes', 'They post more often', 'Followers are offline'], a: 1, why: 'Pushing to millions of followers creates a huge write burst.' }],
  },
  {
    n: 12,
    slug: 'chat-system',
    title: 'Design a Chat System',
    tagline: 'Real-time 1:1 and group messaging like WhatsApp or Slack.',
    category: 'Classic Systems',
    level: 'Advanced',
    summary:
      'Chat needs servers to push messages to clients instantly, so it uses persistent connections — WebSockets — rather than plain request/response. Stateless services handle login and profiles; stateful chat servers hold connections. Messages go into a key-value store with per-channel ordered IDs, and a presence service tracks who is online.',
    requirements: { functional: ['1:1 and small group chat (≤100)', 'Online presence', 'Multi-device', 'Push notifications when offline'], nonFunctional: ['50M DAU', 'Low latency', 'Store history forever'] },
    sections: [
      { h: 'Getting messages to the client', p: '', points: ['Polling: client asks repeatedly — wasteful', 'Long polling: server holds request until data — better, but still awkward', 'WebSocket: one bi-directional connection — the standard choice'] },
      { h: 'Components', p: 'Stateless API servers (login, signup, profile) behind a load balancer. Stateful chat servers hold WebSockets. Service discovery (e.g. Zookeeper) picks the best chat server for a user. Presence servers track online status. Notification servers handle offline users.', points: [] },
      { h: 'Storage', p: 'Chat history is huge, mostly recent reads, and access is by key — a key-value store (HBase, Cassandra) fits. Message IDs must be ordered within a channel: use a per-channel sequence or a local Snowflake-style generator.', points: [] },
      { h: 'Message flow (1:1)', p: 'User A → chat server 1 → ID generator → message sync queue → stored in KV → if B online, chat server 2 pushes over WebSocket; else push notification.', points: [] },
      { h: 'Presence', p: 'Clients send heartbeats every few seconds. If none for ~30 s, mark offline. Fan out status changes via pub/sub — only feasible for small friend groups.', points: [] },
    ],
    flow: ['Sender', 'WebSocket → Chat Server', 'ID Generator', 'Message Queue', 'KV Store', 'Receiver’s Chat Server → WebSocket', 'or Push Notification'],
    tradeoffs: [{ choice: 'WebSocket', pro: 'Real-time both ways, efficient', con: 'Stateful servers are harder to scale and deploy' }],
    tips: ['Explain why WebSocket over HTTP polling', 'Handle multi-device with a cur_max_message_id per device', 'Mention end-to-end encryption as an extension'],
    quiz: [{ q: 'Why use heartbeats for presence?', options: ['To encrypt messages', 'To avoid flickering status on short network drops', 'To sync history', 'To pick a chat server'], a: 1, why: 'A timeout on missing heartbeats tolerates brief disconnects.' }],
  },
  {
    n: 13,
    slug: 'search-autocomplete',
    title: 'Design Search Autocomplete',
    tagline: 'Suggest the top 5 queries as the user types — in under 100 ms.',
    category: 'Classic Systems',
    level: 'Intermediate',
    summary:
      'Autocomplete returns the most popular queries matching a prefix. It has two parts: a data gathering service that aggregates query logs offline (weekly/daily) and a query service that serves suggestions from a trie cached in memory, where each node already stores its top-k results.',
    requirements: { functional: ['Top 5 suggestions by popularity', 'Prefix match only'], nonFunctional: ['< 100 ms', 'Relevant, sorted', '10M DAU → ~24,000 QPS'] },
    sections: [
      { h: 'Trie data structure', p: 'A tree where each node is a character and paths spell prefixes. Naively you’d search the whole subtree for top results — too slow.', points: ['Optimisation 1: limit prefix length (e.g. 50 chars)', 'Optimisation 2: cache top-k queries at every node → O(1) lookup'] },
      { h: 'Data gathering', p: 'Analytics logs → aggregators (weekly) → workers build a new trie → Trie DB → Trie cache. Real-time rebuilds are too costly for most products.', points: [] },
      { h: 'Query service', p: 'Request → load balancer → API server → trie cache (Redis or in-memory). Browser caching of results (Cache-Control) and AJAX requests help too.', points: [] },
      { h: 'Scaling & filtering', p: 'Shard the trie by first character(s), balanced using historical data. Add a filter layer to remove hateful or unsafe suggestions.', points: [] },
    ],
    flow: ['Keystroke', 'Browser cache', 'Load Balancer', 'API Servers', 'Trie Cache', '(offline) Logs → Aggregator → Workers → Trie DB'],
    tradeoffs: [{ choice: 'Weekly vs real-time trie updates', pro: 'Weekly is cheap and stable', con: 'Trending topics show up late' }],
    tips: ['Draw the trie with top-k cached at nodes', 'Separate offline and online paths', 'Mention debouncing keystrokes on the client'],
    quiz: [{ q: 'What makes trie lookup O(1) in practice?', options: ['Hashing the whole query', 'Caching top-k results at each node', 'Using SQL LIKE', 'Sorting on every request'], a: 1, why: 'Precomputed top-k at nodes avoids walking the subtree.' }],
  },
  {
    n: 14,
    slug: 'youtube',
    title: 'Design YouTube',
    tagline: 'Upload, transcode and stream video to millions worldwide.',
    category: 'Classic Systems',
    level: 'Advanced',
    summary:
      'A video platform has two main flows: upload (store the original, transcode into many resolutions and formats, then push to a CDN) and streaming (adaptive bitrate from the nearest CDN edge). Transcoding is modelled as a DAG of tasks run by workers. CDN cost dominates, so serve only popular videos from CDN and the long tail from your own servers.',
    requirements: { functional: ['Upload videos fast', 'Smooth streaming', 'Change quality', 'Web, mobile, TV'], nonFunctional: ['5M DAU', 'Low infrastructure cost', 'High availability', 'Max 1 GB video'] },
    sections: [
      { h: 'Upload flow', p: 'Get a pre-signed URL, upload directly to blob storage (S3), triggering transcoding. Metadata (title, owner, status) goes to a DB + cache in parallel.', points: ['Split large files into chunks for resumable uploads', 'Upload centers close to users'] },
      { h: 'Transcoding', p: 'Convert to multiple bitrates/formats (H.264, VP9; 360p–4K). Model as a DAG: split into video, audio, metadata → encode, thumbnail, watermark → merge. A preprocessor builds the DAG, a scheduler assigns tasks to workers via queues.', points: [] },
      { h: 'Streaming', p: 'Adaptive protocols like HLS and MPEG-DASH serve small segments; the player switches quality based on bandwidth.', points: [] },
      { h: 'Cost & safety', p: '', points: ['Serve popular videos via CDN, long-tail from origin', 'Encode unpopular videos on demand', 'DRM, AES encryption, watermarking for copyright', 'Retry failed tasks; keep originals'] },
    ],
    flow: ['Creator', 'Pre-signed URL → Blob Storage (original)', 'Transcoding DAG workers', 'Transcoded storage', 'CDN', 'Viewer (HLS/DASH)'],
    tradeoffs: [{ choice: 'Everything on CDN', pro: 'Best latency', con: 'Very expensive for rarely watched videos' }],
    tips: ['Do the CDN cost estimate — it drives the design', 'Explain the DAG model', 'Mention pre-signed URLs for security'],
    quiz: [{ q: 'What do HLS and DASH enable?', options: ['Uploading', 'Adaptive bitrate streaming', 'Encryption only', 'Thumbnail generation'], a: 1, why: 'They split video into segments so the player can change quality on the fly.' }],
  },
]
