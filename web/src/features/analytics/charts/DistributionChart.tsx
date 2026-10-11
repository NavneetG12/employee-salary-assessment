import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber, formatUsd, formatUsdCompact } from '@/lib/format'
import { CHROME, INK, SEQUENTIAL } from '../palette'
import { ChartTooltip } from './ChartTooltip'

export interface BucketDatum {
  lowerUsd: number
  upperUsd: number
  headcount: number
}

export function DistributionChart({ data }: { data: BucketDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke={CHROME.grid} strokeWidth={1} />
        <XAxis dataKey="lowerUsd" tickFormatter={(v: number) => formatUsdCompact(v)} tick={{ fill: INK.muted, fontSize: 12 }} axisLine={{ stroke: CHROME.axis }} tickLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={(v: number) => formatNumber(v)} tick={{ fill: INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          cursor={{ fill: 'rgba(17,24,39,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as BucketDatum
            return <ChartTooltip title={`${formatUsd(d.lowerUsd)} – ${formatUsd(d.upperUsd)}`} rows={[{ label: 'Employees', value: formatNumber(d.headcount) }]} />
          }}
        />
        <Bar dataKey="headcount" fill={SEQUENTIAL} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
