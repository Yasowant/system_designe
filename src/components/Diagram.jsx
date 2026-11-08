import { useId } from 'react'
import { Figure } from './Diagrams'

// Data-driven animated architecture diagram.
// spec = {
//   w, h, caption,
//   nodes: [{ id, x, y, w?, h?, label, sub?, tone?: 'accent' | 'alt' | 'blue' | 'bad' | 'good' }],
//   edges: [{ from, to, label?, tone?, dur?, delay?, dashed?, noDot?, back? }],
// }
// x / y are the CENTER of each box.

const sideP = (n, toward) => {
  const dx = toward.x - n.x
  const dy = toward.y - n.y
  const hw = (n.w ?? 130) / 2
  const hh = (n.h ?? 46) / 2
  if (Math.abs(dx) / hw >= Math.abs(dy) / hh) return { x: n.x + Math.sign(dx) * hw, y: n.y, horiz: true }
  return { x: n.x, y: n.y + Math.sign(dy) * hh, horiz: false }
}

export default function Diagram({ spec }) {
  const uid = useId().replace(/:/g, '')
  const byId = Object.fromEntries(spec.nodes.map((n) => [n.id, n]))
  return (
    <Figure caption={spec.caption}>
      <svg viewBox={`0 0 ${spec.w ?? 720} ${spec.h ?? 260}`} className="svg">
        {spec.edges.map((e, i) => {
          const a = byId[e.from]
          const b = byId[e.to]
          const p1 = sideP(a, b)
          const p2 = sideP(b, a)
          const off = e.back ? 8 : 0 // parallel return path
          const c = p1.horiz
            ? `C ${(p1.x + p2.x) / 2} ${p1.y + off}, ${(p1.x + p2.x) / 2} ${p2.y + off}`
            : `C ${p1.x + off} ${(p1.y + p2.y) / 2}, ${p2.x + off} ${(p1.y + p2.y) / 2}`
          const d = `M ${p1.x + (p1.horiz ? 0 : off)} ${p1.y + (p1.horiz ? off : 0)} ${c} ${p2.x + (p2.horiz ? 0 : off)} ${p2.y + (p2.horiz ? off : 0)}`
          const id = `${uid}e${i}`
          const mx = (p1.x + p2.x) / 2
          const my = (p1.y + p2.y) / 2 + off
          return (
            <g key={id}>
              <path id={id} d={d} className={`wire ${e.tone ? `wire-${e.tone}` : ''}`} markerEnd={`url(#${uid}arrow)`} />
              {e.label && (
                <text x={mx} y={my - 8} className="lbl small-lbl edge-lbl" textAnchor="middle">{e.label}</text>
              )}
              {!e.noDot && (
                <circle r="5" className={`dot-${e.tone ?? 'alt'}`}>
                  <animateMotion dur={`${e.dur ?? 2}s`} begin={`${e.delay ?? i * 0.35}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                    <mpath href={`#${id}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          )
        })}
        {spec.nodes.map((n) => {
          const w = n.w ?? 130
          const h = n.h ?? 46
          return (
            <g key={n.id}>
              <rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx="10" className={`box ${n.tone ? `box-${n.tone}` : ''}`} />
              <text x={n.x} y={n.sub ? n.y - 3 : n.y + 5} className="lbl" textAnchor="middle">{n.label}</text>
              {n.sub && <text x={n.x} y={n.y + 13} className="lbl small-lbl" textAnchor="middle">{n.sub}</text>}
            </g>
          )
        })}
        <defs>
          <marker id={`${uid}arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="arrow-head" />
          </marker>
        </defs>
      </svg>
    </Figure>
  )
}
