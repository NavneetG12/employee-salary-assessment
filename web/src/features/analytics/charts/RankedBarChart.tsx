import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber, formatUsd, formatUsdCompact } from '@/lib/format'
import { CHROME, INK, SEQUENTIAL } from '../palette'
import { ChartTooltip } from './ChartTooltip'

export interface RankedDatum {
  label: string
  value: number
  headcount: number
}

interface Props {
  data: RankedDatum[]
  /** Whether `value` is money (formatted as USD) or a count. */
  kind: 'usd' | 'count'
  valueLabel: string
}

/** Horizontal bars, one hue, sorted by the caller. Magnitude only, so no categorical colour. */
export function RankedBarChart({ data, kind, valueLabel }: Props) {
  const fmt = kind === 'usd' ? formatUsd : formatNumber
  const compact = kind === 'usd' ? formatUsdCompact : (v: number) => formatNumber(v)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} stroke={CHROME.grid} strokeWidth={1} />
        <XAxis type="number" tickFormatter={compact} tick={{ fill: INK.muted, fontSize: 12 }} axisLine={{ stroke: CHROME.axis }} tickLine={false} />
        <YAxis type="category" dataKey="label" width={120} tick={{ fill: INK.secondary, fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
        <Tooltip
          cursor={{ fill: 'rgba(17,24,39,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as RankedDatum
            return <ChartTooltip title={d.label} rows={[{ label: valueLabel, value: fmt(d.value) }, { label: 'Headcount', value: formatNumber(d.headcount) }]} />
          }}
        />
        <Bar dataKey="value" fill={SEQUENTIAL} maxBarSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" formatter={(v: unknown) => compact(Number(v))} style={{ fill: INK.secondary, fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
