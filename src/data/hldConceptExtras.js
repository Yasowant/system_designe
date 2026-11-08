// Extra detail for each HLD concept page, keyed by the concept term.
// analogy: real-life comparison · more: deeper explanation · points: key facts
// chapters: chapter slugs where it shows up · compare: X vs Y page slug

export const hldExtras = {
  'CAP Theorem': {
    analogy: 'Two bank branches lose their phone line. Either both stop accepting withdrawals until the line is back (consistent), or both keep serving customers and risk the balance going wrong (available).',
    more: 'Partitions (network splits) are not optional in real networks, so CAP really asks: when the network breaks, do you refuse requests or risk stale answers? When the network is healthy you can have both.',
    points: ['CP: refuse or error during a split, never return wrong data', 'AP: always answer, fix differences later (eventual consistency)', 'Different parts of one app can choose differently'],
    chapters: ['key-value-store', 'digital-wallet', 'hotel-reservation'],
  },
  PACELC: {
    analogy: 'Even on a normal day, checking with every branch before answering is slower than answering from your own notebook.',
    more: 'CAP only talks about failures. PACELC adds the everyday trade-off: with no partition (Else), you still pick between low Latency and strong Consistency, because syncing replicas takes time.',
    points: ['PA/EL: fast and eventually consistent (Cassandra, DynamoDB default)', 'PC/EC: always consistent, slower (Spanner, traditional SQL clusters)'],
    chapters: ['key-value-store'],
  },
  'Consistency Models': {
    analogy: 'Strong consistency is a live cricket score. Eventual consistency is the newspaper: correct, just a little late.',
    more: 'Between "always latest" and "eventually correct" sit useful guarantees. Read-your-writes means you always see your own changes; monotonic reads means you never go back in time; causal means replies never appear before the message they answer.',
    points: ['Strong: simplest to reason about, highest latency', 'Eventual: fastest, needs UI that tolerates delay', 'Read-your-writes: route a user’s reads to the primary right after they write'],
    chapters: ['key-value-store', 'news-feed-system', 'chat-system'],
  },
  'Consensus (Raft / Paxos)': {
    analogy: 'A committee elects a chairperson. Every decision is written in the minutes only after a majority agrees, so losing one member never loses a decision.',
    more: 'Raft elects one leader. Clients send writes to the leader, which appends them to its log and replicates to followers. An entry is committed once a majority has it. If the leader dies, the others hold an election.',
    points: ['Needs a majority: 3 nodes tolerate 1 failure, 5 tolerate 2', 'Used for metadata and coordination, not bulk data', 'Examples: etcd (Kubernetes), Consul, Kafka KRaft, CockroachDB'],
    chapters: ['digital-wallet', 'distributed-message-queue', 'stock-exchange'],
  },
  Idempotency: {
    analogy: 'Pressing the lift button five times still calls the lift once.',
    more: 'Networks fail after the server has done the work but before the client hears back, so clients retry. Without idempotency, a retry charges the card twice. The client sends a unique key; the server stores the result for that key and returns it on repeats.',
    points: ['GET, PUT and DELETE should be idempotent; POST usually is not', 'Store the idempotency key with a unique index and the response', 'Message consumers must be idempotent because queues deliver at least once'],
    code: `app.post('/payments', async (req, res) => {
  const key = req.get('Idempotency-Key')
  const prior = await Payment.findOne({ idempotencyKey: key })
  if (prior) return res.json(prior)                 // retry -> same answer
  const p = await Payment.create({ idempotencyKey: key, ...req.body }) // unique index on key
  res.status(201).json(p)
})`,
    chapters: ['payment-system', 'digital-wallet', 'notification-system'],
  },
  'Load Balancer (L4 vs L7)': {
    analogy: 'L4 is a traffic cop who only looks at the car’s number plate. L7 opens the envelope and reads the letter before deciding where it goes.',
    more: 'L4 balancers forward TCP/UDP packets by IP and port: extremely fast, no idea what is inside. L7 balancers terminate HTTP, so they can route /api to one service and /images to another, add headers, and do TLS.',
    points: ['Algorithms: round robin, least connections, IP hash, weighted', 'Health checks remove dead servers', 'Run two balancers (active/passive) so the balancer is not a single point of failure'],
    chapters: ['scaling-zero-to-millions', 'url-shortener'],
  },
  'Reverse Proxy & API Gateway': {
    analogy: 'A hotel reception desk: guests never walk into the kitchen; reception checks who you are and routes your request.',
    more: 'A reverse proxy sits in front of your servers and hides them. An API gateway is a reverse proxy with API features: auth, rate limiting, request transformation, routing to many microservices and aggregating responses.',
    points: ['Handles TLS termination, compression and caching', 'Central place for auth and rate limits', 'Examples: Nginx, Envoy, Kong, AWS API Gateway'],
    chapters: ['rate-limiter', 'hotel-reservation'],
  },
  CDN: {
    analogy: 'Instead of every customer driving to the factory, products are stocked in local shops near them.',
    more: 'A CDN caches content at edge locations close to users. The first request goes to your origin; later ones are served from the edge. Push CDNs receive files you upload; pull CDNs fetch from your origin on the first miss.',
    points: ['Huge latency win for global users', 'Version file names so you can cache for a year', 'Can also cache API responses and block DDoS attacks'],
    chapters: ['scaling-zero-to-millions', 'youtube', 'google-maps'],
  },
  DNS: {
    analogy: 'The phone contacts app: you tap a name, it dials the number.',
    more: 'The browser asks a resolver, which walks root → .info servers → your domain’s name server to get the IP, caching the answer for the TTL. A records map to IPv4, AAAA to IPv6, CNAME to another name.',
    points: ['Low TTL = faster failover but more lookups', 'GeoDNS returns the nearest data center', 'DNS is often the first step in every system design flow'],
    chapters: ['scaling-zero-to-millions', 'web-crawler'],
  },
  'HTTP/1.1 vs HTTP/2 vs HTTP/3': {
    analogy: 'HTTP/1.1 is a single-lane road; HTTP/2 adds many lanes on the same road; HTTP/3 replaces the road with one where a crash in one lane does not stop the others.',
    more: 'HTTP/1.1 sends one request at a time per connection, so browsers open 6 connections. HTTP/2 multiplexes many streams on one TCP connection with header compression. But one lost TCP packet stalls all streams; HTTP/3 uses QUIC over UDP to fix that.',
    points: ['HTTP/2 makes asset bundling less critical', 'HTTP/3 helps most on lossy mobile networks', 'All modern CDNs support HTTP/2 and HTTP/3'],
    chapters: ['scaling-zero-to-millions'],
  },
  'REST vs GraphQL vs gRPC': {
    analogy: 'REST is a set menu, GraphQL is ordering à la carte, gRPC is the kitchen’s internal order slips.',
    more: 'See the full comparison page for a side-by-side table, when to pick each, and code.',
    points: ['REST: public APIs and CRUD', 'GraphQL: complex frontends', 'gRPC: service-to-service'],
    compare: 'rest-vs-graphql-vs-grpc',
    chapters: ['system-design-framework'],
  },
  'WebSocket / SSE / Long Polling': {
    analogy: 'Long polling: you keep calling to ask “any news?”. SSE: they call you whenever there is news. WebSocket: an open phone line both ways.',
    more: 'See the comparison page for code and a decision table.',
    points: ['Chat and games → WebSocket', 'Notifications and AI streaming → SSE', 'Fallback → long polling'],
    compare: 'websocket-vs-sse-vs-polling',
    chapters: ['chat-system', 'nearby-friends'],
  },
  Pagination: {
    analogy: 'Offset is “skip the first 10,000 pages, then read 20”. Cursor is a bookmark: “continue from here”.',
    more: 'OFFSET 100000 makes the database read and throw away 100k rows, so deep pages get slow, and new inserts shift results so users see duplicates. Cursor pagination filters on an indexed column (WHERE id < lastSeenId) so every page is equally fast and stable.',
    points: ['Return nextCursor in the response, not page numbers', 'Use a unique, indexed sort key (id or createdAt + id)', 'Offset is fine for small admin tables'],
    code: `// cursor pagination with MongoDB
const posts = await Post.find(cursor ? { _id: { $lt: cursor } } : {})
  .sort({ _id: -1 }).limit(21)
const hasMore = posts.length > 20
res.json({ items: posts.slice(0, 20), nextCursor: hasMore ? posts[19]._id : null })`,
    chapters: ['news-feed-system', 'chat-system'],
  },
  'SQL vs NoSQL': {
    analogy: 'SQL is a well-organised filing cabinet with labelled folders that reference each other. NoSQL is a set of self-contained boxes, each holding everything about one thing.',
    more: 'See the comparison page for a detailed table, when to choose each, and code in both styles.',
    points: ['Relations + transactions → SQL', 'Flexible documents + huge scale → NoSQL', 'Most big systems use both'],
    compare: 'sql-vs-nosql',
    chapters: ['scaling-zero-to-millions', 'key-value-store'],
  },
  ACID: {
    analogy: 'A bank transfer: money leaves A and reaches B together, or not at all, even if the power goes out halfway.',
    more: 'Atomicity: all or nothing. Consistency: rules (constraints) always hold. Isolation: concurrent transactions don’t see each other’s half-done work. Durability: once committed, it survives crashes (written to a log on disk).',
    points: ['Needed for money, inventory and bookings', 'Postgres, MySQL; MongoDB supports multi-document transactions', 'Across microservices, use sagas instead of one big transaction'],
    code: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;  -- both happen, or neither`,
    chapters: ['payment-system', 'hotel-reservation', 'digital-wallet'],
  },
  'Isolation Levels': {
    analogy: 'How much of other people’s unfinished paperwork you are allowed to peek at while doing yours.',
    more: 'Read committed: you never see uncommitted data. Repeatable read: rows you read don’t change under you. Serializable: transactions behave as if run one by one. Stronger levels prevent more anomalies (dirty reads, lost updates, phantoms) but reduce concurrency.',
    points: ['Postgres default: read committed', 'Double booking is a lost-update/phantom problem: use SELECT … FOR UPDATE or serializable', 'Optimistic locking with a version column is a common alternative'],
    chapters: ['hotel-reservation', 'digital-wallet'],
  },
  'Indexes (B-Tree vs LSM)': {
    analogy: 'A book index: jump straight to the page instead of reading every page.',
    more: 'B-trees (Postgres, MySQL) keep sorted pages on disk and update in place: great for reads and range queries. LSM trees (Cassandra, RocksDB) buffer writes in memory and flush sorted files: much faster writes, reads may check several files (helped by Bloom filters).',
    points: ['Index columns you filter or sort by', 'Every index slows writes and uses space', 'Compound index order matters: (userId, createdAt) serves WHERE userId = ? ORDER BY createdAt'],
    code: `db.posts.createIndex({ userId: 1, createdAt: -1 })   // MongoDB
CREATE INDEX idx_posts_user_time ON posts (user_id, created_at DESC);  -- SQL`,
    chapters: ['key-value-store', 'metrics-monitoring'],
  },
  Replication: {
    analogy: 'Photocopies of an important document kept in different offices.',
    more: 'Leader-follower: one node takes writes and streams changes to read replicas. Multi-leader: several regions accept writes and merge conflicts. Leaderless (Dynamo-style): write to several nodes with quorums. Sync replication is safer; async is faster but can lose recent writes on failover.',
    points: ['Scales reads and survives node failure', 'Watch replication lag for read-your-writes', 'Replicas are not backups: a bad DELETE replicates too'],
    chapters: ['scaling-zero-to-millions', 'key-value-store'],
  },
  'Sharding / Partitioning': {
    analogy: 'A library splits books across several buildings by the first letter of the title.',
    more: 'Split data across databases by a shard key. Hash sharding spreads load evenly; range sharding keeps nearby keys together (good for range scans, risk of hot spots). Consistent hashing reduces data movement when adding shards.',
    points: ['Choose a high-cardinality key used in most queries (userId)', 'Avoid cross-shard joins and transactions', 'Plan for hot keys and resharding'],
    chapters: ['scaling-zero-to-millions', 'consistent-hashing', 'key-value-store'],
  },
  Denormalization: {
    analogy: 'Writing the customer’s name on every invoice instead of looking it up in the customer book each time.',
    more: 'Normalized data avoids duplication but needs joins. Denormalization copies data where it is read so a page needs one query. The cost: updates must change every copy (often via events).',
    points: ['Great for read-heavy pages (feeds, product pages)', 'Keep a single source of truth and update copies asynchronously', 'Counters (likes, followers) are classic denormalized fields'],
    chapters: ['news-feed-system', 'ad-click-aggregation'],
  },
  'Cache Strategies': {
    analogy: 'Keeping the files you use every day on your desk instead of in the basement archive.',
    more: 'Cache-aside: the app checks the cache, loads from the DB on a miss. Read-through: the cache loads from the DB itself. Write-through: write cache and DB together. Write-back: write cache now, DB later (fast but risky). Write-around: write only the DB, cache on read.',
    points: ['Cache-aside + TTL is the safe default', 'Invalidate (delete) on update rather than updating the cache', 'Cache what is hot and expensive, not everything'],
    chapters: ['scaling-zero-to-millions', 'url-shortener', 'search-autocomplete'],
  },
  'Eviction Policies': {
    analogy: 'When your desk is full, you put away the file you haven’t touched for the longest time.',
    more: 'When memory is full, the cache must drop something. LRU drops the least recently used item, LFU the least frequently used, FIFO the oldest, TTL drops expired items. Redis supports allkeys-lru, allkeys-lfu and volatile-* variants.',
    points: ['LRU is the usual default', 'LFU suits stable popularity (top products)', 'See the LRU cache LLD problem for an O(1) implementation'],
    chapters: ['scaling-zero-to-millions'],
    lld: 'lru-cache',
  },
  'Cache Stampede': {
    analogy: 'The shop’s only bread rack empties and 500 customers all run to the bakery at once.',
    more: 'When a hot key expires, thousands of requests miss together and hit the database. Fixes: a lock so only one request rebuilds the value (others wait or get stale data), refresh before expiry, or add random jitter to TTLs so keys don’t expire together.',
    points: ['Mutex / single-flight per key', 'Stale-while-revalidate', 'Jittered TTLs'],
    chapters: ['scaling-zero-to-millions'],
  },
  'Message Queue vs Pub/Sub': {
    analogy: 'Queue: a to-do pile where each task is done by one worker. Pub/sub: a WhatsApp group where everyone gets every message.',
    more: 'Point-to-point queues deliver each message to one consumer (job processing). Pub/sub delivers each message to every subscriber (events). Kafka does both: consumers in the same group share work, different groups each get everything.',
    points: ['Queue → background jobs', 'Pub/sub → event-driven services', 'See Kafka vs RabbitMQ for tools'],
    compare: 'kafka-vs-rabbitmq',
    chapters: ['distributed-message-queue', 'notification-system'],
  },
  Backpressure: {
    analogy: 'A restaurant stops seating new guests when the kitchen is overwhelmed instead of letting orders pile up forever.',
    more: 'When producers are faster than consumers, buffers grow until something crashes. Backpressure is any way the slow side signals “slow down”: bounded queues that reject, rate limits, or pull-based consumers that only take what they can handle.',
    points: ['Bound every queue and buffer', 'Return 429/503 early rather than timing out late', 'Node.js streams have backpressure built in (pipe / highWaterMark)'],
    chapters: ['rate-limiter', 'distributed-message-queue'],
  },
  'Dead Letter Queue': {
    analogy: 'The post office’s “undeliverable mail” shelf.',
    more: 'A message that keeps failing (bad data, a bug) would otherwise retry forever and block others. After N attempts, move it to a DLQ, alert someone, fix the cause and replay it.',
    points: ['Set max retries with exponential backoff', 'Monitor DLQ size', 'Store the error reason with the message'],
    chapters: ['notification-system', 'distributed-message-queue'],
  },
  'Microservices vs Monolith': {
    analogy: 'One big department store versus a street of small specialist shops.',
    more: 'See the comparison page for the full trade-offs and when to split.',
    points: ['Start with a modular monolith', 'Split when teams or scaling needs force it'],
    compare: 'monolith-vs-microservices',
    chapters: ['scaling-zero-to-millions'],
  },
  'Circuit Breaker': {
    analogy: 'The electrical fuse in your house: it trips to stop damage, then you reset it once it is safe.',
    more: 'If a downstream service keeps failing, stop calling it for a while (open state) and fail fast or return a fallback. After a timeout, let a few test calls through (half-open); if they succeed, close the circuit again. This stops one slow service from exhausting every thread upstream.',
    points: ['States: closed → open → half-open', 'Combine with timeouts and retries with backoff', 'Node libraries: opossum'],
    code: `import CircuitBreaker from 'opossum'
const breaker = new CircuitBreaker(callPaymentService, { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 10000 })
breaker.fallback(() => ({ status: 'queued' }))
const result = await breaker.fire(order)`,
    chapters: ['payment-system'],
  },
  'Saga Pattern': {
    analogy: 'Booking a trip: flight, then hotel, then cab. If the cab fails, you cancel the hotel and the flight in reverse order.',
    more: 'You cannot run one ACID transaction across microservices. A saga is a sequence of local transactions; if one step fails, compensating actions undo the earlier ones. Choreography: services react to each other’s events. Orchestration: a coordinator tells each service what to do.',
    points: ['Each step needs a compensating action', 'Steps must be idempotent', 'Orchestration is easier to debug'],
    chapters: ['payment-system', 'hotel-reservation'],
  },
  'Event Sourcing & CQRS': {
    analogy: 'A bank passbook: you don’t store the balance, you store every deposit and withdrawal and add them up.',
    more: 'Event sourcing stores every change as an immutable event; current state is derived by replaying them, giving a full audit trail. CQRS separates the write model (commands) from read models optimised for queries, often built from those events.',
    points: ['Perfect audit history and time travel', 'Read models are eventually consistent', 'More complex; use where history matters (finance)'],
    chapters: ['digital-wallet', 'stock-exchange'],
  },
  Observability: {
    analogy: 'A car dashboard (metrics), the black-box recorder (logs) and GPS trail (traces).',
    more: 'Metrics are numbers over time (QPS, p99 latency, error rate). Logs are detailed events. Traces follow one request across services. Together they tell you that something is wrong, where, and why.',
    points: ['Watch the four golden signals: latency, traffic, errors, saturation', 'Use structured JSON logs with a request ID', 'OpenTelemetry → Prometheus/Grafana, Loki, Jaeger'],
    chapters: ['metrics-monitoring'],
  },
  'SLI / SLO / SLA': {
    analogy: 'SLI is the speedometer reading, SLO is your own speed limit, SLA is the legal fine if you break the promise to a customer.',
    more: 'SLI: a measured indicator (e.g. % of requests under 300 ms). SLO: the target (99.9% over 30 days). SLA: a contract with penalties, set looser than the SLO. The gap between 100% and the SLO is your error budget for releases and experiments.',
    points: ['99.9% = ~43 min downtime/month; 99.99% = ~4.3 min', 'Each extra nine costs a lot more', 'Alert on SLO burn rate, not on every blip'],
    chapters: ['metrics-monitoring'],
  },
  'Authentication vs Authorization': {
    analogy: 'Authentication is showing your ID at the office gate. Authorization is whether your badge opens the server room.',
    more: 'AuthN proves who you are (password, OTP, OAuth login). AuthZ decides what you may do (roles, permissions, resource ownership). Sessions store state server-side; JWTs carry signed claims so any server can verify them without a lookup.',
    points: ['401 = not authenticated, 403 = authenticated but not allowed', 'Short-lived access token + refresh token', 'Check ownership on every request (user can only edit their own posts)'],
    code: `const requireRole = (role) => (req, res, next) =>
  req.user?.roles.includes(role) ? next() : res.status(403).json({ error: 'forbidden' })

app.delete('/admin/users/:id', authenticate, requireRole('admin'), deleteUser)`,
    chapters: ['google-drive', 's3-object-storage'],
  },
  'OAuth 2.0 & OIDC': {
    analogy: 'A hotel key card: reception (Google) checks your ID once and gives you a card that opens only your room, for a limited time.',
    more: 'OAuth 2.0 lets an app access an API on your behalf without your password, via an access token. OIDC adds an ID token (a JWT) that tells the app who you are, which is what “Login with Google” uses. Web and mobile apps should use the authorization code flow with PKCE.',
    points: ['Never use the implicit flow for new apps', 'Validate the ID token signature, issuer and audience', 'Store refresh tokens securely (httpOnly cookie or server-side)'],
    chapters: ['google-drive'],
  },
}
