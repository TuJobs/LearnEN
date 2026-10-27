import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

/**
 * Small hand-rolled SVG charts (no chart library): thin marks, 4px rounded data-ends,
 * hairline grid, hover/focus tooltips (arrow keys move between points) and a table twin.
 */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

const NICE_STEPS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10]

/** Rounds an axis maximum up to a clean number whose half is clean too (150 → ticks 0/75/150). */
export function niceMax(v: number): number {
  if (v <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(v))
  return NICE_STEPS.find((s) => s * p >= v)! * p
}

const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}K` : String(Math.round(v)))

/** Column path: 4px rounded data-end, square at the baseline. */
function columnPath(x: number, top: number, w: number, h: number, r: number) {
  r = Math.min(r, h, w / 2)
  const base = top + h
  return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`
}

const FRAME = { ml: 36, mr: 10, mt: 20, mb: 24 }

/** Thins x-axis labels so they never collide: keep every k-th, counted from the anchored end. */
function showTick(i: number, count: number, band: number, anchor: 'start' | 'end') {
  const every = Math.max(1, Math.ceil(38 / band))
  return (anchor === 'start' ? i : count - 1 - i) % every === 0
}

/** Shared pointer + keyboard handling: the active index follows the pointer or the arrow keys. */
function useActive(count: number, band: number) {
  const [active, setActive] = useState<number | null>(null)
  return {
    active,
    handlers: {
      tabIndex: 0,
      onPointerMove(e: PointerEvent<SVGSVGElement>) {
        const i = Math.floor((e.clientX - e.currentTarget.getBoundingClientRect().left - FRAME.ml) / band)
        setActive(i >= 0 && i < count ? i : null)
      },
      onPointerLeave: () => setActive(null),
      onFocus: () => setActive(count - 1),
      onBlur: () => setActive(null),
      onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        const step = e.key === 'ArrowRight' ? 1 : -1
        setActive((a) => Math.min(count - 1, Math.max(0, (a ?? count - 1) + step)))
      },
    },
  }
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  return (
    <div className="viz-tip" style={{ left: Math.min(width - 70, Math.max(70, x)), top: y }} aria-live="polite">
      {children}
    </div>
  )
}

export interface ColumnDatum {
  key: string
  label: string
  value: number
}

export function ColumnChart({
  data,
  title,
  unit,
  tick,
  labeled = [],
  goal,
  anchor = 'end',
  height = 190,
}: {
  data: ColumnDatum[]
  title: string
  unit: string
  /** Axis label under bar i, or null to leave the slot empty */
  tick: (d: ColumnDatum, i: number) => string | null
  /** Bars whose value is written on the cap (label selectively, never every bar) */
  labeled?: number[]
  goal?: { value: number; label: string }
  /** Which end of the axis always keeps its tick label when labels must be thinned */
  anchor?: 'start' | 'end'
  height?: number
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const { ml, mr, mt, mb } = FRAME
  const plotW = Math.max(0, width - ml - mr)
  const plotH = height - mt - mb
  const max = niceMax(Math.max(1, goal?.value ?? 0, ...data.map((d) => d.value)))
  const band = plotW / data.length
  const barW = Math.min(24, band * 0.68)
  const y = (v: number) => mt + plotH - (v / max) * plotH
  const { active, handlers } = useActive(data.length, band)
  const a = active === null ? null : data[active]

  return (
    <div className="viz" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="group" aria-label={title} {...handlers}>
          {active !== null && <rect className="viz-band" x={ml + active * band} y={mt} width={band} height={plotH} rx={4} />}
          {[0, max / 2, max].map((t) => (
            <g key={t}>
              <line className="viz-grid" x1={ml} x2={width - mr} y1={y(t)} y2={y(t)} />
              <text className="viz-tick" x={ml - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {compact(t)}
              </text>
            </g>
          ))}
          {goal && (
            <g>
              <line className="viz-goal" x1={ml} x2={width - mr} y1={y(goal.value)} y2={y(goal.value)} />
              <text className="viz-tick viz-halo" x={width - mr} y={y(goal.value) - 5} textAnchor="end">
                {goal.label}
              </text>
            </g>
          )}
          {data.map((d, i) => {
            const cx = ml + i * band + band / 2
            const label = showTick(i, data.length, band, anchor) && tick(d, i)
            return (
              <g key={d.key}>
                {d.value > 0 && (
                  <path
                    className={`viz-bar ${active === i ? 'active' : ''}`}
                    d={columnPath(cx - barW / 2, y(d.value), barW, (d.value / max) * plotH, 4)}
                  />
                )}
                {labeled.includes(i) && d.value > 0 && (
                  <text className="viz-value" x={cx} y={y(d.value) - 6} textAnchor="middle">
                    {d.value}
                  </text>
                )}
                {label && (
                  <text className="viz-tick" x={cx} y={height - 6} textAnchor="middle">
                    {label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      {a && active !== null && (
        <Tooltip x={ml + active * band + band / 2} y={y(a.value) - 10} width={width}>
          <b>
            {a.value} {unit}
          </b>
          <span>{a.label}</span>
        </Tooltip>
      )}
    </div>
  )
}

export interface LineDatum {
  key: string
  label: string
  value: number | null
}

export function LineChart({
  data,
  title,
  max,
  format,
  tick,
  anchor = 'end',
  height = 190,
}: {
  data: LineDatum[]
  title: string
  max: number
  format: (v: number) => string
  tick: (d: LineDatum, i: number) => string | null
  anchor?: 'start' | 'end'
  height?: number
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const { ml, mr, mt, mb } = FRAME
  const plotW = Math.max(0, width - ml - mr)
  const plotH = height - mt - mb
  const band = plotW / data.length
  const x = (i: number) => ml + i * band + band / 2
  const y = (v: number) => mt + plotH - (v / max) * plotH
  const { active, handlers } = useActive(data.length, band)

  // Consecutive non-empty days form one segment; gaps stay gaps instead of inventing values.
  const runs: number[][] = []
  data.forEach((d, i) => {
    if (d.value === null) return
    const last = runs.at(-1)
    if (last && last.at(-1) === i - 1) last.push(i)
    else runs.push([i])
  })
  const lastIndex = runs.at(-1)?.at(-1)
  const a = active === null ? null : data[active]

  return (
    <div className="viz" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="group" aria-label={title} {...handlers}>
          {[0, max / 2, max].map((t) => (
            <g key={t}>
              <line className="viz-grid" x1={ml} x2={width - mr} y1={y(t)} y2={y(t)} />
              <text className="viz-tick" x={ml - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {format(t)}
              </text>
            </g>
          ))}
          {runs.map((run) => {
            const pts = run.map((i) => `${x(i)},${y(data[i].value!)}`)
            return (
              <g key={run[0]}>
                {run.length > 1 ? (
                  <path className="viz-line" d={`M${pts.join('L')}`} />
                ) : (
                  <circle className="viz-dot" cx={x(run[0])} cy={y(data[run[0]].value!)} r={3} />
                )}
              </g>
            )
          })}
          {data.map((d, i) => {
            const label = showTick(i, data.length, band, anchor) && tick(d, i)
            return (
              label && (
                <text key={d.key} className="viz-tick" x={x(i)} y={height - 6} textAnchor="middle">
                  {label}
                </text>
              )
            )
          })}
          {active !== null && <line className="viz-crosshair" x1={x(active)} x2={x(active)} y1={mt} y2={mt + plotH} />}
          {lastIndex !== undefined && active === null && (
            <circle className="viz-dot ring" cx={x(lastIndex)} cy={y(data[lastIndex].value!)} r={4} />
          )}
          {a?.value != null && active !== null && <circle className="viz-dot ring" cx={x(active)} cy={y(a.value)} r={4} />}
        </svg>
      )}
      {a && active !== null && (
        <Tooltip x={x(active)} y={a.value === null ? mt + plotH / 2 : y(a.value) - 10} width={width}>
          <b>{a.value === null ? 'Không có dữ liệu' : format(a.value)}</b>
          <span>{a.label}</span>
        </Tooltip>
      )}
    </div>
  )
}

export interface Segment {
  key: string
  label: string
  value: number
  /** CSS custom property names for the fill and the label ink drawn on it */
  color: string
  ink: string
}

/** One 100% bar for part-to-whole of a few ordered classes, with a 2px surface gap between parts. */
export function StackedBar({ segments, title, unit }: { segments: Segment[]; title: string; unit: string }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const clipId = `clip${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const parts = segments.filter((s) => s.value > 0)
  const total = parts.reduce((sum, s) => sum + s.value, 0)
  const h = 30
  const gap = 2
  const avail = Math.max(0, width - gap * (parts.length - 1))
  let cursor = 0
  const geo = parts.map((s) => {
    const w = (s.value / total) * avail
    const g = { ...s, x: cursor, w }
    cursor += w + gap
    return g
  })
  const a = active === null ? null : geo[active]

  return (
    <div className="viz" ref={ref}>
      {width > 0 && total > 0 && (
        <svg
          width={width}
          height={h}
          role="group"
          aria-label={title}
          tabIndex={0}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(0)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
            e.preventDefault()
            setActive((i) => Math.min(geo.length - 1, Math.max(0, (i ?? 0) + (e.key === 'ArrowRight' ? 1 : -1))))
          }}
        >
          <defs>
            <clipPath id={clipId}>
              <rect width={width} height={h} rx={4} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {geo.map((s, i) => (
              <rect
                key={s.key}
                className={`viz-seg ${active === i ? 'active' : ''}`}
                x={s.x}
                width={s.w}
                height={h}
                style={{ fill: `var(${s.color})` }}
                onPointerEnter={() => setActive(i)}
              />
            ))}
          </g>
          {geo.map(
            (s) =>
              s.w >= String(s.value).length * 8 + 16 && (
                <text key={s.key} className="viz-seg-label" x={s.x + s.w / 2} y={h / 2} dy="0.35em" textAnchor="middle" style={{ fill: `var(${s.ink})` }}>
                  {s.value}
                </text>
              ),
          )}
        </svg>
      )}
      {a && (
        <Tooltip x={a.x + a.w / 2} y={-8} width={width}>
          <b>
            {a.value} {unit} · {Math.round((a.value / total) * 100)}%
          </b>
          <span>{a.label}</span>
        </Tooltip>
      )}
      <div className="viz-legend">
        {segments.map((s) => (
          <span key={s.key}>
            <i style={{ background: `var(${s.color})` }} />
            {s.label} <b>{s.value}</b>
          </span>
        ))}
      </div>
    </div>
  )
}

/** The table twin every chart ships with, so no value is reachable only by hovering. */
export function ChartTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="viz-table">
      <summary>Xem dạng bảng</summary>
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
