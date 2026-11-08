// Deep-dive sections for core chapters (part 1).
// Section fields: h, p, analogy, steps[], points[], diagram (key or spec), table {caption, cols, rows}, code, lab

export const deep1 = {
  'scaling-zero-to-millions': {
    sections: [
      {
        h: 'Step 0 — One server does everything',
        p: 'Day one: a single machine runs your Node/Express app, MongoDB and maybe Redis. Users type yourapp.com, DNS returns the server IP, and the server answers HTML or JSON. This is perfect for an MVP, but it is also a single point of failure: if that box dies or gets slow, the whole product is down.',
        analogy: 'A food stall where one person takes orders, cooks, and handles cash. Fine for 20 customers a day, chaos at 2,000.',
        points: [],
        diagram: {
          w: 720, h: 170, caption: 'fig · single server: app, database and cache share one machine',
          nodes: [
            { id: 'u', x: 80, y: 95, label: 'Users' },
            { id: 'dns', x: 300, y: 35, label: 'DNS', sub: 'yourapp.com → IP' },
            { id: 's', x: 560, y: 110, w: 230, h: 64, label: 'One server', sub: 'Node app + MongoDB + Redis', tone: 'alt' },
          ],
          edges: [{ from: 'u', to: 'dns', label: '1. lookup' }, { from: 'u', to: 's', label: '2. HTTP request' }],
        },
      },
      {
        h: 'Step 1 — Separate the tiers',
        p: 'Move the database to its own machine. Now the web tier and data tier can be sized and scaled separately, and a CPU spike in the app no longer starves the database.',
        steps: [
          'Vertical scaling ("scale up"): buy a bigger box with more CPU and RAM. Zero code changes, but there is a hard ceiling and it is still a single point of failure.',
          'Horizontal scaling ("scale out"): add more boxes. Needs a load balancer and stateless servers, but it has no real upper limit.',
          'SQL (Postgres, MySQL) when you need joins, transactions and strong consistency, e.g. orders and payments.',
          'NoSQL (MongoDB, DynamoDB, Cassandra) when you need huge scale, flexible schema or very fast key lookups, e.g. activity logs and sessions.',
        ],
        points: [],
      },
      {
        h: 'Step 2 — Load balancer + stateless web tier',
        p: 'A load balancer (Nginx, HAProxy, AWS ALB) sits in front of several identical web servers and spreads requests across them. Users only ever see the balancer’s public IP. Health checks remove dead servers automatically. Try it below: switch algorithms, send traffic and click a server to kill it.',
        points: [],
        lab: 'load-balancer',
      },
      {
        h: 'Why servers must be stateless',
        p: 'If server 2 keeps your login session in its memory, the load balancer must always send you back to server 2 (sticky sessions). That makes scaling and failover painful. Instead, keep servers stateless: store sessions in Redis or use JWTs, so any server can handle any request.',
        points: [],
        code: `// ❌ stateful: session lives in this process only
app.use(session({ secret: 's3cret' }))           // default MemoryStore

// ✅ stateless: every server reads the same Redis
import RedisStore from 'connect-redis'
app.use(session({ store: new RedisStore({ client: redis }), secret: 's3cret' }))`,
      },
      {
        h: 'Step 3 — Database replication',
        p: 'Most apps read 10–100× more than they write. So keep one primary that takes all writes and copy its data to several read replicas.',
        steps: [
          'App writes (INSERT/UPDATE) go to the primary.',
          'The primary streams its change log to every replica.',
          'App reads (SELECT) go to replicas, spread across them.',
          'If a replica dies, its reads move to the others. If the primary dies, a replica is promoted.',
        ],
        points: ['Replication lag: a replica may be a few ms–seconds behind. Read your own writes from the primary (e.g. right after a user updates their profile).'],
        diagram: {
          w: 720, h: 250, caption: 'fig · writes go to the primary, reads fan out to replicas',
          nodes: [
            { id: 'app', x: 90, y: 125, label: 'Web servers' },
            { id: 'p', x: 340, y: 45, label: 'Primary', sub: 'writes', tone: 'accent' },
            { id: 'r1', x: 610, y: 45, label: 'Replica 1', sub: 'reads', tone: 'blue' },
            { id: 'r2', x: 610, y: 130, label: 'Replica 2', sub: 'reads', tone: 'blue' },
            { id: 'r3', x: 610, y: 215, label: 'Replica 3', sub: 'reads', tone: 'blue' },
          ],
          edges: [
            { from: 'app', to: 'p', label: 'write', tone: 'alt' },
            { from: 'p', to: 'r1', label: 'replicate', tone: 'good' },
            { from: 'p', to: 'r2', tone: 'good' },
            { from: 'p', to: 'r3', tone: 'good' },
            { from: 'app', to: 'r2', label: 'read', tone: 'blue' },
            { from: 'app', to: 'r3', tone: 'blue' },
          ],
        },
      },
      {
        h: 'Step 4 — Cache (cache-aside pattern)',
        p: 'A cache like Redis keeps hot data in RAM. Reading from RAM takes ~0.1 ms versus ~5–10 ms for a database query, and every cache hit is one query your database never sees.',
        steps: [
          'App asks the cache for key `user:42`.',
          'Hit → return it immediately.',
          'Miss → read from the database, store it in the cache with a TTL, then return it.',
          'On update → write to the database, then delete the cache key so the next read refreshes it.',
        ],
        points: [
          'TTL: every key expires (e.g. 10 min), so stale data cannot live forever',
          'Eviction: when RAM is full, drop the Least Recently Used (LRU) keys',
          'Thundering herd: when a hot key expires, 1,000 requests miss at once. Use a lock or refresh it early.',
        ],
        diagram: {
          w: 720, h: 210, caption: 'fig · cache-aside: check the cache first, fall back to the DB on a miss',
          nodes: [
            { id: 'app', x: 90, y: 105, label: 'App' },
            { id: 'c', x: 420, y: 40, label: 'Redis cache', sub: '~0.1 ms', tone: 'accent' },
            { id: 'db', x: 420, y: 170, label: 'Database', sub: '~5–10 ms' },
          ],
          edges: [
            { from: 'app', to: 'c', label: '1. GET user:42', tone: 'good' },
            { from: 'app', to: 'db', label: '2. on miss: SELECT', tone: 'alt', delay: 1 },
            { from: 'db', to: 'c', label: '3. SET with TTL', tone: 'blue', delay: 1.6 },
          ],
        },
        code: `async function getUser(id) {
  const key = 'user:' + id
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)          // cache hit

  const user = await User.findById(id)           // cache miss -> DB
  await redis.set(key, JSON.stringify(user), 'EX', 600) // keep 10 min
  return user
}

async function updateUser(id, data) {
  await User.updateOne({ _id: id }, data)
  await redis.del('user:' + id)                  // invalidate
}`,
      },
      {
        h: 'Step 5 — CDN for static files',
        p: 'A CDN (Cloudflare, CloudFront, Akamai) copies your images, JS, CSS and videos to hundreds of edge servers worldwide. A user in Chennai downloads from a Chennai edge instead of your server in Virginia, cutting latency from ~250 ms to ~20 ms and taking that traffic off your servers.',
        points: ['Version files (app.3f9a.js) so you can cache them for a year', 'Set Cache-Control headers; purge the CDN when content changes'],
      },
      {
        h: 'Step 6 — Message queues for slow work',
        p: 'Some work is slow: resizing images, sending emails, generating PDFs. Do not make the user wait. Put a job on a queue (RabbitMQ, Kafka, SQS, BullMQ) and return immediately; background workers process jobs at their own pace. If traffic spikes, the queue grows and you add workers.',
        points: [],
        code: `// API: enqueue and return fast
app.post('/photos', async (req, res) => {
  const photo = await Photo.create({ url: req.body.url, status: 'processing' })
  await queue.add('resize', { photoId: photo.id })  // BullMQ
  res.status(202).json(photo)                        // 202 Accepted
})

// Worker: separate process, scale independently
new Worker('resize', async (job) => {
  await resizeImage(job.data.photoId)
})`,
      },
      {
        h: 'Step 7 — Sharding the database',
        p: 'Eventually one primary cannot hold all the data or take all the writes. Sharding splits rows across several databases by a shard key, e.g. `shard = user_id % 4`.',
        table: {
          caption: 'Example: 4 shards, key = user_id % 4',
          cols: ['user_id', 'user_id % 4', 'Shard'],
          rows: [['101', '1', 'Shard 1'], ['102', '2', 'Shard 2'], ['104', '0', 'Shard 0'], ['107', '3', 'Shard 3']],
        },
        points: [
          'Pick a key that spreads load evenly (user_id, not country)',
          'Hot keys (the celebrity problem): one shard gets hammered. Split that key further.',
          'Resharding: adding a 5th shard moves most rows with %. Consistent hashing fixes this (see chapter 5).',
          'Cross-shard joins are slow; denormalize data that you read together',
        ],
      },
      {
        h: 'Step 8 — Multiple data centers',
        p: 'GeoDNS sends users to the nearest healthy data center. Each data center has its own web servers, caches and databases, replicated across regions. If a whole region goes down, traffic shifts to the others.',
        points: ['Hardest parts: syncing data across regions and testing failover regularly', 'Add logging, metrics and alerts early. You cannot fix what you cannot see.'],
      },
    ],
  },

  'back-of-the-envelope': {
    sections: [
      {
        h: 'Why estimate at all?',
        p: 'Estimation tells you which problems are real. If your system needs 50 QPS, one server is enough. If it needs 500,000 QPS, you need caching, sharding and a CDN. Interviewers want the method and sensible round numbers, not exact values.',
        analogy: 'Before planning a wedding, you estimate guests × plates × cost. You don’t count every grain of rice, but you do know whether to book a hall for 100 or 1,000.',
        points: [],
      },
      {
        h: 'Numbers every developer should know',
        p: 'Memorise these. They make the arithmetic fast.',
        table: {
          cols: ['Thing', 'Approx value', 'Why it matters'],
          rows: [
            ['Seconds in a day', '86,400 ≈ 10⁵', 'requests/day ÷ 10⁵ ≈ QPS'],
            ['1 million requests/day', '≈ 12 QPS', 'small: one server is fine'],
            ['1 billion requests/day', '≈ 12,000 QPS', 'needs a fleet + caching'],
            ['Read from RAM', '~100 ns', 'why caches are fast'],
            ['Read 1 MB from SSD', '~1 ms', ''],
            ['Round trip in same data center', '~0.5 ms', ''],
            ['Round trip India ↔ US', '~150–250 ms', 'why CDNs and regions exist'],
            ['1 KB × 1 billion', '1 TB', 'storage math'],
          ],
        },
        points: [],
      },
      {
        h: 'The recipe',
        p: 'Follow the same steps every time.',
        steps: [
          'Users: monthly active (MAU) → daily active (DAU), often 30–50% of MAU.',
          'Traffic: DAU × actions per user per day = requests/day.',
          'QPS: requests/day ÷ 86,400. Peak is 2–3× average.',
          'Split reads and writes (read-heavy apps are often 10:1 to 100:1).',
          'Storage: writes/day × size per write × days kept × replication factor.',
          'Bandwidth: QPS × response size.',
        ],
        points: [],
      },
      {
        h: 'Try it: estimation calculator',
        p: 'Pick a preset or type your own numbers. Every row shows the formula, so you can repeat it on a whiteboard.',
        points: [],
        lab: 'estimator',
      },
      {
        h: 'Worked example: Twitter-like app',
        p: '300 M MAU, 50% daily active, 2 tweets/day, 10% of tweets carry media.',
        table: {
          cols: ['Step', 'Math', 'Answer'],
          rows: [
            ['DAU', '300 M × 50%', '150 M'],
            ['Tweets / day', '150 M × 2', '300 M'],
            ['Write QPS', '300 M ÷ 86,400', '≈ 3,500'],
            ['Peak write QPS', '× 2', '≈ 7,000'],
            ['Text storage / day', '300 M × 300 bytes', '≈ 90 GB'],
            ['Media storage / day', '30 M × 1 MB', '≈ 30 TB'],
            ['Media for 5 years', '30 TB × 365 × 5', '≈ 55 PB'],
          ],
        },
        points: ['Conclusion: text fits in a sharded DB; media must go to object storage (S3) + CDN'],
      },
    ],
  },

  'consistent-hashing': {
    sections: [
      {
        h: 'The problem with hash % N',
        p: 'To spread keys over N cache servers, the obvious approach is `server = hash(key) % N`. It works until N changes. Add one server and almost every key maps to a different server: the caches go cold and the database gets flooded.',
        table: {
          caption: 'Keys with hash 10, 11, 12, 13. Going from 4 servers to 5:',
          cols: ['hash(key)', '% 4 (before)', '% 5 (after)', 'Moved?'],
          rows: [['10', '2', '0', '❌ yes'], ['11', '3', '1', '❌ yes'], ['12', '0', '2', '❌ yes'], ['13', '1', '3', '❌ yes']],
        },
        points: ['With N servers, adding one moves roughly N/(N+1) of all keys, i.e. almost everything'],
      },
      {
        h: 'The idea: a hash ring',
        p: 'Hash both servers and keys onto the same circle (0 → 2³²). Each key walks clockwise and is stored on the first server it meets. When a server joins, it only takes keys from its clockwise neighbour; when one leaves, only its keys move to the next server. On average just 1/N of the keys move.',
        analogy: 'Houses on a circular road with a few post offices. Each house uses the next post office clockwise. Opening a new post office only changes the houses just before it; everyone else keeps their post office.',
        steps: [
          'Hash every server name (S1, S2…) to a position on the ring.',
          'Hash the key (user:1037) to a position.',
          'Move clockwise until you hit a server: that server owns the key.',
          'Add or remove a server: only keys in one arc change owner.',
        ],
        points: [],
      },
      {
        h: 'Try it: interactive hash ring',
        p: 'Add and remove servers and watch how few keys move compared to hash % N. Then raise the virtual nodes slider.',
        points: [],
        lab: 'hash-ring',
      },
      {
        h: 'Virtual nodes',
        p: 'With only a few servers, their positions on the ring are random, so one server can own a huge arc and get most of the traffic. The fix: place each physical server on the ring many times (S1#0, S1#1 … S1#199). More points means arcs average out, so load is even. Bigger machines can get more virtual nodes.',
        points: ['Typical: 100–200 virtual nodes per server', 'Trade-off: more memory for the ring metadata (tiny in practice)'],
      },
      {
        h: 'Code: a hash ring in ~25 lines',
        p: 'Keep the ring as a sorted array and binary search for the first position ≥ the key hash.',
        points: [],
        code: `import { createHash } from 'node:crypto'
const h = (s) => parseInt(createHash('md5').update(s).digest('hex').slice(0, 8), 16)

class HashRing {
  constructor(vnodes = 100) { this.vnodes = vnodes; this.ring = [] } // [{ pos, server }]

  add(server) {
    for (let i = 0; i < this.vnodes; i++) this.ring.push({ pos: h(server + '#' + i), server })
    this.ring.sort((a, b) => a.pos - b.pos)
  }
  remove(server) { this.ring = this.ring.filter((n) => n.server !== server) }

  get(key) {
    const k = h(key)
    let lo = 0, hi = this.ring.length
    while (lo < hi) { const m = (lo + hi) >> 1; this.ring[m].pos < k ? (lo = m + 1) : (hi = m) }
    return this.ring[lo % this.ring.length].server  // wrap around
  }
}

const ring = new HashRing()
;['cache-a', 'cache-b', 'cache-c'].forEach((s) => ring.add(s))
ring.get('user:42') // e.g. 'cache-b'`,
      },
      {
        h: 'Where it is used',
        p: 'Anywhere data is spread over a changing set of machines.',
        points: [
          'Amazon DynamoDB and Apache Cassandra: partitioning data across nodes',
          'Discord: routing chat servers',
          'CDNs: picking an edge cache for a URL',
          'Memcached client libraries (ketama) and load balancers like Envoy (ring hash)',
        ],
      },
    ],
  },

  'key-value-store': {
    sections: [
      {
        h: 'What we are building',
        p: 'A distributed key-value store (like DynamoDB, Cassandra or Redis Cluster) has a tiny API, put(key, value) and get(key), but it must hold more data than one machine, survive machine failures and stay fast. Most big ideas in distributed systems show up here.',
        points: [],
        code: `PUT /kv/user:42   { "name": "Yasowant", "plan": "pro" }
GET /kv/user:42 → { "name": "Yasowant", "plan": "pro" }`,
      },
      {
        h: 'CAP theorem in plain words',
        p: 'When the network splits (a partition, P), nodes cannot talk to each other. You must then choose: keep answering, possibly with stale data (Availability), or refuse until nodes agree (Consistency). You cannot have both during a partition.',
        table: {
          cols: ['Choice', 'During a network split', 'Good for', 'Examples'],
          rows: [
            ['CP', 'Some requests fail, data always correct', 'Bank balances, inventory', 'MongoDB (default), HBase, etcd'],
            ['AP', 'Always answers, may be stale briefly', 'Likes, carts, feeds', 'Cassandra, DynamoDB'],
          ],
        },
        points: [],
      },
      {
        h: 'Partitioning and replication',
        p: 'Use consistent hashing to decide which node owns a key. Then copy the key to the next N−1 distinct nodes clockwise (N = 3 is typical) so a single failure loses nothing.',
        points: [],
        diagram: {
          w: 720, h: 230, caption: 'fig · the coordinator writes to 3 replicas and returns after W = 2 acks',
          nodes: [
            { id: 'c', x: 90, y: 115, label: 'Client' },
            { id: 'co', x: 320, y: 115, label: 'Coordinator', sub: 'any node', tone: 'accent' },
            { id: 'a', x: 600, y: 40, label: 'Node A', sub: '✓ ack', tone: 'good' },
            { id: 'b', x: 600, y: 115, label: 'Node B', sub: '✓ ack', tone: 'good' },
            { id: 'd', x: 600, y: 190, label: 'Node C', sub: 'slow…' },
          ],
          edges: [
            { from: 'c', to: 'co', label: 'put(k, v)' },
            { from: 'co', to: 'a', tone: 'good' },
            { from: 'co', to: 'b', tone: 'good' },
            { from: 'co', to: 'd', dur: 4 },
          ],
        },
      },
      {
        h: 'Quorum: tuning N, W, R',
        p: 'N = number of copies, W = acks needed before a write succeeds, R = replicas read before answering. If W + R > N, every read overlaps at least one node with the latest write, so you read fresh data.',
        table: {
          cols: ['Setting', 'Result'],
          rows: [
            ['N=3, W=2, R=2', 'Strong reads (2+2 > 3), balanced: the common default'],
            ['N=3, W=1, R=3', 'Very fast writes, slow reads'],
            ['N=3, W=3, R=1', 'Fast reads, slow writes that fail if any node is down'],
            ['N=3, W=1, R=1', 'Fastest, but only eventually consistent'],
          ],
        },
        points: [],
      },
      {
        h: 'Handling conflicts and failures',
        p: 'In an AP system two clients can update the same key on different nodes. The system needs rules to detect and resolve that, plus ways to heal after failures.',
        points: [
          'Last-write-wins: keep the value with the newest timestamp (simple; can lose a write)',
          'Vector clocks: detect true conflicts and let the app merge them (e.g. union two shopping carts)',
          'Gossip protocol: nodes ping random peers to detect who is down',
          'Hinted handoff: a neighbour temporarily stores writes for a dead node, then hands them back',
          'Anti-entropy with Merkle trees: compare hashes of key ranges to find and fix out-of-sync data cheaply',
        ],
      },
      {
        h: 'The write and read path on one node',
        p: 'Cassandra-style storage engines (LSM trees) make writes very fast.',
        steps: [
          'Write: append to a commit log on disk (for crash safety), then insert into an in-memory table (memtable).',
          'When the memtable is full, flush it to disk as an immutable sorted file (SSTable).',
          'Read: check the memtable, then use a Bloom filter to skip SSTables that cannot contain the key, then read the right SSTable.',
          'In the background, compaction merges SSTables and removes deleted and old versions.',
        ],
        points: [],
      },
    ],
  },

  'unique-id-generator': {
    sections: [
      {
        h: 'Why not just auto-increment?',
        p: 'A single MySQL AUTO_INCREMENT works on one database. With many shards or servers, two of them will hand out ID 1001 at the same time, and a single DB that issues all IDs becomes a bottleneck and single point of failure.',
        table: {
          cols: ['Approach', 'Pros', 'Cons'],
          rows: [
            ['Auto-increment with step (1, 3, 5… / 2, 4, 6…)', 'Simple, numeric', 'Hard to add servers; not time-sorted across DBs'],
            ['UUID v4 (128-bit random)', 'No coordination at all', '128 bits, not sortable, poor index locality'],
            ['Ticket server (central counter)', 'Numeric, simple', 'Single point of failure'],
            ['Snowflake (64-bit)', 'Sortable by time, numeric, no coordination', 'Needs synced clocks'],
          ],
        },
        points: [],
      },
      {
        h: 'Snowflake layout',
        p: 'Twitter’s Snowflake packs everything into one 64-bit integer, so IDs fit in a BIGINT column and sort by creation time.',
        table: {
          cols: ['Bits', 'Field', 'Meaning'],
          rows: [
            ['1', 'sign', 'always 0, keeps the number positive'],
            ['41', 'timestamp', 'ms since a custom epoch: ~69 years of IDs'],
            ['5', 'datacenter', 'up to 32 datacenters'],
            ['5', 'machine', 'up to 32 machines per datacenter'],
            ['12', 'sequence', '4,096 IDs per machine per millisecond'],
          ],
        },
        points: ['Capacity: 4,096 × 1,000 ≈ 4 million IDs per second per machine'],
      },
      {
        h: 'Try it: generate Snowflake IDs',
        p: 'Generate a few IDs and watch the bits. Press "5 in the same millisecond" to see the sequence counter increase while the timestamp stays the same.',
        points: [],
        lab: 'snowflake',
      },
      {
        h: 'Code',
        p: 'BigInt makes this easy in Node.js.',
        points: [],
        code: `const EPOCH = 1288834974657n
class Snowflake {
  constructor(dc, machine) { this.dc = BigInt(dc); this.m = BigInt(machine); this.last = -1n; this.seq = 0n }
  next() {
    let now = BigInt(Date.now()) - EPOCH
    if (now < this.last) throw new Error('clock moved backwards')
    if (now === this.last) {
      this.seq = (this.seq + 1n) & 4095n
      if (this.seq === 0n) while (now <= this.last) now = BigInt(Date.now()) - EPOCH // wait 1 ms
    } else this.seq = 0n
    this.last = now
    return (now << 22n) | (this.dc << 17n) | (this.m << 12n) | this.seq
  }
}
new Snowflake(3, 7).next().toString()`,
      },
      {
        h: 'Gotchas',
        p: 'Things interviewers will probe.',
        points: [
          'Clock skew: if NTP moves the clock backwards, refuse to generate (or wait) to avoid duplicates',
          'Machine IDs must be unique: assign them from ZooKeeper/etcd or config at boot',
          'IDs reveal creation time and roughly your volume. Use a random public slug if that matters.',
          'JavaScript numbers are only safe up to 2⁵³. Send 64-bit IDs to browsers as strings.',
        ],
      },
    ],
  },
}
