// Low-level design problems. Code is TypeScript.
// diagram: { w, h, classes: [{ name, kind?: 'class'|'interface'|'abstract'|'enum', x, y, w?, fields[], methods[] }],
//            links: [{ from, to, type: 'inherits'|'implements'|'composition'|'aggregation'|'association'|'uses', label? }] }
// For composition/aggregation, `from` is the WHOLE (diamond side).

export const lldProblems = [
  {
    slug: 'parking-lot',
    n: 1,
    title: 'Design a Parking Lot',
    tagline: 'The most-asked LLD question: floors, spots, vehicles, tickets and fees.',
    level: 'Beginner',
    summary:
      'A multi-floor parking lot with spots of different sizes. A vehicle enters, gets the best free spot that fits and a ticket; on exit, the fee is calculated from the time parked and the spot is freed. The design shows inheritance (vehicle types), composition (lot → floors → spots), Strategy (spot selection and pricing), Singleton (one lot) and safe concurrency (two cars, one spot).',
    requirements: {
      functional: ['Multiple floors, each with SMALL / MEDIUM / LARGE spots', 'Bike → small+, car → medium+, truck → large only', 'Issue a ticket on entry, calculate the fee on exit', 'Show free spots per floor'],
      nonFunctional: ['Two vehicles must never get the same spot', 'Easy to add new vehicle types and pricing rules', 'Fast spot lookup'],
    },
    entities: [
      ['ParkingLot', 'Entry point (facade). Owns floors, issues tickets.'],
      ['Floor', 'Holds spots; answers “which spots are free?”'],
      ['Spot', 'One space with a size; holds at most one vehicle.'],
      ['Vehicle (abstract)', 'Bike, Car, Truck: each knows its size.'],
      ['Ticket', 'Who parked where and when.'],
      ['SpotStrategy', 'How to choose a spot (nearest, smallest fit…).'],
      ['FeeCalculator', 'How much to charge (hourly, flat, weekend…).'],
    ],
    diagram: {
      w: 980, h: 540,
      classes: [
        { name: 'ParkingLot', x: 20, y: 20, w: 220, fields: ['- floors: Floor[]', '- tickets: Map<string, Ticket>'], methods: ['+ park(v: Vehicle): Ticket', '+ unpark(id): number', '+ freeCount(): number'] },
        { name: 'Floor', x: 320, y: 20, w: 200, fields: ['- number: number', '- spots: Spot[]'], methods: ['+ freeSpots(): Spot[]'] },
        { name: 'Spot', x: 600, y: 20, w: 200, fields: ['- id: string', '- size: SpotSize', '- vehicle?: Vehicle'], methods: ['+ fits(v): boolean', '+ assign(v) / release()'] },
        { name: 'SpotStrategy', kind: 'interface', x: 320, y: 220, w: 200, fields: [], methods: ['+ pick(spots, v): Spot?'] },
        { name: 'FeeCalculator', kind: 'interface', x: 20, y: 240, w: 220, fields: [], methods: ['+ fee(t: Ticket, exit: Date)'] },
        { name: 'Ticket', x: 20, y: 380, w: 220, fields: ['- id: string', '- spot: Spot', '- entry: Date'], methods: [] },
        { name: 'SmallestFit', x: 320, y: 380, w: 200, fields: [], methods: ['+ pick(spots, v)'] },
        { name: 'Vehicle', kind: 'abstract', x: 640, y: 240, w: 200, fields: ['+ plate: string', '+ size: SpotSize'], methods: [] },
        { name: 'Bike', x: 580, y: 420, w: 100, fields: [], methods: [] },
        { name: 'Car', x: 700, y: 420, w: 100, fields: [], methods: [] },
        { name: 'Truck', x: 820, y: 420, w: 100, fields: [], methods: [] },
      ],
      links: [
        { from: 'ParkingLot', to: 'Floor', type: 'composition', label: '1..*' },
        { from: 'Floor', to: 'Spot', type: 'composition', label: '*' },
        { from: 'Spot', to: 'Vehicle', type: 'association', label: '0..1' },
        { from: 'ParkingLot', to: 'SpotStrategy', type: 'uses' },
        { from: 'ParkingLot', to: 'FeeCalculator', type: 'uses' },
        { from: 'FeeCalculator', to: 'Ticket', type: 'uses', label: 'reads' },
        { from: 'SmallestFit', to: 'SpotStrategy', type: 'implements' },
        { from: 'Bike', to: 'Vehicle', type: 'inherits' },
        { from: 'Car', to: 'Vehicle', type: 'inherits' },
        { from: 'Truck', to: 'Vehicle', type: 'inherits' },
      ],
    },
    patterns: [
      ['Strategy', 'SpotStrategy and FeeCalculator: swap selection and pricing rules without touching ParkingLot.'],
      ['Inheritance', 'Bike, Car and Truck extend Vehicle and declare their size.'],
      ['Facade', 'ParkingLot.park() / unpark() hide floors, spots and pricing from the caller.'],
      ['Singleton', 'One ParkingLot instance per building (created once at startup).'],
      ['Dependency Inversion (DIP)', 'ParkingLot receives its strategy and fee calculator through the constructor.'],
      ['Race Conditions & Locks', 'Spot assignment is a check-and-set that must be atomic.'],
    ],
    steps: [
      'Vehicle arrives → ParkingLot.park(vehicle).',
      'Collect free spots from every floor.',
      'SpotStrategy.pick() returns the best spot that fits (e.g. smallest that fits, so big spots stay free for trucks).',
      'spot.assign(vehicle) inside a lock, so two cars can’t take the same spot.',
      'Create a Ticket (id, spot, entry time) and store it.',
      'On exit → unpark(ticketId): FeeCalculator computes the fee, spot.release(), ticket removed.',
    ],
    code: [
      {
        file: 'vehicles.ts',
        src: `export enum SpotSize { SMALL = 1, MEDIUM = 2, LARGE = 3 }

export abstract class Vehicle {
  constructor(public readonly plate: string) {}
  abstract readonly size: SpotSize
}
export class Bike extends Vehicle { readonly size = SpotSize.SMALL }
export class Car extends Vehicle { readonly size = SpotSize.MEDIUM }
export class Truck extends Vehicle { readonly size = SpotSize.LARGE }`,
      },
      {
        file: 'spot.ts',
        src: `import { SpotSize, Vehicle } from './vehicles'

export class Spot {
  private vehicle: Vehicle | null = null
  constructor(public readonly id: string, public readonly size: SpotSize) {}

  get isFree() { return this.vehicle === null }
  fits(v: Vehicle) { return this.isFree && v.size <= this.size }   // bigger spots fit smaller vehicles

  assign(v: Vehicle) {
    if (!this.fits(v)) throw new Error(\`Spot \${this.id} cannot take \${v.plate}\`)
    this.vehicle = v
  }
  release() { this.vehicle = null }
}

export class Floor {
  constructor(public readonly number: number, private spots: Spot[]) {}
  freeSpots() { return this.spots.filter((s) => s.isFree) }
}`,
      },
      {
        file: 'strategies.ts',
        src: `import { Spot } from './spot'
import { Vehicle } from './vehicles'

export interface SpotStrategy { pick(spots: Spot[], v: Vehicle): Spot | undefined }

// Keep large spots free for trucks: choose the smallest spot that fits.
export class SmallestFit implements SpotStrategy {
  pick(spots: Spot[], v: Vehicle) {
    return spots.filter((s) => s.fits(v)).sort((a, b) => a.size - b.size)[0]
  }
}

export interface Ticket { id: string; spot: Spot; vehicle: Vehicle; entry: Date }

export interface FeeCalculator { fee(t: Ticket, exit: Date): number }

// ₹ per started hour, by spot size. Money in integer rupees.
export class HourlyFee implements FeeCalculator {
  constructor(private rates = { 1: 20, 2: 40, 3: 80 } as Record<number, number>) {}
  fee(t: Ticket, exit: Date) {
    const hours = Math.max(1, Math.ceil((exit.getTime() - t.entry.getTime()) / 3_600_000))
    return hours * this.rates[t.spot.size]
  }
}`,
      },
      {
        file: 'parkingLot.ts',
        src: `import { randomUUID } from 'node:crypto'
import { Mutex } from 'async-mutex'
import { Floor } from './spot'
import { FeeCalculator, SpotStrategy, Ticket } from './strategies'
import { Vehicle } from './vehicles'

export class ParkingLot {
  private tickets = new Map<string, Ticket>()
  private lock = new Mutex()   // two cars must never get the same spot

  constructor(private floors: Floor[], private strategy: SpotStrategy, private pricing: FeeCalculator) {}

  async park(v: Vehicle): Promise<Ticket> {
    return this.lock.runExclusive(() => {
      const free = this.floors.flatMap((f) => f.freeSpots())
      const spot = this.strategy.pick(free, v)
      if (!spot) throw new Error('Parking full for ' + v.constructor.name)
      spot.assign(v)
      const ticket: Ticket = { id: randomUUID(), spot, vehicle: v, entry: new Date() }
      this.tickets.set(ticket.id, ticket)
      return ticket
    })
  }

  unpark(ticketId: string, exit = new Date()): number {
    const t = this.tickets.get(ticketId)
    if (!t) throw new Error('Invalid ticket')
    const amount = this.pricing.fee(t, exit)
    t.spot.release()
    this.tickets.delete(ticketId)
    return amount
  }

  freeCount() { return this.floors.reduce((n, f) => n + f.freeSpots().length, 0) }
}`,
      },
      {
        file: 'main.ts',
        src: `import { Floor, Spot } from './spot'
import { HourlyFee, SmallestFit } from './strategies'
import { Car, SpotSize, Truck } from './vehicles'
import { ParkingLot } from './parkingLot'

const floor1 = new Floor(1, [new Spot('1-S1', SpotSize.SMALL), new Spot('1-M1', SpotSize.MEDIUM), new Spot('1-L1', SpotSize.LARGE)])
const lot = new ParkingLot([floor1], new SmallestFit(), new HourlyFee())

const t = await lot.park(new Car('KA01AB1234'))      // gets 1-M1, not the large spot
await lot.park(new Truck('MH12XY9999'))              // gets 1-L1
console.log(lot.freeCount())                          // 1
console.log(lot.unpark(t.id, new Date(Date.now() + 2.5 * 3_600_000)))  // 3 hours × ₹40 = 120`,
      },
    ],
    edgeCases: [
      'Two cars arrive at the same moment → mutex (single server) or an atomic DB update (many gateways)',
      'Lost ticket → look up by plate, charge a maximum daily fee',
      'Lot full → reject at the gate before the barrier opens',
      'Vehicle bigger than any spot → validate on entry',
    ],
    followUps: ['Add EV charging spots (new spot type + strategy)', 'Weekend / monthly-pass pricing (new FeeCalculator)', 'Display boards per floor (Observer on spot changes)', 'Multiple entry gates (lock or DB-level atomic claim)'],
    quiz: [
      { q: 'Which pattern lets you change how spots are chosen without editing ParkingLot?', options: ['Singleton', 'Strategy', 'Adapter', 'Builder'], a: 1, why: 'SpotStrategy is injected; new selection rules are new classes.' },
      { q: 'Lot → Floor → Spot is best modelled as…', options: ['Inheritance', 'Composition', 'Interface', 'Association only'], a: 1, why: 'Floors and spots are created and owned by the lot; they don’t exist without it.' },
    ],
  },

  {
    slug: 'lru-cache',
    n: 2,
    title: 'Design an LRU Cache',
    tagline: 'get and put in O(1) with a hash map and a doubly linked list.',
    level: 'Intermediate',
    summary:
      'An LRU (Least Recently Used) cache holds at most N items. When it is full, it evicts the item that was used longest ago. The trick for O(1) operations: a hash map finds any node instantly, and a doubly linked list keeps items in usage order so moving and evicting are O(1) pointer updates.',
    requirements: {
      functional: ['get(key) returns the value or undefined, and marks it as recently used', 'put(key, value) inserts or updates, marking it recently used', 'When over capacity, evict the least recently used item'],
      nonFunctional: ['get and put in O(1) time', 'Generic over key and value types', 'Optional: thread-safety and TTL'],
    },
    entities: [
      ['Cache<K, V> (interface)', 'The contract: get and put.'],
      ['LRUCache<K, V>', 'Implements Cache using a Map and a linked list.'],
      ['Node<K, V>', 'One entry with prev / next pointers.'],
      ['head / tail sentinels', 'Dummy nodes so we never check for null at the ends.'],
    ],
    lab: 'lru',
    diagram: {
      w: 900, h: 370,
      classes: [
        { name: 'Cache<K, V>', kind: 'interface', x: 40, y: 30, w: 230, fields: [], methods: ['+ get(key: K): V | undefined', '+ put(key: K, value: V): void'] },
        { name: 'LRUCache<K, V>', x: 330, y: 30, w: 260, fields: ['- capacity: number', '- map: Map<K, Node<K, V>>', '- head: Node (most recent side)', '- tail: Node (least recent side)'], methods: ['+ get(key) / put(key, value)', '- moveToFront(n) / remove(n)', '- evict()'] },
        { name: 'Node<K, V>', x: 660, y: 30, w: 210, fields: ['+ key: K', '+ value: V', '+ prev: Node | null', '+ next: Node | null'], methods: [] },
        { name: 'TTLCache<K, V>', x: 330, y: 240, w: 260, fields: ['- inner: Cache<K, V>', '- expiry: Map<K, number>'], methods: ['+ get / put with ttlMs'] },
      ],
      links: [
        { from: 'LRUCache<K, V>', to: 'Cache<K, V>', type: 'implements' },
        { from: 'LRUCache<K, V>', to: 'Node<K, V>', type: 'composition', label: '0..capacity' },
        { from: 'TTLCache<K, V>', to: 'LRUCache<K, V>', type: 'aggregation', label: 'decorates' },
      ],
    },
    patterns: [
      ['Composition over Inheritance', 'LRUCache owns a Map and a list instead of extending Map.'],
      ['Decorator', 'TTLCache wraps any Cache to add expiry without changing LRUCache.'],
      ['Interface vs Abstract Class', 'Callers depend on the Cache interface, so you can swap in LFU later.'],
      ['Race Conditions & Locks', 'Shared caches across async code or threads need a lock around get/put.'],
    ],
    steps: [
      'get(key): look up the node in the map. Missing → undefined.',
      'Found → unlink it and insert it right after head (most recent). Return the value.',
      'put(key, value): if the key exists, update the value and move it to the front.',
      'Otherwise create a node, add it to the map and insert it after head.',
      'If size > capacity, remove the node just before tail (least recent) from both the list and the map.',
    ],
    code: [
      {
        file: 'lruCache.ts',
        src: `export interface Cache<K, V> {
  get(key: K): V | undefined
  put(key: K, value: V): void
}

class Node<K, V> {
  prev: Node<K, V> | null = null
  next: Node<K, V> | null = null
  constructor(public key: K, public value: V) {}
}

export class LRUCache<K, V> implements Cache<K, V> {
  private map = new Map<K, Node<K, V>>()
  // sentinels: head.next = most recent, tail.prev = least recent
  private head = new Node<K, V>(null as K, null as V)
  private tail = new Node<K, V>(null as K, null as V)

  constructor(private capacity: number) {
    if (capacity < 1) throw new Error('capacity must be >= 1')
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key: K): V | undefined {
    const node = this.map.get(key)
    if (!node) return undefined
    this.remove(node)
    this.addFront(node)                 // now most recently used
    return node.value
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key)
    if (existing) {
      existing.value = value
      this.remove(existing)
      this.addFront(existing)
      return
    }
    const node = new Node(key, value)
    this.map.set(key, node)
    this.addFront(node)
    if (this.map.size > this.capacity) this.evict()
  }

  private addFront(n: Node<K, V>) {     // O(1)
    n.prev = this.head
    n.next = this.head.next
    this.head.next!.prev = n
    this.head.next = n
  }

  private remove(n: Node<K, V>) {       // O(1)
    n.prev!.next = n.next
    n.next!.prev = n.prev
  }

  private evict() {
    const lru = this.tail.prev!
    this.remove(lru)
    this.map.delete(lru.key)
  }
}`,
      },
      {
        file: 'usage.ts',
        src: `const cache = new LRUCache<string, number>(2)
cache.put('a', 1)
cache.put('b', 2)
cache.get('a')        // 1  -> order now: a, b
cache.put('c', 3)     // evicts 'b' (least recently used)
cache.get('b')        // undefined
cache.get('c')        // 3

// Shortcut in JS: Map keeps insertion order, so delete + set moves a key to the end.
// Good for quick scripts; interviewers usually want the linked list version.`,
      },
      {
        file: 'ttlCache.ts',
        src: `// Decorator: adds expiry to any Cache without touching LRUCache
export class TTLCache<K, V> implements Cache<K, V> {
  private expiry = new Map<K, number>()
  constructor(private inner: Cache<K, V>, private ttlMs: number) {}

  get(key: K) {
    const exp = this.expiry.get(key)
    if (exp !== undefined && Date.now() > exp) { this.expiry.delete(key); return undefined }
    return this.inner.get(key)
  }
  put(key: K, value: V) {
    this.expiry.set(key, Date.now() + this.ttlMs)
    this.inner.put(key, value)
  }
}

const sessions = new TTLCache(new LRUCache<string, object>(10_000), 15 * 60_000)`,
      },
    ],
    edgeCases: ['Capacity 1: every new put evicts the previous key', 'put on an existing key must not grow the size', 'Values that are undefined: use has() or a sentinel', 'Concurrent access from worker threads: wrap with a lock'],
    followUps: ['LFU cache (evict least frequently used): map + frequency buckets', 'Distributed cache: shard keys with consistent hashing (HLD chapter 5)', 'Size-based eviction (bytes, not count)'],
    quiz: [
      { q: 'Why a doubly linked list instead of an array?', options: ['Less memory', 'O(1) removal from the middle with prev/next pointers', 'Arrays can’t store objects', 'Sorting is faster'], a: 1, why: 'Moving a used item to the front means unlinking it from anywhere: O(1) with prev/next, O(n) with an array.' },
      { q: 'Which item is evicted?', options: ['The oldest inserted', 'The least recently accessed', 'The largest', 'A random one'], a: 1, why: 'LRU = least recently used: both get and put count as use.' },
    ],
  },

  {
    slug: 'splitwise',
    n: 3,
    title: 'Design Splitwise (Expense Sharing)',
    tagline: 'Groups, expenses, equal/exact/percent splits, balances and debt simplification.',
    level: 'Intermediate',
    summary:
      'Users add expenses in groups and split them equally, by exact amounts or by percentages. The app tracks who owes whom and can simplify debts so the group settles with the fewest payments. It is a great test of Strategy + Factory, validation, money handling in integer paise, and a neat greedy algorithm.',
    requirements: {
      functional: ['Create users and groups', 'Add an expense paid by one user, split EQUAL / EXACT / PERCENT', 'Show each user’s balances (who owes whom)', 'Settle up and simplify debts'],
      nonFunctional: ['Amounts must always add up exactly (no lost paise)', 'Easy to add new split types (shares, adjustments)', 'Auditable history of expenses'],
    },
    entities: [
      ['User', 'id, name, email.'],
      ['Group', 'Members and their expenses.'],
      ['Expense', 'Who paid, total amount, list of splits.'],
      ['Split', 'One user’s share of an expense.'],
      ['SplitStrategy', 'EqualSplit / ExactSplit / PercentSplit: turn input into splits.'],
      ['BalanceSheet', 'Net amount between every pair of users.'],
      ['ExpenseService', 'Validates, records expenses and updates balances.'],
    ],
    diagram: {
      w: 980, h: 550,
      classes: [
        { name: 'ExpenseService', x: 20, y: 20, w: 240, fields: ['- strategies: Record<Kind, SplitStrategy>'], methods: ['+ addExpense(input): Expense', '+ settle(from, to, amount)'] },
        { name: 'Group', x: 340, y: 20, w: 200, fields: ['- members: User[]', '- expenses: Expense[]'], methods: [] },
        { name: 'User', x: 640, y: 20, w: 180, fields: ['+ id', '+ name', '+ email'], methods: [] },
        { name: 'BalanceSheet', x: 20, y: 220, w: 240, fields: ['- net: Map<string, Map<string, number>>'], methods: ['+ record(expense)', '+ balancesOf(userId)', '+ simplify(): Payment[]'] },
        { name: 'Expense', x: 340, y: 200, w: 200, fields: ['+ paidBy: User', '+ amountPaise: number', '+ splits: Split[]'], methods: [] },
        { name: 'Split', x: 640, y: 200, w: 180, fields: ['+ userId', '+ amountPaise'], methods: [] },
        { name: 'SplitStrategy', kind: 'interface', x: 340, y: 380, w: 220, fields: [], methods: ['+ split(total, users, input): Split[]'] },
        { name: 'EqualSplit', x: 620, y: 360, w: 140, fields: [], methods: [] },
        { name: 'ExactSplit', x: 620, y: 420, w: 140, fields: [], methods: [] },
        { name: 'PercentSplit', x: 620, y: 480, w: 140, fields: [], methods: [] },
      ],
      links: [
        { from: 'Group', to: 'User', type: 'aggregation', label: '*' },
        { from: 'Group', to: 'Expense', type: 'composition', label: '*' },
        { from: 'Expense', to: 'Split', type: 'composition', label: '1..*' },
        { from: 'Split', to: 'User', type: 'association' },
        { from: 'ExpenseService', to: 'Group', type: 'uses' },
        { from: 'ExpenseService', to: 'BalanceSheet', type: 'uses' },
        { from: 'ExpenseService', to: 'SplitStrategy', type: 'uses' },
        { from: 'EqualSplit', to: 'SplitStrategy', type: 'implements' },
        { from: 'ExactSplit', to: 'SplitStrategy', type: 'implements' },
        { from: 'PercentSplit', to: 'SplitStrategy', type: 'implements' },
      ],
    },
    patterns: [
      ['Strategy', 'EqualSplit / ExactSplit / PercentSplit implement one SplitStrategy interface.'],
      ['Factory Method', 'A map from kind → strategy creates the right splitter.'],
      ['Open/Closed (OCP)', 'A new “by shares” split is a new class; ExpenseService doesn’t change.'],
      ['Single Responsibility (SRP)', 'Splitting, recording and balance maths live in separate classes.'],
      ['Command', 'Each expense can be stored as a command so it can be undone or edited.'],
    ],
    steps: [
      'addExpense({ paidBy, amountPaise, participants, kind, input }).',
      'Pick the SplitStrategy for kind and compute splits; validate they add up exactly to the total.',
      'Store the Expense in the group.',
      'BalanceSheet.record(): for each split (except the payer’s own), that user owes the payer amountPaise.',
      'balancesOf(user) shows net amounts; simplify() computes the fewest payments to settle everyone.',
    ],
    code: [
      {
        file: 'splits.ts',
        src: `export type Kind = 'EQUAL' | 'EXACT' | 'PERCENT'
export interface Split { userId: string; amountPaise: number }

export interface SplitStrategy {
  split(totalPaise: number, userIds: string[], input?: number[]): Split[]
}

export class EqualSplit implements SplitStrategy {
  split(total: number, users: string[]) {
    const base = Math.floor(total / users.length)
    let leftover = total - base * users.length          // distribute remaining paise
    return users.map((userId) => ({ userId, amountPaise: base + (leftover-- > 0 ? 1 : 0) }))
  }
}

export class ExactSplit implements SplitStrategy {
  split(total: number, users: string[], amounts: number[] = []) {
    if (amounts.reduce((a, b) => a + b, 0) !== total) throw new Error('Exact amounts must add up to the total')
    return users.map((userId, i) => ({ userId, amountPaise: amounts[i] }))
  }
}

export class PercentSplit implements SplitStrategy {
  split(total: number, users: string[], pcts: number[] = []) {
    if (pcts.reduce((a, b) => a + b, 0) !== 100) throw new Error('Percentages must add up to 100')
    const splits = users.map((userId, i) => ({ userId, amountPaise: Math.floor((total * pcts[i]) / 100) }))
    splits[0].amountPaise += total - splits.reduce((s, x) => s + x.amountPaise, 0) // rounding fix
    return splits
  }
}

// Factory: one place that maps kind -> strategy
export const strategies: Record<Kind, SplitStrategy> = {
  EQUAL: new EqualSplit(),
  EXACT: new ExactSplit(),
  PERCENT: new PercentSplit(),
}`,
      },
      {
        file: 'balanceSheet.ts',
        src: `import { Split } from './splits'

export interface Payment { from: string; to: string; amountPaise: number }

export class BalanceSheet {
  // net.get(a).get(b) > 0  means  a owes b
  private net = new Map<string, Map<string, number>>()

  private add(a: string, b: string, amt: number) {
    if (!this.net.has(a)) this.net.set(a, new Map())
    if (!this.net.has(b)) this.net.set(b, new Map())
    this.net.get(a)!.set(b, (this.net.get(a)!.get(b) ?? 0) + amt)
    this.net.get(b)!.set(a, (this.net.get(b)!.get(a) ?? 0) - amt)
  }

  record(paidBy: string, splits: Split[]) {
    for (const s of splits) if (s.userId !== paidBy) this.add(s.userId, paidBy, s.amountPaise)
  }

  balancesOf(userId: string) {
    return [...(this.net.get(userId) ?? new Map())].filter(([, v]) => v !== 0)
  }

  // Greedy: biggest debtor pays biggest creditor until everyone is at zero.
  simplify(): Payment[] {
    const total = new Map<string, number>()      // + means owes overall, - means is owed
    for (const [a, row] of this.net) for (const [, v] of row) total.set(a, (total.get(a) ?? 0) + v)
    const debtors = [...total].filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1])
    const creditors = [...total].filter(([, v]) => v < 0).map(([k, v]) => [k, -v] as [string, number]).sort((x, y) => y[1] - x[1])
    const out: Payment[] = []
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i][1], creditors[j][1])
      out.push({ from: debtors[i][0], to: creditors[j][0], amountPaise: pay })
      debtors[i][1] -= pay; creditors[j][1] -= pay
      if (debtors[i][1] === 0) i++
      if (creditors[j][1] === 0) j++
    }
    return out
  }
}`,
      },
      {
        file: 'expenseService.ts',
        src: `import { randomUUID } from 'node:crypto'
import { BalanceSheet } from './balanceSheet'
import { Kind, Split, SplitStrategy, strategies } from './splits'

export interface Expense { id: string; paidBy: string; amountPaise: number; splits: Split[]; note: string }

export class ExpenseService {
  readonly expenses: Expense[] = []
  constructor(private sheet = new BalanceSheet(), private splitters: Record<Kind, SplitStrategy> = strategies) {}

  addExpense(p: { paidBy: string; amountPaise: number; users: string[]; kind: Kind; input?: number[]; note?: string }) {
    if (!Number.isInteger(p.amountPaise) || p.amountPaise <= 0) throw new Error('Amount must be positive paise')
    const splits = this.splitters[p.kind].split(p.amountPaise, p.users, p.input)
    const e: Expense = { id: randomUUID(), paidBy: p.paidBy, amountPaise: p.amountPaise, splits, note: p.note ?? '' }
    this.expenses.push(e)
    this.sheet.record(e.paidBy, e.splits)
    return e
  }

  balances(userId: string) { return this.sheet.balancesOf(userId) }
  settleUpPlan() { return this.sheet.simplify() }
}

// --- usage ---
const svc = new ExpenseService()
svc.addExpense({ paidBy: 'asha', amountPaise: 90000, users: ['asha', 'ravi', 'yaso'], kind: 'EQUAL', note: 'Dinner' })
svc.addExpense({ paidBy: 'ravi', amountPaise: 60000, users: ['asha', 'yaso'], kind: 'PERCENT', input: [50, 50], note: 'Cab' })
console.log(svc.settleUpPlan())
// Dinner: ravi & yaso each owe asha ₹300. Cab: asha & yaso each owe ravi ₹300.
// asha and ravi cancel out, so only yaso pays:
// [ { from: 'yaso', to: 'ravi', amountPaise: 30000 }, { from: 'yaso', to: 'asha', amountPaise: 30000 } ]`,
      },
    ],
    edgeCases: ['₹100 split 3 ways: 3334 + 3333 + 3333 paise, never lose a paisa', 'Payer included in the split owes nothing to themselves', 'Percentages like 33.33 → use basis points (10000 = 100%) to avoid floats', 'Deleting an expense must reverse its balance changes'],
    followUps: ['Split by shares (2:1:1) as a new strategy', 'Multi-currency with exchange rates at expense time', 'Activity feed and notifications (Observer)', 'Persist with an expenses table + derived balances (or event sourcing)'],
    quiz: [
      { q: 'Why store money as integer paise?', options: ['Smaller JSON', 'Floating point can’t represent 0.1 exactly, so sums drift', 'Faster sorting', 'Required by JavaScript'], a: 1, why: '0.1 + 0.2 !== 0.3 in floating point. Integers keep totals exact.' },
      { q: 'Adding “split by shares” should mainly require…', options: ['Editing ExpenseService', 'A new SplitStrategy class registered in the factory', 'A new database', 'Changing BalanceSheet'], a: 1, why: 'Open/Closed: extend with a new strategy, don’t modify working code.' },
    ],
  },
]

export const upcomingLld = ['Elevator system', 'BookMyShow (movie booking)', 'Snake & Ladder', 'Vending machine', 'Library management', 'Rate limiter (class design)', 'Chess', 'Cab booking (Uber)']

export const lldBySlug = (slug) => lldProblems.find((p) => p.slug === slug)
