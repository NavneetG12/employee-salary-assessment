import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber, formatUsd, formatUsdCompact, GENDER_LABELS } from '@/lib/format'
import { CHROME, GENDER_COLOR, GENDER_ORDER, INK } from '../palette'
import { ChartTooltip } from './ChartTooltip'

export interface GenderLevelDatum {
  level: string
  gender: string
  headcount: number
  medianUsd: number
}

/** Pivots [level, gender] rows into one row per level with a column per gender. */
export function pivotByLevel(rows: GenderLevelDatum[], levels: readonly string[]) {
  const genders = GENDER_ORDER.filter((g) => rows.some((r) => r.gender === g))
  const data = levels
    .filter((level) => rows.some((r) => r.level === level))
    .map((level) => {
      const row: Record<string, string | number> = { level }
      for (const g of genders) {
        const hit = rows.find((r) => r.level === level && r.gender === g)
        if (hit) {
          row[g] = hit.medianUsd
          row[`${g}_n`] = hit.headcount
        }
      }
      return row
    })
  return { genders, data }
}

export function GenderByLevelChart({ rows, levels }: { rows: GenderLevelDatum[]; levels: readonly string[] }) {
  const { genders, data } = pivotByLevel(rows, levels)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%" barGap={2}>
        <CartesianGrid vertical={false} stroke={CHROME.grid} strokeWidth={1} />
        <XAxis dataKey="level" tick={{ fill: INK.secondary, fontSize: 12 }} axisLine={{ stroke: CHROME.axis }} tickLine={false} interval={0} />
        <YAxis tickFormatter={(v: number) => formatUsdCompact(v)} tick={{ fill: INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
        <Tooltip
          cursor={{ fill: 'rgba(17,24,39,0.04)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as Record<string, number>
            return (
              <ChartTooltip
                title={String(label)}
                rows={genders
                  .filter((g) => row[g] !== undefined)
                  .map((g) => ({ label: `${GENDER_LABELS[g]} (${formatNumber(row[`${g}_n`])})`, value: formatUsd(row[g]), color: GENDER_COLOR[g] }))}
              />
            )
          }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ color: INK.secondary, fontSize: 12 }}>{GENDER_LABELS[value] ?? value}</span>} />
        {genders.map((g) => (
          <Bar key={g} dataKey={g} name={g} fill={GENDER_COLOR[g]} maxBarSize={22} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
