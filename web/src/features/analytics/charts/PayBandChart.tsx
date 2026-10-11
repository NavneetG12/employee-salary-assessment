import { useState } from 'react'
import { Box } from '@mui/material'
import { formatNumber, formatUsd, formatUsdCompact } from '@/lib/format'
import { CHROME, INK, SEQUENTIAL, SEQUENTIAL_MUTED } from '../palette'
import { ChartTooltip } from './ChartTooltip'

export interface PayBand {
  label: string
  headcount: number
  minUsd: number
  p25Usd: number
  medianUsd: number
  p75Usd: number
  maxUsd: number
}

/**
 * One row per level: a thin min→max whisker, a thicker p25→p75 band and a
 * median tick, all on one shared USD scale. Built as plain SVG because range
 * marks are the whole point and generic bar charts don't express them well.
 */
export function PayBandChart({ bands }: { bands: PayBand[] }) {
  const [hover, setHover] = useState<number | null>(null)
  if (!bands.length) return null

  const labelWidth = 84
  const rowHeight = 34
  const width = 1000 // viewBox units; scales to the container
  const plotLeft = labelWidth + 8
  const plotRight = width - 56
  const max = Math.max(...bands.map((b) => b.maxUsd))
  const niceMax = niceCeil(max)
  const x = (v: number) => plotLeft + ((plotRight - plotLeft) * v) / niceMax
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax)
  const height = bands.length * rowHeight + 28

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="Pay bands by level" style={{ overflow: 'visible' }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={0} y2={bands.length * rowHeight} stroke={CHROME.grid} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <text x={x(t)} y={bands.length * rowHeight + 18} textAnchor="middle" fontSize={12} fill={INK.muted} style={{ fontFamily: 'inherit' }}>
              {formatUsdCompact(t)}
            </text>
          </g>
        ))}
        {bands.map((b, i) => {
          const cy = i * rowHeight + rowHeight / 2
          const active = hover === i
          return (
            <g key={b.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <rect x={0} y={i * rowHeight} width={width} height={rowHeight} fill={active ? 'rgba(17,24,39,0.04)' : 'transparent'} />
              <text x={labelWidth} y={cy + 4} textAnchor="end" fontSize={12.5} fill={INK.secondary} style={{ fontFamily: 'inherit' }}>{b.label}</text>
              <line x1={x(b.minUsd)} x2={x(b.maxUsd)} y1={cy} y2={cy} stroke={SEQUENTIAL_MUTED} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <rect x={x(b.p25Usd)} y={cy - 6} width={Math.max(2, x(b.p75Usd) - x(b.p25Usd))} height={12} rx={4} fill={SEQUENTIAL} />
              <line x1={x(b.medianUsd)} x2={x(b.medianUsd)} y1={cy - 9} y2={cy + 9} stroke={CHROME.surface} strokeWidth={4} vectorEffect="non-scaling-stroke" />
              <line x1={x(b.medianUsd)} x2={x(b.medianUsd)} y1={cy - 9} y2={cy + 9} stroke={INK.primary} strokeWidth={2} vectorEffect="non-scaling-stroke" />
              <text x={x(b.maxUsd) + 10} y={cy + 4} fontSize={12} fill={INK.secondary} style={{ fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}>{formatUsdCompact(b.medianUsd)}</text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <Box sx={{ position: 'absolute', top: Math.min(hover * (100 / bands.length), 70) + '%', left: '45%', pointerEvents: 'none' }}>
          <ChartTooltip
            title={`${bands[hover].label} · ${formatNumber(bands[hover].headcount)} people`}
            rows={[
              { label: 'Minimum', value: formatUsd(bands[hover].minUsd) },
              { label: '25th percentile', value: formatUsd(bands[hover].p25Usd) },
              { label: 'Median', value: formatUsd(bands[hover].medianUsd) },
              { label: '75th percentile', value: formatUsd(bands[hover].p75Usd) },
              { label: 'Maximum', value: formatUsd(bands[hover].maxUsd) },
            ]}
          />
        </Box>
      )}
    </Box>
  )
}

export function niceCeil(v: number): number {
  if (v <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(v))
  const steps = [1, 2, 2.5, 5, 10]
  for (const s of steps) if (v <= s * magnitude) return s * magnitude
  return 10 * magnitude
}
