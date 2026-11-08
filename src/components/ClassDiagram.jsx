import { Figure } from './Diagrams'

// UML class diagram rendered as SVG.
// links: inherits (solid + hollow triangle), implements (dashed + hollow triangle),
// composition (filled diamond at `from`), aggregation (hollow diamond at `from`),
// association (solid arrow), uses (dashed arrow).
const ROW = 17
const HEAD = 34

const boxH = (c) => HEAD + (c.fields.length ? c.fields.length * ROW + 10 : 0) + (c.methods.length ? c.methods.length * ROW + 10 : 0) + (c.fields.length || c.methods.length ? 0 : 0)

function rect(c) {
  const w = c.w ?? 200
  return { x: c.x, y: c.y, w, h: Math.max(boxH(c), 40) }
}

// point on rectangle border in the direction of (tx, ty)
function edgePoint(r, tx, ty) {
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const dx = tx - cx
  const dy = ty - cy
  const sx = dx === 0 ? Infinity : (r.w / 2) / Math.abs(dx)
  const sy = dy === 0 ? Infinity : (r.h / 2) / Math.abs(dy)
  const s = Math.min(sx, sy)
  return { x: cx + dx * s, y: cy + dy * s }
}

const STEREO = { interface: '«interface»', abstract: '«abstract»', enum: '«enum»' }

export default function ClassDiagram({ spec, caption }) {
  const byName = Object.fromEntries(spec.classes.map((c) => [c.name, rect(c)]))
  return (
    <Figure caption={caption ?? 'fig · class diagram: ◆ composition, ◇ aggregation, ▷ inherits / implements (dashed), → uses'}>
      <svg viewBox={`0 0 ${spec.w} ${spec.h}`} className="svg uml">
        <defs>
          <marker id="uml-tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1 1 L11 6 L1 11 z" className="uml-hollow" /></marker>
          <marker id="uml-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M1 1 L9 5 L1 9" className="uml-open" /></marker>
          <marker id="uml-dia-fill" viewBox="0 0 14 10" refX="1" refY="5" markerWidth="14" markerHeight="10" orient="auto"><path d="M1 5 L7 1 L13 5 L7 9 z" className="uml-filled" /></marker>
          <marker id="uml-dia" viewBox="0 0 14 10" refX="1" refY="5" markerWidth="14" markerHeight="10" orient="auto"><path d="M1 5 L7 1 L13 5 L7 9 z" className="uml-hollow" /></marker>
        </defs>

        {spec.links.map((l, i) => {
          const a = byName[l.from]
          const b = byName[l.to]
          if (!a || !b) return null
          const p1 = edgePoint(a, b.x + b.w / 2, b.y + b.h / 2)
          const p2 = edgePoint(b, a.x + a.w / 2, a.y + a.h / 2)
          const dashed = l.type === 'implements' || l.type === 'uses'
          const props = {
            inherits: { markerEnd: 'url(#uml-tri)' },
            implements: { markerEnd: 'url(#uml-tri)' },
            association: { markerEnd: 'url(#uml-arrow)' },
            uses: { markerEnd: 'url(#uml-arrow)' },
            composition: { markerStart: 'url(#uml-dia-fill)', markerEnd: 'url(#uml-arrow)' },
            aggregation: { markerStart: 'url(#uml-dia)', markerEnd: 'url(#uml-arrow)' },
          }[l.type]
          return (
            <g key={i}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={`uml-line ${dashed ? 'dashed' : ''} uml-${l.type}`} {...props} />
              {l.label && (
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} className="uml-label" textAnchor="middle">{l.label}</text>
              )}
            </g>
          )
        })}

        {spec.classes.map((c) => {
          const r = byName[c.name]
          const fieldsTop = r.y + HEAD
          const methodsTop = fieldsTop + (c.fields.length ? c.fields.length * ROW + 10 : 0)
          return (
            <g key={c.name} className={`uml-class uml-${c.kind ?? 'class'}`}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="8" className="uml-box" />
              <rect x={r.x} y={r.y} width={r.w} height={HEAD - 4} rx="8" className="uml-head" />
              {STEREO[c.kind] && <text x={r.x + r.w / 2} y={r.y + 12} className="uml-stereo" textAnchor="middle">{STEREO[c.kind]}</text>}
              <text x={r.x + r.w / 2} y={r.y + (STEREO[c.kind] ? 25 : 20)} className="uml-name" textAnchor="middle">{c.name}</text>
              {c.fields.length > 0 && <line x1={r.x} x2={r.x + r.w} y1={fieldsTop - 4} y2={fieldsTop - 4} className="uml-sep" />}
              {c.fields.map((f, i) => <text key={f} x={r.x + 10} y={fieldsTop + 10 + i * ROW} className="uml-member">{f}</text>)}
              {c.methods.length > 0 && <line x1={r.x} x2={r.x + r.w} y1={methodsTop - 4} y2={methodsTop - 4} className="uml-sep" />}
              {c.methods.map((m, i) => <text key={m} x={r.x + 10} y={methodsTop + 10 + i * ROW} className="uml-member uml-method">{m}</text>)}
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
