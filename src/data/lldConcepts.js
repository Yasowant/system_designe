// Low-level design concepts. Code samples are TypeScript.
// Fields: term, group, def, example, analogy, more, points[], code, mistake, problems[] (LLD problem slugs)

export const lldGroups = ['OOP Basics', 'SOLID', 'Creational Patterns', 'Structural Patterns', 'Behavioral Patterns', 'UML & Relationships', 'Concurrency']

export const lldConcepts = [
  // ---------------- OOP ----------------
  {
    term: 'Encapsulation', group: 'OOP Basics',
    def: 'Keep an object’s data private and expose only safe methods to change it, so the object can protect its own rules.',
    example: 'A BankAccount exposes deposit() and withdraw(), never a public balance field.',
    analogy: 'An ATM: you can withdraw through the slot, but you can’t open the cash box.',
    more: 'If any code can set account.balance = -500, the rule “balance never goes negative” lives nowhere. Encapsulation puts the rule inside the class, in one place, so every change goes through it.',
    points: ['Make fields private; expose behaviour, not data', 'Validate inside methods', 'Return copies of internal arrays, not the arrays themselves'],
    code: `class BankAccount {
  private balance = 0

  deposit(amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive')
    this.balance += amount
  }

  withdraw(amount: number) {
    if (amount > this.balance) throw new Error('Insufficient funds')
    this.balance -= amount
  }

  getBalance() { return this.balance }
}`,
    mistake: 'Generating getters and setters for every field: a public setter is the same as a public field.',
    problems: ['splitwise'],
  },
  {
    term: 'Abstraction', group: 'OOP Basics',
    def: 'Show what an object does and hide how it does it, so callers depend on a simple contract instead of messy details.',
    example: 'paymentGateway.charge(amount) hides whether it is Razorpay, Stripe or UPI.',
    analogy: 'Driving a car: you use the steering wheel and pedals, not the fuel injection system.',
    more: 'Abstraction is about choosing the right interface. Callers think in terms of “charge this order”, not HTTP calls, signatures and retries. In TypeScript you usually express it with an interface or abstract class.',
    points: ['Name methods after intent (sendOtp) not mechanism (postToTwilio)', 'Hide third-party SDKs behind your own interface', 'Keep the interface small'],
    code: `interface PaymentGateway {
  charge(orderId: string, amountPaise: number): Promise<{ ok: boolean; txnId: string }>
}

class RazorpayGateway implements PaymentGateway {
  async charge(orderId: string, amountPaise: number) {
    // SDK calls, signatures, retries… all hidden here
    return { ok: true, txnId: 'rzp_' + orderId }
  }
}`,
    mistake: 'Leaking details through the abstraction, e.g. returning a raw Razorpay response object.',
    problems: ['parking-lot'],
  },
  {
    term: 'Inheritance', group: 'OOP Basics',
    def: 'A class reuses and extends another class (“is-a” relationship). The child gets the parent’s fields and methods and can override them.',
    example: 'Car, Bike and Truck all extend Vehicle.',
    analogy: 'A child inherits family traits but can have their own too.',
    more: 'Use inheritance only for a true “is-a” relationship where the child can be used anywhere the parent is expected (see Liskov). Deep hierarchies become fragile: a change in the parent ripples into every child.',
    points: ['Keep hierarchies shallow (1–2 levels)', 'Prefer abstract base classes for shared behaviour', 'Prefer composition when you only want to reuse code'],
    code: `abstract class Vehicle {
  constructor(public readonly plate: string) {}
  abstract get size(): 'SMALL' | 'MEDIUM' | 'LARGE'
}

class Bike extends Vehicle { get size() { return 'SMALL' as const } }
class Car extends Vehicle { get size() { return 'MEDIUM' as const } }
class Truck extends Vehicle { get size() { return 'LARGE' as const } }`,
    mistake: 'Inheriting just to reuse a method (Stack extends ArrayList) even when it is not an “is-a”.',
    problems: ['parking-lot'],
  },
  {
    term: 'Polymorphism', group: 'OOP Basics',
    def: 'One interface, many implementations: code calls the same method and each object responds in its own way.',
    example: 'split.calculate() works for EqualSplit, ExactSplit and PercentSplit.',
    analogy: 'The play button works the same on Spotify, YouTube and a radio app, but each plays differently.',
    more: 'Polymorphism lets you replace long if/else or switch blocks on a “type” field with objects that know their own behaviour. Adding a new type means adding a class, not editing old code.',
    points: ['Runtime polymorphism: method overriding via interfaces/classes', 'Replace switch(type) with polymorphic objects', 'Foundation of Strategy, State and Command patterns'],
    code: `interface Shape { area(): number }
class Circle implements Shape { constructor(private r: number) {} area() { return Math.PI * this.r ** 2 } }
class Rect implements Shape { constructor(private w: number, private h: number) {} area() { return this.w * this.h } }

const shapes: Shape[] = [new Circle(2), new Rect(3, 4)]
const total = shapes.reduce((sum, s) => sum + s.area(), 0)   // no if/else on type`,
    mistake: 'Checking instanceof everywhere instead of putting the behaviour on the class.',
    problems: ['splitwise', 'parking-lot'],
  },
  {
    term: 'Composition over Inheritance', group: 'OOP Basics',
    def: 'Build objects by combining smaller objects (“has-a”) instead of inheriting from big base classes.',
    example: 'A Car has an Engine, rather than Car extends Engine.',
    analogy: 'LEGO: you snap pieces together instead of carving everything from one block.',
    more: 'Composition is flexible: you can swap a part at runtime (electric vs petrol engine) and test parts in isolation. Inheritance locks behaviour at compile time and couples child to parent internals.',
    points: ['Inject collaborators through the constructor', 'Swap behaviour at runtime', 'Avoid “god” base classes'],
    code: `interface Engine { start(): string }
class PetrolEngine implements Engine { start() { return 'vroom' } }
class ElectricEngine implements Engine { start() { return 'hmm' } }

class Car {
  constructor(private engine: Engine) {}     // has-a
  start() { return this.engine.start() }
}
new Car(new ElectricEngine()).start()`,
    mistake: 'Creating BaseService classes with dozens of helpers that every service inherits.',
    problems: ['lru-cache', 'parking-lot'],
  },
  {
    term: 'Interface vs Abstract Class', group: 'OOP Basics',
    def: 'An interface is a pure contract (what methods exist). An abstract class can also hold shared code and state, but a class can extend only one.',
    example: 'interface Notifier vs abstract class BaseRepository with shared save() logic.',
    analogy: 'An interface is a job description; an abstract class is a half-trained employee who already knows some of the job.',
    more: 'In TypeScript a class can implement many interfaces but extend one class. Use interfaces for capabilities (Comparable, Notifier) and abstract classes when several subclasses truly share implementation.',
    points: ['Default to interfaces', 'Abstract class when sharing real code + state', 'TS interfaces disappear at runtime (no instanceof)'],
    code: `interface Notifier { send(to: string, msg: string): Promise<void> }

abstract class Repository<T extends { id: string }> {
  protected items = new Map<string, T>()
  save(item: T) { this.items.set(item.id, item) }      // shared code
  abstract validate(item: T): void                      // each child decides
}`,
    mistake: 'Abstract classes with no shared code: that should just be an interface.',
    problems: [],
  },

  // ---------------- SOLID ----------------
  {
    term: 'Single Responsibility (SRP)', group: 'SOLID',
    def: 'A class should have one reason to change: it does one job.',
    example: 'Split InvoiceService into InvoiceCalculator, InvoiceRepository and InvoiceMailer.',
    analogy: 'A chef cooks; a cashier bills. You don’t want the chef changing the billing system.',
    more: '“One reason to change” means one stakeholder or concern. If a tax rule change and an email-template change both edit the same class, it has two responsibilities and every change risks breaking the other.',
    points: ['Small classes with clear names', 'Separate business logic, persistence and I/O', 'If you need “and” to describe it, split it'],
    code: `// ❌ calculates, saves AND emails
class InvoiceService { create() { /* math */ /* db.save */ /* mailer.send */ } }

// ✅ one job each
class InvoiceCalculator { total(items: { price: number; qty: number }[]) { return items.reduce((s, i) => s + i.price * i.qty, 0) } }
class InvoiceRepository { save(inv: object) { /* db */ } }
class InvoiceMailer { send(inv: object) { /* email */ } }`,
    mistake: 'Splitting so much that every method becomes its own class. Aim for cohesion, not tiny files.',
    problems: ['splitwise'],
  },
  {
    term: 'Open/Closed (OCP)', group: 'SOLID',
    def: 'Code should be open for extension but closed for modification: add new behaviour by adding code, not editing working code.',
    example: 'Add a new PricingStrategy class instead of another else-if in calculateFee().',
    analogy: 'A power strip: plug in a new device without rewiring the house.',
    more: 'Every edit to tested code risks regressions. Design extension points (interfaces, strategies, plugins) where change is expected, like new payment methods, vehicle types or split types.',
    points: ['Use polymorphism instead of switch on type', 'Register new implementations in a map/registry', 'Don’t predict everything: add extension points where change actually happens'],
    code: `interface FeeRule { appliesTo(v: string): boolean; fee(hours: number): number }
const rules: FeeRule[] = [
  { appliesTo: (v) => v === 'BIKE', fee: (h) => 10 * h },
  { appliesTo: (v) => v === 'CAR', fee: (h) => 20 * h },
]
// new vehicle type = push a new rule, calculateFee() never changes
const calculateFee = (v: string, h: number) => rules.find((r) => r.appliesTo(v))!.fee(h)`,
    mistake: 'Adding a new “case” to the same switch in five different files for every new type.',
    problems: ['parking-lot', 'splitwise'],
  },
  {
    term: 'Liskov Substitution (LSP)', group: 'SOLID',
    def: 'A subclass must be usable anywhere its parent is expected without breaking behaviour.',
    example: 'If Bird has fly(), Penguin extends Bird breaks callers. Split into FlyingBird.',
    analogy: 'A replacement phone charger must actually charge the phone, not just fit the socket.',
    more: 'A child that throws “not supported”, ignores inputs or weakens guarantees violates LSP. The fix is usually a better hierarchy or a smaller interface.',
    points: ['Don’t throw NotImplemented in overrides', 'Don’t tighten preconditions or weaken postconditions', 'Square extends Rectangle is the classic violation'],
    code: `interface Bird { eat(): void }
interface FlyingBird extends Bird { fly(): void }

class Sparrow implements FlyingBird { eat() {} fly() {} }
class Penguin implements Bird { eat() {} }   // no fake fly() that throws`,
    mistake: 'Overriding a method just to throw an error because the subclass “can’t do that”.',
    problems: ['parking-lot'],
  },
  {
    term: 'Interface Segregation (ISP)', group: 'SOLID',
    def: 'Prefer many small, specific interfaces over one big one, so classes don’t implement methods they don’t need.',
    example: 'Printer, Scanner and Fax interfaces instead of one MultiFunctionDevice.',
    analogy: 'A TV remote with only the buttons you use, not 80 buttons for features your TV doesn’t have.',
    more: 'Fat interfaces force empty or throwing implementations and create needless coupling: changing one method recompiles and retests every implementer.',
    points: ['Split by client need', 'Classes can implement several small interfaces', 'Pairs well with LSP'],
    code: `interface Printer { print(doc: string): void }
interface Scanner { scan(): string }

class SimplePrinter implements Printer { print(doc: string) {} }
class OfficeMachine implements Printer, Scanner { print(doc: string) {} scan() { return '' } }`,
    mistake: 'One IRepository with 30 methods that every entity must implement.',
    problems: [],
  },
  {
    term: 'Dependency Inversion (DIP)', group: 'SOLID',
    def: 'High-level code should depend on abstractions (interfaces), not concrete classes. Pass dependencies in (dependency injection).',
    example: 'OrderService takes a Notifier interface, so tests pass a fake and production passes SmsNotifier.',
    analogy: 'A wall socket standard: any appliance with the right plug works, the wall doesn’t care which brand.',
    more: 'If OrderService does `new TwilioClient()` inside, you can’t test it without Twilio and can’t switch providers without editing it. Depend on an interface and inject the implementation from outside (constructor injection).',
    points: ['Constructor injection is the simplest DI', 'Makes unit testing easy (inject fakes)', 'NestJS and InversifyJS automate it'],
    code: `interface Notifier { send(to: string, msg: string): Promise<void> }

class OrderService {
  constructor(private notifier: Notifier) {}          // depends on abstraction
  async place(userPhone: string) {
    // …create order
    await this.notifier.send(userPhone, 'Order placed!')
  }
}

class SmsNotifier implements Notifier { async send() { /* Twilio */ } }
const service = new OrderService(new SmsNotifier())
const testService = new OrderService({ send: async () => {} }) // fake in tests`,
    mistake: 'Calling new SomeConcreteClient() deep inside business logic.',
    problems: ['parking-lot', 'splitwise'],
  },

  // ---------------- Creational ----------------
  {
    term: 'Singleton', group: 'Creational Patterns',
    def: 'Ensure a class has only one instance and give a global access point to it.',
    example: 'One database connection pool or config object for the whole app.',
    analogy: 'A country has one president at a time.',
    more: 'In Node.js, a module export is already a singleton because modules are cached. Classic Singletons hide dependencies and make testing hard, so prefer creating one instance at startup and injecting it.',
    points: ['Node module = natural singleton', 'Be careful with shared mutable state', 'Prefer DI of a single instance over getInstance()'],
    code: `class ParkingLot {
  private static instance: ParkingLot | null = null
  private constructor() {}
  static getInstance() {
    if (!ParkingLot.instance) ParkingLot.instance = new ParkingLot()
    return ParkingLot.instance
  }
}

// Node-style alternative: export one instance
export const db = new Pool({ connectionString: process.env.DATABASE_URL })`,
    mistake: 'Using singletons as global variables for request-specific data.',
    problems: ['parking-lot'],
  },
  {
    term: 'Factory Method', group: 'Creational Patterns',
    def: 'Put object creation in one place that decides which class to instantiate, so callers don’t use `new` with if/else everywhere.',
    example: 'VehicleFactory.create("CAR", plate) returns a Car.',
    analogy: 'Ordering at a counter: you say “one large coffee” and the kitchen decides how it is made.',
    more: 'When creation logic depends on input or config, centralising it means one change point when you add a new type, and callers only know the interface.',
    points: ['Return the interface type, not the concrete class', 'Use a map of constructors instead of a long switch', 'Simple Factory is fine for most apps'],
    code: `type Kind = 'EQUAL' | 'EXACT' | 'PERCENT'
const splitters: Record<Kind, () => SplitStrategy> = {
  EQUAL: () => new EqualSplit(),
  EXACT: () => new ExactSplit(),
  PERCENT: () => new PercentSplit(),
}
export const createSplit = (kind: Kind): SplitStrategy => splitters[kind]()`,
    mistake: 'A factory that also contains business logic. Keep it to creation only.',
    problems: ['splitwise', 'parking-lot'],
  },
  {
    term: 'Builder', group: 'Creational Patterns',
    def: 'Build a complex object step by step with readable method chaining, instead of a constructor with ten parameters.',
    example: 'new QueryBuilder().from("users").where("age > 18").limit(10).build()',
    analogy: 'Ordering a Subway sandwich: choose bread, then fillings, then sauce, then build.',
    more: 'Long constructors are easy to call wrong (which boolean was “isAdmin”?). A builder names each step, can validate before building, and returns an immutable result.',
    points: ['Great for configs, HTTP requests, queries, test data', 'Validate in build()', 'Mongoose and Knex query APIs are builders'],
    code: `class HttpRequestBuilder {
  private req: { url?: string; method: string; headers: Record<string, string>; body?: unknown } = { method: 'GET', headers: {} }
  url(u: string) { this.req.url = u; return this }
  method(m: string) { this.req.method = m; return this }
  header(k: string, v: string) { this.req.headers[k] = v; return this }
  json(body: unknown) { this.req.body = body; return this.header('Content-Type', 'application/json') }
  build() { if (!this.req.url) throw new Error('url required'); return { ...this.req } }
}
const req = new HttpRequestBuilder().url('/api/orders').method('POST').json({ id: 1 }).build()`,
    mistake: 'Builders for objects with two fields. Just use an options object.',
    problems: [],
  },

  // ---------------- Structural ----------------
  {
    term: 'Adapter', group: 'Structural Patterns',
    def: 'Wrap an incompatible class so it matches the interface your code expects.',
    example: 'Wrap a legacy SOAP payment client so it implements your PaymentGateway interface.',
    analogy: 'A travel plug adapter: your Indian charger works in a UK socket.',
    more: 'Adapters let you integrate third-party SDKs or old code without spreading their shape through your codebase. When you switch vendors, you write a new adapter and nothing else changes.',
    points: ['One adapter per external system', 'Translate data shapes and errors', 'Pairs with Dependency Inversion'],
    code: `// third-party SDK with an awkward API
class OldSmsSdk { sendMessage(params: { phone_no: string; text_body: string }) { /* … */ } }

interface Notifier { send(to: string, msg: string): Promise<void> }

class OldSmsAdapter implements Notifier {
  constructor(private sdk: OldSmsSdk) {}
  async send(to: string, msg: string) { this.sdk.sendMessage({ phone_no: to, text_body: msg }) }
}`,
    mistake: 'Letting vendor-specific types leak past the adapter.',
    problems: [],
  },
  {
    term: 'Decorator', group: 'Structural Patterns',
    def: 'Add behaviour to an object by wrapping it with another object that has the same interface.',
    example: 'Wrap a Repository with CachingRepository and LoggingRepository.',
    analogy: 'Adding toppings to a pizza: still a pizza, now with extra cheese.',
    more: 'Decorators stack: logging(caching(repo)). Each layer adds one concern without touching the original class. Express middleware follows the same idea.',
    points: ['Same interface in and out', 'Stack in any order', 'Good for caching, logging, retries, metrics'],
    code: `interface UserRepo { findById(id: string): Promise<User | null> }

class CachedUserRepo implements UserRepo {
  private cache = new Map<string, User | null>()
  constructor(private inner: UserRepo) {}
  async findById(id: string) {
    if (!this.cache.has(id)) this.cache.set(id, await this.inner.findById(id))
    return this.cache.get(id)!
  }
}
const repo: UserRepo = new CachedUserRepo(new MongoUserRepo())`,
    mistake: 'Confusing it with TypeScript @decorators. Related idea, different mechanism.',
    problems: ['lru-cache'],
  },
  {
    term: 'Facade', group: 'Structural Patterns',
    def: 'Give a simple front door to a complex subsystem.',
    example: 'checkout() calls inventory, pricing, payment and notification services in order.',
    analogy: 'A travel agent books flights, hotels and cabs so you make one call.',
    more: 'Controllers become thin: they call one facade method. The facade coordinates the subsystems; the subsystems stay independent and reusable.',
    points: ['Simplifies callers', 'Doesn’t hide the subsystems from code that needs them', 'Often the “service layer” in Express apps'],
    code: `class CheckoutFacade {
  constructor(private inventory: Inventory, private pay: PaymentGateway, private notify: Notifier) {}
  async checkout(cart: Cart, user: User) {
    await this.inventory.reserve(cart.items)
    const res = await this.pay.charge(cart.id, cart.totalPaise)
    if (!res.ok) { await this.inventory.release(cart.items); throw new Error('Payment failed') }
    await this.notify.send(user.phone, 'Order confirmed')
    return res.txnId
  }
}`,
    mistake: 'Turning the facade into a god class that holds all business rules.',
    problems: ['parking-lot'],
  },

  // ---------------- Behavioral ----------------
  {
    term: 'Strategy', group: 'Behavioral Patterns',
    def: 'Define a family of algorithms behind one interface and pick one at runtime.',
    example: 'Split an expense equally, by exact amounts or by percentage.',
    analogy: 'Google Maps lets you choose car, bike or walking. Same destination, different route algorithm.',
    more: 'Strategy removes if/else on the algorithm type and makes each algorithm testable on its own. It is the most-used pattern in LLD interviews: pricing rules, parking spot selection, payment methods, sorting.',
    points: ['One interface, many interchangeable classes', 'Choose via factory or config', 'Open/Closed in action'],
    code: `interface SpotStrategy { pick(spots: Spot[], v: Vehicle): Spot | undefined }

class NearestFirst implements SpotStrategy {
  pick(spots: Spot[], v: Vehicle) { return spots.find((s) => s.isFree && s.fits(v)) }
}
class SmallestFit implements SpotStrategy {
  pick(spots: Spot[], v: Vehicle) {
    return spots.filter((s) => s.isFree && s.fits(v)).sort((a, b) => a.capacity - b.capacity)[0]
  }
}`,
    mistake: 'Using Strategy where a plain function parameter would do. In TS a function type is a valid strategy.',
    problems: ['parking-lot', 'splitwise'],
  },
  {
    term: 'Observer', group: 'Behavioral Patterns',
    def: 'When one object changes, it notifies all subscribers automatically.',
    example: 'When a parking spot frees up, the display board and the mobile app both update.',
    analogy: 'Subscribing to a YouTube channel: you get notified on every new video.',
    more: 'The subject keeps a list of observers and calls them on change, without knowing what they do. Node’s EventEmitter, DOM events and RxJS are all observers.',
    points: ['Decouples the source from reactions', 'Remember to unsubscribe (memory leaks)', 'Pub/sub is the distributed version'],
    code: `import { EventEmitter } from 'node:events'

class ParkingFloor extends EventEmitter {
  free = 10
  park() { this.free--; this.emit('changed', this.free) }
  leave() { this.free++; this.emit('changed', this.free) }
}

const floor = new ParkingFloor()
floor.on('changed', (n) => console.log('Display board:', n, 'free'))
floor.on('changed', (n) => n === 0 && console.log('Push: floor full'))`,
    mistake: 'Observers that throw and break the subject’s loop. Catch errors per listener.',
    problems: ['parking-lot'],
  },
  {
    term: 'State', group: 'Behavioral Patterns',
    def: 'An object changes its behaviour when its internal state changes, with each state as its own class.',
    example: 'A vending machine behaves differently in Idle, HasMoney and Dispensing states.',
    analogy: 'A traffic light: what “next” does depends on whether it is red, green or yellow.',
    more: 'Instead of every method checking `if (status === ...)`, each state class implements the actions and decides the next state. Invalid transitions become impossible or explicit.',
    points: ['Great for orders, payments, bookings, elevators', 'Make allowed transitions explicit', 'A transition table is a lighter alternative'],
    code: `type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
const transitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}
function move(from: OrderStatus, to: OrderStatus) {
  if (!transitions[from].includes(to)) throw new Error(from + ' → ' + to + ' not allowed')
  return to
}`,
    mistake: 'Boolean flags (isPaid, isShipped, isCancelled) that can end up in impossible combinations.',
    problems: [],
  },
  {
    term: 'Command', group: 'Behavioral Patterns',
    def: 'Wrap a request as an object, so you can queue it, log it, retry it or undo it.',
    example: 'Text editor actions with undo/redo; job queues.',
    analogy: 'A restaurant order slip: written once, can be queued, handed to any cook, or cancelled.',
    more: 'Each command has execute() and optionally undo(). A history stack gives you undo/redo; a queue gives you background processing. BullMQ jobs are commands.',
    points: ['Enables undo/redo', 'Commands can be serialised to a queue', 'Separates “what to do” from “when/who”'],
    code: `interface Command { execute(): void; undo(): void }

class AddExpense implements Command {
  constructor(private ledger: Ledger, private e: Expense) {}
  execute() { this.ledger.add(this.e) }
  undo() { this.ledger.remove(this.e.id) }
}

const history: Command[] = []
function run(c: Command) { c.execute(); history.push(c) }
function undo() { history.pop()?.undo() }`,
    mistake: 'Commands that hold huge state snapshots instead of the minimal data needed to undo.',
    problems: ['splitwise'],
  },

  // ---------------- UML ----------------
  {
    term: 'Class Relationships (UML)', group: 'UML & Relationships',
    def: 'Association (uses), aggregation (has, can live alone), composition (owns, dies with it), inheritance (is-a), realization (implements).',
    example: 'ParkingLot ◆ composes Floors; Floor ◇ aggregates Spots; Car ▷ extends Vehicle.',
    analogy: 'A university composes departments (no university, no departments); a department aggregates professors (they can move elsewhere).',
    more: 'In interviews, draw classes as boxes with name, key fields and methods, then connect them. Getting composition vs aggregation right shows you have thought about lifecycles.',
    points: ['Composition ◆: part cannot exist without the whole', 'Aggregation ◇: part can exist alone', 'Inheritance ▷ solid line; implements ▷ dashed line', 'Show multiplicity: 1, 0..1, *'],
    code: `class ParkingLot {
  private floors: Floor[] = [new Floor(1), new Floor(2)]   // composition: created and owned here
}
class Team {
  constructor(private members: User[]) {}                  // aggregation: users exist independently
}`,
    mistake: 'Drawing every relationship as a plain line with no direction or multiplicity.',
    problems: ['parking-lot', 'lru-cache', 'splitwise'],
  },
  {
    term: 'How to Approach an LLD Interview', group: 'UML & Relationships',
    def: 'Clarify requirements → find entities (nouns) → define behaviours (verbs) → draw relationships → pick patterns → write core code → handle edge cases.',
    example: 'Parking lot: nouns = Lot, Floor, Spot, Vehicle, Ticket; verbs = park, unpark, pay.',
    analogy: 'Building a house: rooms and their purpose first, then walls, then wiring.',
    more: 'Interviewers grade structure more than syntax. Spend 5 minutes on requirements and entities before any code. Say which SOLID principle or pattern you are applying and why.',
    points: ['Nouns → classes, verbs → methods', 'Start with interfaces for things that will vary', 'Keep money in integer paise/cents', 'Mention concurrency (two cars, one spot)'],
    code: `// 45-minute plan
// 05 min  requirements + constraints (ask!)
// 05 min  entities, enums, relationships (draw boxes)
// 05 min  key interfaces + patterns
// 25 min  core code: the main flow end to end
// 05 min  edge cases, concurrency, extensions`,
    mistake: 'Starting to code immediately and discovering missing entities halfway through.',
    problems: ['parking-lot', 'lru-cache', 'splitwise'],
  },

  // ---------------- Concurrency ----------------
  {
    term: 'Race Conditions & Locks', group: 'Concurrency',
    def: 'When two operations read and write shared data at the same time, the result depends on timing. Locks make the critical section run one at a time.',
    example: 'Two cars are assigned the same free spot because both checked “isFree” before either marked it taken.',
    analogy: 'Two people booking the last seat on a bus at the same second.',
    more: 'Node.js runs JS on one thread, but `await` gives other requests a chance to run in between, so check-then-act across an await is still racy. Across multiple servers you need database-level atomicity or a distributed lock.',
    points: ['Make check-and-update atomic (one DB update with a condition)', 'In-process: a mutex (async-mutex) around the critical section', 'Across servers: SELECT … FOR UPDATE, unique constraints, or Redis locks'],
    code: `// atomic claim in MongoDB: only one request can win the spot
const spot = await Spot.findOneAndUpdate(
  { floor: 2, size: 'MEDIUM', isFree: true },
  { $set: { isFree: false, plate } },
  { new: true },
)
if (!spot) throw new Error('No free spot')`,
    mistake: 'Reading a value, awaiting something, then writing based on the stale read.',
    problems: ['parking-lot', 'lru-cache'],
  },
  {
    term: 'Optimistic vs Pessimistic Locking', group: 'Concurrency',
    def: 'Pessimistic: lock the row before changing it. Optimistic: don’t lock; check a version number when saving and retry if someone else changed it.',
    example: 'Hotel room booking: optimistic locking with a version column.',
    analogy: 'Pessimistic: lock the bathroom door. Optimistic: knock-free, but check nobody’s inside before you sit.',
    more: 'Optimistic locking is cheaper when conflicts are rare (most web apps). Pessimistic locking is better under heavy contention (flash sales on one item) because retries would pile up.',
    points: ['Optimistic: UPDATE … WHERE id = ? AND version = ?', 'Pessimistic: SELECT … FOR UPDATE inside a transaction', 'Mongoose has built-in optimisticConcurrency'],
    code: `-- optimistic: succeeds only if nobody updated since we read version 7
UPDATE rooms SET booked = true, version = version + 1
WHERE id = 42 AND version = 7;
-- 0 rows updated -> someone else won, reload and retry`,
    mistake: 'Holding pessimistic locks while calling slow external APIs.',
    problems: [],
  },
  {
    term: 'Producer–Consumer', group: 'Concurrency',
    def: 'Producers put work into a bounded buffer; consumers take it out at their own pace.',
    example: 'An API pushes image-resize jobs; a pool of workers processes them.',
    analogy: 'A conveyor belt between packers and loaders.',
    more: 'The buffer decouples speed differences. When it is full, producers wait or reject (backpressure); when it is empty, consumers wait. In distributed systems the buffer is a message queue.',
    points: ['Always bound the buffer', 'Control consumer concurrency', 'Same idea as message queues in HLD'],
    code: `// limit concurrent work with p-limit
import pLimit from 'p-limit'
const limit = pLimit(5)                          // 5 consumers
await Promise.all(images.map((img) => limit(() => resize(img))))`,
    mistake: 'Unbounded in-memory arrays as queues that grow until the process runs out of memory.',
    problems: [],
  },
]
