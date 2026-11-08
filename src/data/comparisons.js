// "X vs Y" comparison pages. Original explanations for ScaleNotes.
// Each: slug, title, tagline, options[], tldr, rows[[aspect, ...one value per option]],
//       pick[{ option, when[] }], code?{ title, lang, src }, mistakes[], related[] (chapter slugs)

export const comparisons = [
  {
    slug: 'sql-vs-nosql',
    title: 'SQL vs NoSQL',
    tagline: 'Postgres or MongoDB? The question every backend developer gets asked.',
    options: ['SQL (Postgres, MySQL)', 'NoSQL (MongoDB, DynamoDB, Cassandra)'],
    tldr: 'Choose SQL when your data is relational and correctness matters (orders, payments, inventory). Choose NoSQL when you need flexible documents, huge write volume or simple key lookups at massive scale. Most real systems use both.',
    rows: [
      ['Data model', 'Tables with fixed columns and relations', 'Documents, key-value, wide-column or graph'],
      ['Schema', 'Defined up front; migrations to change', 'Flexible; each document can differ'],
      ['Joins', '✅ Powerful JOINs', '⚠️ Limited; you embed or denormalize'],
      ['Transactions', '✅ Full ACID across tables', 'Single-document by default; multi-doc is slower'],
      ['Scaling', 'Vertical first; sharding is hard work', 'Built to shard horizontally'],
      ['Query language', 'Standard SQL', 'Different API per database'],
      ['Best for', 'Banking, e-commerce orders, ERPs', 'Catalogs, feeds, logs, IoT, sessions'],
    ],
    pick: [
      { option: 'SQL', when: ['Money moves (payments, wallets, ledgers)', 'You need reports with JOINs and GROUP BY', 'Data has clear relations: users → orders → items', 'Strong consistency is a must'] },
      { option: 'NoSQL', when: ['Schema changes often (early-stage product)', 'You read a whole object at once (a profile, a product page)', 'Write-heavy at huge scale (chat messages, events)', 'Simple lookups by key'] },
    ],
    code: {
      title: 'Same data, two shapes',
      lang: 'sql / js',
      src: `-- SQL: normalized, joined at read time
SELECT o.id, o.total, i.product_name, i.qty
FROM orders o JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = 42;

// MongoDB: embedded, read in one go
db.orders.find({ userId: 42 })
// { _id, total: 1499, items: [{ productName: 'Keyboard', qty: 1 }] }`,
    },
    mistakes: ['Picking MongoDB "because it scales" for a 10k-user app: Postgres handles that easily', 'Storing money in a store without transactions', 'Embedding unbounded arrays (all comments inside a post) until the 16 MB document limit hits'],
    related: ['scaling-zero-to-millions', 'key-value-store', 'payment-system'],
  },
  {
    slug: 'kafka-vs-rabbitmq',
    title: 'Kafka vs RabbitMQ',
    tagline: 'A replayable event log or a smart message broker?',
    options: ['Kafka', 'RabbitMQ'],
    tldr: 'Kafka is a distributed, append-only log: messages are kept for days and many consumer groups can replay them, so it suits event streaming and analytics at very high throughput. RabbitMQ is a traditional broker: it routes messages to queues and deletes them once acknowledged, so it suits task queues and flexible routing.',
    rows: [
      ['Model', 'Partitioned log; consumers track an offset', 'Queues; broker pushes and deletes on ack'],
      ['Retention', 'Keeps messages (days/forever); replay anytime', 'Gone after ack'],
      ['Throughput', 'Millions of msgs/sec', 'Tens of thousands/sec per node'],
      ['Ordering', 'Per partition', 'Per queue (lost with competing consumers)'],
      ['Routing', 'By topic + key only', '✅ Exchanges: direct, topic, fanout, headers'],
      ['Per-message features', 'Few', '✅ Priorities, TTL, delayed retries, DLQ'],
      ['Ops effort', 'Heavier (brokers, partitions)', 'Lighter to run'],
    ],
    pick: [
      { option: 'Kafka', when: ['Event streaming: clicks, logs, metrics', 'Several teams consume the same events independently', 'You need to replay history (rebuild a cache, backfill)', 'Very high volume'] },
      { option: 'RabbitMQ', when: ['Background jobs: emails, PDFs, image resize', 'Complex routing rules', 'Per-message priority, delays and retries', 'Smaller team, simpler ops'] },
    ],
    code: {
      title: 'Publishing one event',
      lang: 'node.js',
      src: `// Kafka (kafkajs)
await producer.send({ topic: 'orders', messages: [{ key: 'user-42', value: JSON.stringify(order) }] })

// RabbitMQ (amqplib)
channel.assertQueue('emails', { durable: true })
channel.sendToQueue('emails', Buffer.from(JSON.stringify(order)), { persistent: true })`,
    },
    mistakes: ['Using Kafka as a simple job queue for 100 jobs/minute', 'Expecting global ordering in Kafka across partitions', 'Not making consumers idempotent (both deliver at least once)'],
    related: ['distributed-message-queue', 'notification-system'],
  },
  {
    slug: 'rest-vs-graphql-vs-grpc',
    title: 'REST vs GraphQL vs gRPC',
    tagline: 'Three ways for clients and services to talk.',
    options: ['REST', 'GraphQL', 'gRPC'],
    tldr: 'REST is the simple, cacheable default for public APIs. GraphQL lets clients ask for exactly the fields they need in one round trip, which is great for complex frontends. gRPC is fast binary RPC over HTTP/2, ideal for service-to-service calls inside your backend.',
    rows: [
      ['Style', 'Resources + HTTP verbs', 'One endpoint, query language', 'Remote function calls'],
      ['Format', 'JSON', 'JSON', 'Protobuf (binary)'],
      ['Over/under-fetching', 'Common', '✅ Solved: ask for exact fields', 'Defined by the message type'],
      ['HTTP caching', '✅ Easy (GET + CDN)', '⚠️ Hard (mostly POST)', '❌ Not by default'],
      ['Streaming', 'SSE / WebSocket add-ons', 'Subscriptions', '✅ Built-in bidirectional'],
      ['Browser support', '✅ Native', '✅ Native', '⚠️ Needs gRPC-Web proxy'],
      ['Typical use', 'Public APIs, CRUD', 'Mobile/web apps with many screens', 'Microservice ↔ microservice'],
    ],
    pick: [
      { option: 'REST', when: ['Public API for third parties', 'Simple CRUD', 'You want CDN caching'] },
      { option: 'GraphQL', when: ['Many screens needing different shapes of data', 'Mobile apps on slow networks', 'One API over several backend services'] },
      { option: 'gRPC', when: ['Internal service calls with low latency', 'Strict typed contracts between teams', 'Streaming between services'] },
    ],
    code: {
      title: 'Fetching a user and their last 3 orders',
      lang: 'http / graphql / proto',
      src: `# REST: two round trips
GET /users/42
GET /users/42/orders?limit=3

# GraphQL: one round trip, exact fields
query { user(id: 42) { name orders(last: 3) { id total } } }

// gRPC: typed contract
service UserService { rpc GetUser (GetUserReq) returns (User); }`,
    },
    mistakes: ['GraphQL N+1 queries: use DataLoader to batch', 'Exposing gRPC directly to browsers', 'REST endpoints named as verbs (/getUser) instead of resources (/users/:id)'],
    related: ['system-design-framework', 'scaling-zero-to-millions'],
  },
  {
    slug: 'websocket-vs-sse-vs-polling',
    title: 'WebSocket vs SSE vs Long polling',
    tagline: 'How to push real-time updates to the browser.',
    options: ['WebSocket', 'Server-Sent Events', 'Long polling'],
    tldr: 'Use WebSockets when both sides talk constantly (chat, multiplayer, collaborative editing). Use Server-Sent Events when only the server pushes (notifications, live scores, AI token streaming); they are plain HTTP and reconnect automatically. Use long polling only as a fallback.',
    rows: [
      ['Direction', '✅ Two-way', 'Server → client only', 'Server → client (via repeated requests)'],
      ['Protocol', 'Upgrade to ws:// over TCP', 'Plain HTTP stream', 'Plain HTTP'],
      ['Auto-reconnect', 'You build it', '✅ Built in (with Last-Event-ID)', 'Natural (new request)'],
      ['Overhead', 'Very low per message', 'Low', 'High (headers every time)'],
      ['Proxies / firewalls', 'Sometimes blocked', '✅ Works everywhere HTTP works', '✅ Works everywhere'],
      ['Scaling', 'Stateful connections; needs pub/sub', 'Stateful connections; simpler', 'Stateless but chatty'],
      ['Used for', 'Chat, games, Figma-style editing', 'Notifications, dashboards, ChatGPT-style streaming', 'Legacy fallback'],
    ],
    pick: [
      { option: 'WebSocket', when: ['Client sends frequent messages too', 'Sub-100 ms latency both ways', 'Binary data'] },
      { option: 'SSE', when: ['Only the server pushes', 'You want simple HTTP infra and auto-reconnect', 'Streaming LLM responses'] },
      { option: 'Long polling', when: ['Very old clients or networks that block both above'] },
    ],
    code: {
      title: 'SSE in Express in 10 lines',
      lang: 'node.js',
      src: `app.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  res.flushHeaders()
  const timer = setInterval(() => res.write('data: ' + JSON.stringify({ time: Date.now() }) + '\\n\\n'), 1000)
  req.on('close', () => clearInterval(timer))
})

// browser
const es = new EventSource('/events')
es.onmessage = (e) => console.log(JSON.parse(e.data))`,
    },
    mistakes: ['Using WebSockets for one-way notifications (SSE is simpler)', 'Forgetting a pub/sub layer when running more than one server', 'No heartbeat, so dead connections pile up'],
    related: ['chat-system', 'nearby-friends', 'notification-system'],
  },
  {
    slug: 'redis-vs-memcached',
    title: 'Redis vs Memcached',
    tagline: 'Two in-memory caches; one does a lot more.',
    options: ['Redis', 'Memcached'],
    tldr: 'Memcached is a simple, multi-threaded string cache. Redis is an in-memory data-structure server: lists, sets, sorted sets, streams, pub/sub, Lua scripts and optional persistence. For almost every new project, Redis is the default.',
    rows: [
      ['Data types', '✅ Strings, lists, sets, hashes, sorted sets, streams', 'Strings only'],
      ['Persistence', 'Optional (RDB snapshots, AOF log)', 'None'],
      ['Replication / HA', '✅ Replicas, Sentinel, Cluster', 'Client-side sharding only'],
      ['Threads', 'Mostly single-threaded commands', 'Multi-threaded'],
      ['Extras', 'Pub/sub, Lua, TTL per key, geo, rate limiting', 'Just get/set/delete'],
      ['Use cases', 'Cache, sessions, leaderboards, queues, locks', 'Pure cache for big simple blobs'],
    ],
    pick: [
      { option: 'Redis', when: ['You need more than get/set (leaderboards, rate limits, queues)', 'You want replication and failover', 'Data should survive a restart'] },
      { option: 'Memcached', when: ['Very simple cache of large values', 'You want multi-core throughput on one node with zero features'] },
    ],
    code: {
      title: 'Leaderboard: only Redis can do this natively',
      lang: 'redis',
      src: `ZINCRBY leaderboard 50 "yasowant"     # add points
ZREVRANGE leaderboard 0 9 WITHSCORES   # top 10
ZREVRANK leaderboard "yasowant"        # my rank`,
    },
    mistakes: ['Using Redis as the only copy of important data without persistence', 'Running KEYS * in production (blocks the server): use SCAN', 'No TTLs, so memory fills up'],
    related: ['gaming-leaderboard', 'rate-limiter', 'scaling-zero-to-millions'],
  },
  {
    slug: 'monolith-vs-microservices',
    title: 'Monolith vs Microservices',
    tagline: 'One deployable app or many small services?',
    options: ['Monolith', 'Microservices'],
    tldr: 'Start with a well-structured monolith: it is faster to build, test and deploy with a small team. Move parts to microservices when teams step on each other, or when one part needs to scale or deploy independently. Microservices trade code complexity for operational complexity.',
    rows: [
      ['Deploy', 'One unit', 'Each service on its own'],
      ['Team size sweet spot', '1–20 developers', 'Many teams, each owning services'],
      ['Calls between parts', 'Function calls (fast, reliable)', 'Network calls (slow, can fail)'],
      ['Data', 'One database, easy transactions', 'Database per service; sagas for transactions'],
      ['Scaling', 'Scale the whole app', '✅ Scale only the hot service'],
      ['Debugging', 'One stack trace', 'Distributed tracing needed'],
      ['Ops cost', 'Low', 'High: CI/CD per service, service discovery, monitoring'],
    ],
    pick: [
      { option: 'Monolith', when: ['New product or startup', 'Small team', 'Requirements still changing'] },
      { option: 'Microservices', when: ['Clear domain boundaries (payments, search, notifications)', 'Independent teams that need to ship separately', 'One component has very different scaling needs'] },
    ],
    mistakes: ['Splitting into 20 services on day one (a "distributed monolith")', 'Services sharing one database', 'No timeouts, retries or circuit breakers between services'],
    related: ['scaling-zero-to-millions', 'payment-system'],
  },
]

export const bySlugCompare = (slug) => comparisons.find((c) => c.slug === slug)
