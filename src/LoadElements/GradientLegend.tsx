import React from 'react'
import { GradientColor } from '../types'

interface HslColor { h: number; s: number; l: number }

/**
 * Generates N CSS HSL color stops along the *larger* arc of the hue wheel,
 * interpolating S and L linearly.
 */
function buildLargeArcStops(low: HslColor, high: HslColor, n = 24): string {
  const arcUp  = ((high.h - low.h) + 360) % 360
  const arcDown = 360 - arcUp
  const useCCW  = arcDown > arcUp
  const arcLen  = useCCW ? arcDown : arcUp
  const step    = arcLen / (n - 1)

  return Array.from({ length: n }, (_, i) => {
    const t  = i / (n - 1)
    const dh = step * i
    const h  = useCCW ? ((low.h - dh) + 360) % 360 : (low.h + dh) % 360
    const s  = low.s + (high.s - low.s) * t
    const l  = low.l + (high.l - low.l) * t
    return `hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%)`
  }).join(', ')
}

/** Format a number for a tick label — no trailing zeros, max 4 significant digits */
function fmtTick(v: number): string {
  if (Number.isInteger(v)) {return String(v)}
  const s = v.toPrecision(4)
  return String(parseFloat(s))
}

interface Props {
  gc: GradientColor;
  inline?: boolean;
}

export default function GradientLegend({ gc, inline = false }: Props) {
  const low  = gc.lowvaluegradientcolor  || { h: 238, s: 94, l: 50 }
  const high = gc.highvaluegradientcolor || { h: 13,  s: 94, l: 50 }

  const lowVal   = parseFloat(String(gc.lowvalueforgradient  ?? '0'))
  const highVal  = parseFloat(String(gc.highvalueforgradient ?? '100'))
  const title    = gc.legend_title ?? ''

  const barWidth  = Math.max(60,  parseInt(gc.legend_width  || '160', 10))
  const barHeight = Math.max(6,   parseInt(gc.legend_height || '14',  10))
  const steps     = Math.max(2,   parseInt(gc.legend_steps  || '5',   10))

  const pos = gc.legend_position || 'bottom-right'

  const wrapperStyle: React.CSSProperties = inline
    ? {
        pointerEvents: 'none',
        userSelect: 'none',
      }
    : {
        position: 'absolute',
        zIndex: 10,
        pointerEvents: 'none',
        userSelect: 'none',
        ...(pos.includes('bottom') ? { bottom: '12px' } : { top: '12px' }),
        ...(pos.includes('right') ? { right: '12px' } : { left: '12px' }),
      }

  const barGradient = `linear-gradient(to right, ${buildLargeArcStops(low, high)})`

  const ticks = Array.from({ length: steps }, (_, i) => {
    const t     = i / (steps - 1)
    const value = lowVal + (highVal - lowVal) * t
    const pct   = t * 100
    return { pct, label: fmtTick(value) }
  })

  const labelStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: '10px',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    position: 'absolute',
    transform: 'translateX(-50%)',
  }

  const titleStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: '11px',
    fontFamily: 'sans-serif',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    marginBottom: '2px',
  }

  return (
    <div
      style={{
        ...wrapperStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: pos.includes('right') ? 'flex-end' : 'flex-start',
        gap: '2px',
      }}
    >
      {title && <span style={titleStyle}>{title}</span>}

      <div
        style={{
          width: `${barWidth}px`,
          height: `${barHeight}px`,
          background: barGradient,
          borderRadius: '3px',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      />

      <div style={{ position: 'relative', width: `${barWidth}px`, height: '22px' }}>
        {ticks.map(({ pct, label }) => (
          <React.Fragment key={pct}>
            <div
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 0,
                width: '1px',
                height: '4px',
                background: 'rgba(255,255,255,0.7)',
                transform: 'translateX(-50%)',
              }}
            />
            <span style={{ ...labelStyle, top: '5px', left: `${pct}%` }}>
              {label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
