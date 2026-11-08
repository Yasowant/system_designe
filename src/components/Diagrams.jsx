// Hand-drawn SVG diagrams. Colours come from CSS variables, so they work in light and dark mode.
// Animations use SVG <animate>/<animateMotion> and pause automatically when the user prefers reduced motion (see CSS).

export function Figure({ caption, children }) {
  return (
    <figure className="figure">
      {children}
      {caption && <figcaption className="mono tiny muted">{caption}</figcaption>}
    </figure>
  )
}

// Fixed window edge problem: 5 at the end of window 1 + 5 at the start of window 2.
export function EdgeBurstDiagram() {
  const dots = (x0, n, cls) =>
    Array.from({ length: n }, (_, i) => <circle key={cls + i} cx={x0 + i * 14} cy={70} r={5} className={cls} />)
  return (
    <Figure caption="fig · fixed window edge burst: 10 requests pass within ~2 s even though the limit is 5 / 10 s">
      <svg viewBox="0 0 640 150" className="svg">
        <line x1="20" y1="100" x2="620" y2="100" className="axis" />
        <line x1="320" y1="30" x2="320" y2="110" className="dash" />
        <text x="170" y="128" className="lbl" textAnchor="middle">window 0–10 s · count 5/5</text>
        <text x="470" y="128" className="lbl" textAnchor="middle">window 10–20 s · count 5/5</text>
        <text x="320" y="24" className="lbl" textAnchor="middle">reset at 10 s</text>
        {dots(250, 5, 'dot-ok')}
        {dots(326, 5, 'dot-ok')}
        <rect x="240" y="52" width="160" height="36" rx="8" className="hl">
          <animate attributeName="opacity" values=".15;.5;.15" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x="320" y="48" className="lbl alt" textAnchor="middle">10 requests in 2 s ⚠️</text>
      </svg>
    </Figure>
  )
}

// Race condition when two gateways read-modify-write the same counter.
export function RaceDiagram() {
  return (
    <Figure caption="fig · race condition: both gateways read 4, both write 5. Two requests pass but the counter only rose by 1">
      <svg viewBox="0 0 640 230" className="svg">
        <rect x="20" y="20" width="130" height="44" rx="10" className="box" />
        <text x="85" y="47" className="lbl" textAnchor="middle">Gateway A</text>
        <rect x="20" y="160" width="130" height="44" rx="10" className="box" />
        <text x="85" y="187" className="lbl" textAnchor="middle">Gateway B</text>
        <rect x="470" y="88" width="150" height="54" rx="10" className="box accent-box" />
        <text x="545" y="112" className="lbl" textAnchor="middle">Redis</text>
        <text x="545" y="130" className="lbl mono-lbl" textAnchor="middle">counter = 4 → 5</text>

        <path id="ra" d="M150 42 C 300 42, 380 100, 470 105" className="wire" />
        <path id="rb" d="M150 182 C 300 182, 380 130, 470 125" className="wire" />
        <text x="290" y="36" className="lbl small-lbl">GET → 4, SET 5</text>
        <text x="290" y="200" className="lbl small-lbl">GET → 4, SET 5</text>
        <circle r="6" className="dot-ok"><animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#ra" /></animateMotion></circle>
        <circle r="6" className="dot-ok"><animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#rb" /></animateMotion></circle>
        <text x="320" y="118" className="lbl bad-lbl" textAnchor="middle">limit 5 → 6th request slips through</text>
      </svg>
    </Figure>
  )
}

// Distributed limiter: many gateways share one atomic store.
export function DistributedDiagram() {
  const gws = [50, 115, 180]
  return (
    <Figure caption="fig · every gateway checks the same Redis with one atomic Lua script, so the limit holds across all servers">
      <svg viewBox="0 0 720 250" className="svg">
        <rect x="10" y="100" width="90" height="44" rx="10" className="box" />
        <text x="55" y="127" className="lbl" textAnchor="middle">Clients</text>
        {gws.map((y, i) => (
          <g key={y}>
            <path id={`c${i}`} d={`M100 122 C 140 122, 160 ${y + 22}, 200 ${y + 22}`} className="wire" />
            <rect x="200" y={y} width="130" height="44" rx="10" className="box" />
            <text x="265" y={y + 27} className="lbl" textAnchor="middle">Gateway {i + 1}</text>
            <path id={`r${i}`} d={`M330 ${y + 22} C 380 ${y + 22}, 390 122, 430 122`} className="wire" />
            <circle r="5" className="dot-ok">
              <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite"><mpath href={`#c${i}`} /></animateMotion>
            </circle>
            <circle r="5" className="dot-alt">
              <animateMotion dur="1.8s" begin={`${i * 0.6 + 0.9}s`} repeatCount="indefinite"><mpath href={`#r${i}`} /></animateMotion>
            </circle>
          </g>
        ))}
        <rect x="430" y="92" width="130" height="60" rx="10" className="box accent-box" />
        <text x="495" y="118" className="lbl" textAnchor="middle">Redis</text>
        <text x="495" y="137" className="lbl small-lbl" textAnchor="middle">EVAL limiter.lua</text>
        <path d="M560 110 L 620 70" className="wire" />
        <path d="M560 134 L 620 180" className="wire bad-wire" />
        <text x="626" y="68" className="lbl good-lbl">allow → API</text>
        <text x="626" y="186" className="lbl bad-lbl">429</text>
      </svg>
    </Figure>
  )
}

export const DIAGRAMS = { race: RaceDiagram, distributed: DistributedDiagram, edge: EdgeBurstDiagram }
