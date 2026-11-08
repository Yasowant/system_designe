// Deep-dive sections for core chapters (part 2).

export const deep2 = {
  'url-shortener': {
    sections: [
      {
        h: 'What it does',
        p: 'A URL shortener (bit.ly, tinyurl) turns a long URL into a short code and redirects anyone who opens the short link. It is a perfect first system: tiny API, very read-heavy, and lots to discuss about IDs, caching and redirects.',
        points: [],
        code: `POST /api/v1/shorten   { "longUrl": "https://example.com/blog/system-design?ref=insta" }
→ 201 { "shortUrl": "https://sho.rt/zn9edcu" }

GET /zn9edcu
→ 301 Location: https://example.com/blog/system-design?ref=insta`,
      },
      {
        h: 'Quick estimation',
        p: '100 M new URLs per day, read:write = 10:1, kept for 10 years.',
        table: {
          cols: ['What', 'Math', 'Answer'],
          rows: [
            ['Write QPS', '100 M ÷ 86,400', '≈ 1,160'],
            ['Read (redirect) QPS', '× 10', '≈ 11,600'],
            ['Total URLs in 10 years', '100 M × 365 × 10', '365 B'],
            ['Storage', '365 B × ~100 bytes', '≈ 36.5 TB'],
            ['Code length', '62⁷ ≈ 3.5 T > 365 B', '7 characters'],
          ],
        },
        points: [],
      },
      {
        h: 'Redirect flow',
        p: 'The hot path is the redirect, so it should almost always be served from cache.',
        points: [],
        diagram: {
          w: 720, h: 230, caption: 'fig · redirect: cache first, database on a miss, then 301/302 to the long URL',
          nodes: [
            { id: 'u', x: 80, y: 115, label: 'Browser' },
            { id: 'lb', x: 250, y: 115, label: 'Load balancer' },
            { id: 'api', x: 420, y: 115, label: 'Web servers' },
            { id: 'c', x: 620, y: 45, label: 'Redis', sub: 'code → URL', tone: 'accent' },
            { id: 'db', x: 620, y: 185, label: 'Database', sub: 'id, code, longUrl' },
          ],
          edges: [
            { from: 'u', to: 'lb', label: 'GET /zn9edcu' },
            { from: 'lb', to: 'api' },
            { from: 'api', to: 'c', label: 'hit 95%', tone: 'good' },
            { from: 'api', to: 'db', label: 'miss', tone: 'alt', delay: 1.2 },
          ],
        },
      },
      {
        h: '301 vs 302 redirect',
        p: 'Both send the browser to the long URL, but they behave differently for caching and analytics.',
        table: {
          cols: ['Status', 'Meaning', 'Effect'],
          rows: [
            ['301 Moved Permanently', 'Browser caches the redirect', 'Less load on you, but repeat clicks are not counted'],
            ['302 Found (temporary)', 'Browser asks every time', 'More load, but every click hits you, which is good for analytics'],
          ],
        },
        points: [],
      },
      {
        h: 'Generating the short code',
        p: 'Two common approaches. Hashing (take the first 7 characters of MD5/SHA-256 of the long URL) needs a collision check on every insert. The cleaner approach: give each URL a unique numeric ID (e.g. Snowflake or a DB sequence) and convert it to base 62 (0–9, a–z, A–Z). No collisions, and you never need to check.',
        steps: [
          'Insert the long URL and get a unique ID, e.g. 2009215674938.',
          'Divide by 62 repeatedly; each remainder maps to one character.',
          'Read the characters in reverse: that is the short code.',
          'Store id, code and long URL; cache code → URL in Redis.',
        ],
        points: [],
      },
      {
        h: 'Try it: base 62 encoder',
        p: 'Type an ID and watch the division table produce the code.',
        points: [],
        lab: 'base62',
      },
      {
        h: 'Code',
        p: 'Encoding and the Express redirect route.',
        points: [],
        code: `const ALPHA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const toBase62 = (n) => { let s = ''; do { s = ALPHA[n % 62] + s; n = Math.floor(n / 62) } while (n > 0); return s }

app.post('/api/v1/shorten', async (req, res) => {
  const existing = await Url.findOne({ longUrl: req.body.longUrl })  // same URL -> same code
  if (existing) return res.json({ shortUrl: BASE + existing.code })
  const id = await nextId()                    // Snowflake / sequence
  const code = toBase62(id)
  await Url.create({ _id: id, code, longUrl: req.body.longUrl })
  res.status(201).json({ shortUrl: BASE + code })
})

app.get('/:code', async (req, res) => {
  let url = await redis.get('u:' + req.params.code)
  if (!url) {
    const doc = await Url.findOne({ code: req.params.code })
    if (!doc) return res.sendStatus(404)
    url = doc.longUrl
    await redis.set('u:' + req.params.code, url, 'EX', 86400)
  }
  res.redirect(302, url)
})`,
      },
      {
        h: 'Extras worth mentioning',
        p: 'Easy wins that show depth.',
        points: [
          'Custom aliases (sho.rt/yasowant): check uniqueness, reserve words like /api',
          'Expiry: store expiresAt and let a TTL index or a cleanup job delete old links',
          'Abuse: rate-limit creation per IP and check URLs against malware lists',
          'Analytics: push click events to Kafka and aggregate them, never update a counter row on every click',
        ],
      },
    ],
  },

  'notification-system': {
    sections: [
      {
        h: 'Three kinds of notifications',
        p: 'Apps send push notifications (iOS via APNs, Android via FCM), SMS (Twilio, MSG91) and email (SendGrid, SES). Each provider has its own API, limits and failure modes, so the system hides them behind one internal API.',
        points: [],
        code: `POST /v1/notifications
{
  "userId": 42,
  "template": "order_shipped",
  "channels": ["push", "email"],
  "data": { "orderId": "OD-991", "eta": "Tue" }
}`,
      },
      {
        h: 'High-level design',
        p: 'Services call the notification service, which validates, applies user preferences, renders the template and drops one message per channel onto a queue. Channel workers pull from their own queue and call the third-party provider. Separate queues mean a slow SMS provider never delays push notifications.',
        points: [],
        diagram: {
          w: 740, h: 280, caption: 'fig · one queue per channel isolates failures; workers retry with backoff',
          nodes: [
            { id: 'svc', x: 75, y: 140, w: 120, label: 'Order service' },
            { id: 'ns', x: 240, y: 140, w: 130, label: 'Notification', sub: 'service', tone: 'accent' },
            { id: 'q1', x: 420, y: 50, w: 110, label: 'push queue', tone: 'blue' },
            { id: 'q2', x: 420, y: 140, w: 110, label: 'sms queue', tone: 'blue' },
            { id: 'q3', x: 420, y: 230, w: 110, label: 'email queue', tone: 'blue' },
            { id: 'p1', x: 640, y: 50, w: 140, label: 'Push workers', sub: '→ APNs / FCM' },
            { id: 'p2', x: 640, y: 140, w: 140, label: 'SMS workers', sub: '→ Twilio' },
            { id: 'p3', x: 640, y: 230, w: 140, label: 'Email workers', sub: '→ SendGrid' },
          ],
          edges: [
            { from: 'svc', to: 'ns' },
            { from: 'ns', to: 'q1', tone: 'blue' }, { from: 'ns', to: 'q2', tone: 'blue' }, { from: 'ns', to: 'q3', tone: 'blue' },
            { from: 'q1', to: 'p1', tone: 'good' }, { from: 'q2', to: 'p2', tone: 'good' }, { from: 'q3', to: 'p3', tone: 'good' },
          ],
        },
      },
      {
        h: 'Step by step',
        p: 'What happens for one "order shipped" notification.',
        steps: [
          'Order service calls POST /v1/notifications (authenticated, rate limited).',
          'Load the user’s device tokens, phone and email, plus their opt-out settings.',
          'Render the template in the user’s language.',
          'Write a row to the notification log (status = pending) and publish one message per channel.',
          'The channel worker calls the provider. On success, mark sent; on failure, retry with exponential backoff.',
          'After N failures, move the message to a dead-letter queue and alert.',
        ],
        points: [],
      },
      {
        h: 'Reliability: never lose, never spam',
        p: 'Queues give at-least-once delivery, so a worker may process the same message twice. Make sending idempotent.',
        points: [
          'Give each notification a unique id; workers skip ids already marked sent',
          'Respect quiet hours and per-user frequency caps (e.g. max 3 marketing pushes/day)',
          'Remove invalid device tokens when APNs/FCM reports them',
          'Track delivered, opened and clicked events for analytics',
        ],
        code: `// worker: idempotent send with retry
worker.on('message', async (msg) => {
  if (await redis.set('sent:' + msg.id, 1, 'NX', 'EX', 86400) === null) return // already sent
  try {
    await fcm.send({ token: msg.token, notification: msg.body })
  } catch (err) {
    await redis.del('sent:' + msg.id)
    throw err   // queue redelivers later with backoff
  }
})`,
      },
    ],
  },

  'news-feed-system': {
    sections: [
      {
        h: 'Two flows',
        p: 'A news feed has two separate jobs. Publishing: when you post, your followers need to see it. Reading: when you open the app, fetch your feed fast. The big design question is when to do the work of building feeds.',
        points: [],
      },
      {
        h: 'Fan-out on write (push)',
        p: 'When a user posts, immediately insert the post ID into the cached feed of every follower. Reading is then very fast (one Redis read), but a celebrity with 50 M followers creates 50 M writes per post.',
        analogy: 'A newspaper delivered to every subscriber’s door each morning. Reading is instant, but delivery is a lot of work.',
        points: [],
        diagram: {
          w: 720, h: 240, caption: 'fig · fan-out on write: one post is copied into each follower’s feed cache',
          nodes: [
            { id: 'a', x: 80, y: 120, label: 'Author posts' },
            { id: 'ps', x: 250, y: 120, label: 'Post service', tone: 'accent' },
            { id: 'fo', x: 420, y: 120, label: 'Fan-out workers' },
            { id: 'f1', x: 630, y: 45, label: 'feed:follower1', tone: 'blue' },
            { id: 'f2', x: 630, y: 120, label: 'feed:follower2', tone: 'blue' },
            { id: 'f3', x: 630, y: 195, label: 'feed:follower3', tone: 'blue' },
          ],
          edges: [
            { from: 'a', to: 'ps' }, { from: 'ps', to: 'fo', label: 'queue' },
            { from: 'fo', to: 'f1', tone: 'good' }, { from: 'fo', to: 'f2', tone: 'good' }, { from: 'fo', to: 'f3', tone: 'good' },
          ],
        },
      },
      {
        h: 'Fan-out on read (pull)',
        p: 'Do nothing at post time. When a user opens the feed, fetch recent posts from everyone they follow and merge them. Posting is cheap, but reading is slow when you follow 1,000 people.',
        analogy: 'Going to each shop yourself to pick up today’s paper. No delivery work, but slow for you.',
        points: [],
      },
      {
        h: 'The hybrid used in practice',
        p: 'Push for normal users, pull for celebrities. At read time, merge your precomputed feed with fresh posts from the few celebrities you follow.',
        table: {
          cols: ['', 'Push (on write)', 'Pull (on read)', 'Hybrid'],
          rows: [
            ['Read speed', '⚡ very fast', '🐢 slow', '⚡ fast'],
            ['Write cost', 'High for celebrities', 'Tiny', 'Bounded'],
            ['Inactive users', 'Wasted work', 'No waste', 'Skip inactive users'],
            ['Used by', 'Small networks', 'Rarely alone', 'Twitter, Instagram'],
          ],
        },
        points: [],
      },
      {
        h: 'Data and code',
        p: 'Store only post IDs in the feed cache (cheap), then hydrate posts and authors from their own caches.',
        points: [],
        code: `// fan-out worker (push)
async function fanOut(post) {
  const author = await User.findById(post.authorId)
  if (author.followers > 1_000_000) return            // celebrity: pulled at read time
  for await (const ids of followerIdsInBatches(post.authorId, 1000)) {
    const pipe = redis.pipeline()
    for (const id of ids) {
      pipe.lpush('feed:' + id, post.id)
      pipe.ltrim('feed:' + id, 0, 799)               // keep last 800 posts
    }
    await pipe.exec()
  }
}

// read the feed (hybrid)
async function getFeed(userId, page = 0) {
  const pushed = await redis.lrange('feed:' + userId, page * 20, page * 20 + 19)
  const celeb = await recentPostsFromCelebritiesFollowedBy(userId)
  return hydrate(mergeByTime(pushed, celeb).slice(0, 20))
}`,
      },
      {
        h: 'Ranking and pagination',
        p: 'Chronological feeds are simple; ranked feeds score posts by affinity, engagement and freshness. Use cursor pagination (`?after=postId`), not page numbers, so new posts don’t shift what the user has already seen.',
        points: [],
      },
    ],
  },

  'chat-system': {
    sections: [
      {
        h: 'Why plain HTTP is not enough',
        p: 'HTTP is request/response: the client asks, the server answers. In chat, the server must push messages the moment they arrive. Options:',
        table: {
          cols: ['Technique', 'How', 'Verdict'],
          rows: [
            ['Short polling', 'Ask “anything new?” every 2 s', 'Wasteful, laggy'],
            ['Long polling', 'Server holds the request until a message arrives', 'OK fallback'],
            ['Server-Sent Events', 'One-way stream server → client', 'Great for notifications, not chat'],
            ['WebSocket', 'One persistent two-way TCP connection', '✅ the standard for chat'],
          ],
        },
        points: [],
      },
      {
        h: 'Architecture',
        p: 'Stateless HTTP services handle login, profiles and history. Stateful chat servers each hold thousands of open WebSocket connections. When user A messages user B, A’s chat server publishes the message; whichever chat server holds B’s connection pushes it to B.',
        points: [],
        diagram: {
          w: 740, h: 250, caption: 'fig · A and B are connected to different chat servers; pub/sub routes the message between them',
          nodes: [
            { id: 'a', x: 70, y: 70, w: 100, label: 'User A' },
            { id: 'cs1', x: 250, y: 70, label: 'Chat server 1', sub: 'WebSocket', tone: 'accent' },
            { id: 'mq', x: 470, y: 125, w: 150, label: 'Redis pub/sub', sub: 'or Kafka', tone: 'blue' },
            { id: 'cs2', x: 250, y: 190, label: 'Chat server 2', sub: 'WebSocket', tone: 'accent' },
            { id: 'b', x: 70, y: 190, w: 100, label: 'User B' },
            { id: 'db', x: 660, y: 125, w: 120, label: 'Message DB', sub: 'Cassandra' },
          ],
          edges: [
            { from: 'a', to: 'cs1', label: 'send', tone: 'good' },
            { from: 'cs1', to: 'mq', tone: 'good', delay: 0.6 },
            { from: 'mq', to: 'db', tone: 'blue', delay: 1.2 },
            { from: 'mq', to: 'cs2', tone: 'good', delay: 1.2 },
            { from: 'cs2', to: 'b', label: 'push', tone: 'good', delay: 1.8 },
          ],
        },
      },
      {
        h: 'Sending one message, step by step',
        p: 'What happens between pressing send and the double tick.',
        steps: [
          'A sends { to: B, text, clientMsgId } over their WebSocket.',
          'Chat server 1 assigns a server ID (time-sortable, per conversation) and saves the message.',
          'It acks A (single tick ✓).',
          'It publishes to channel user:B. Chat server 2 is subscribed because B is connected there.',
          'Server 2 pushes to B; B’s app acks delivery (double tick ✓✓).',
          'If B is offline, send a push notification instead; B fetches missed messages on reconnect using the last ID it saw.',
        ],
        points: [],
      },
      {
        h: 'Code: a minimal multi-server chat',
        p: 'Socket.IO with the Redis adapter does the pub/sub routing between servers for you.',
        points: [],
        code: `import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'

const io = new Server(httpServer)
io.adapter(createAdapter(pubClient, subClient))   // routes across all chat servers

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId     // verify the JWT in real apps
  socket.join('user:' + userId)                   // personal room
  redis.set('presence:' + userId, 'online', 'EX', 60)

  socket.on('message', async ({ to, text, clientMsgId }, ack) => {
    const msg = await Message.create({ from: userId, to, text, clientMsgId })
    ack({ id: msg.id })                           // ✓ sent
    io.to('user:' + to).emit('message', msg)      // reaches B on any server
  })
})`,
      },
      {
        h: 'Storage, presence and groups',
        p: 'Chat data is huge and mostly append-only, read by conversation and time.',
        points: [
          'Store messages in a wide-column DB (Cassandra, ScyllaDB, HBase) keyed by (conversation_id, message_id)',
          'Presence: client sends a heartbeat every ~30 s; if none for 60 s, mark offline. Fan presence out only to friends.',
          'Small groups: send to every member. Huge channels: members pull, like a feed.',
          'Ordering: use per-conversation increasing IDs, not device clocks',
          'End-to-end encryption (Signal protocol) means the server only stores ciphertext',
        ],
      },
    ],
  },

  'distributed-message-queue': {
    sections: [
      {
        h: 'Why queues exist',
        p: 'A message queue sits between producers and consumers so they don’t need to be up, fast or scaled at the same time. Producers write and move on; consumers read at their own speed.',
        analogy: 'A restaurant order rail. Waiters clip orders on the rail and go back to customers; cooks take the next ticket when ready. A rush makes the rail longer, not the waiters slower.',
        points: ['Decoupling: services don’t call each other directly', 'Buffering spikes: absorb Black Friday traffic', 'Fan-out: many services react to one event (order placed → email, invoice, analytics)'],
      },
      {
        h: 'Topics, partitions and offsets (Kafka model)',
        p: 'A topic is a named stream, e.g. `orders`. It is split into partitions so many machines can share the load. Each partition is an append-only log; every message gets an increasing offset. Messages with the same key always go to the same partition, so they stay in order.',
        points: [],
        diagram: {
          w: 740, h: 260, caption: 'fig · producers append to partitions; each consumer in a group owns some partitions',
          nodes: [
            { id: 'p1', x: 80, y: 80, w: 120, label: 'Producer A' },
            { id: 'p2', x: 80, y: 180, w: 120, label: 'Producer B' },
            { id: 't0', x: 330, y: 45, w: 170, label: 'orders · partition 0', tone: 'blue' },
            { id: 't1', x: 330, y: 130, w: 170, label: 'orders · partition 1', tone: 'blue' },
            { id: 't2', x: 330, y: 215, w: 170, label: 'orders · partition 2', tone: 'blue' },
            { id: 'c1', x: 620, y: 80, w: 150, label: 'Consumer 1', sub: 'owns P0, P1', tone: 'accent' },
            { id: 'c2', x: 620, y: 200, w: 150, label: 'Consumer 2', sub: 'owns P2', tone: 'accent' },
          ],
          edges: [
            { from: 'p1', to: 't0' }, { from: 'p1', to: 't1' }, { from: 'p2', to: 't2' },
            { from: 't0', to: 'c1', tone: 'good' }, { from: 't1', to: 'c1', tone: 'good' }, { from: 't2', to: 'c2', tone: 'good' },
          ],
        },
      },
      {
        h: 'Consumer groups',
        p: 'Each partition is read by exactly one consumer in a group, which gives parallelism without double-processing. Different groups (e.g. email-service and analytics) each get every message independently.',
        points: ['More consumers than partitions → extra consumers sit idle, so choose partition count with growth in mind', 'Each consumer commits its offset, so after a crash it resumes where it left off'],
      },
      {
        h: 'Delivery guarantees',
        p: 'It all depends on when the consumer commits its offset.',
        table: {
          cols: ['Guarantee', 'How', 'Risk'],
          rows: [
            ['At most once', 'Commit, then process', 'Crash = message lost'],
            ['At least once', 'Process, then commit', 'Crash = processed twice (make it idempotent)'],
            ['Exactly once', 'Transactions + idempotent producer', 'Slower, more complex'],
          ],
        },
        points: [],
      },
      {
        h: 'Code: producer and consumer',
        p: 'Using kafkajs in Node.js.',
        points: [],
        code: `import { Kafka } from 'kafkajs'
const kafka = new Kafka({ brokers: ['localhost:9092'] })

// producer: key keeps one user's events in order
const producer = kafka.producer()
await producer.connect()
await producer.send({
  topic: 'orders',
  messages: [{ key: 'user-42', value: JSON.stringify({ orderId: 'OD-991', total: 1499 }) }],
})

// consumer: at-least-once, idempotent handler
const consumer = kafka.consumer({ groupId: 'email-service' })
await consumer.connect()
await consumer.subscribe({ topic: 'orders' })
await consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value.toString())
    await sendOrderEmailOnce(order.orderId)   // safe to run twice
  },                                          // offset auto-committed after success
})`,
      },
      {
        h: 'Durability and replication',
        p: 'Each partition has a leader and followers on other brokers. Producers write to the leader; followers copy it. With `acks=all`, a write succeeds only when all in-sync replicas have it, so losing one broker loses nothing.',
        points: ['Retention: keep messages for days (Kafka) so consumers can replay; classic queues (RabbitMQ, SQS) delete after ack', 'Dead-letter queue: park messages that keep failing so they don’t block the partition'],
      },
    ],
  },
}
