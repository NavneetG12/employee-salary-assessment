import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Grid, MenuItem, Skeleton, TextField } from '@mui/material'
import { PageHeader } from '@/components/PageHeader'
import { ErrorAlert } from '@/components/ErrorAlert'
import { useFilterOptions } from '@/features/employees/useFilterOptions'
import { formatNumber, formatUsd, formatUsdCompact, GENDER_LABELS } from '@/lib/format'
import { ANALYTICS } from './queries'
import { AnalyticsFilters } from './AnalyticsFilters'
import { StatTile } from './StatTile'
import { ChartCard } from './ChartCard'
import { RankedBarChart } from './charts/RankedBarChart'
import { DistributionChart } from './charts/DistributionChart'
import { GenderByLevelChart, pivotByLevel } from './charts/GenderByLevelChart'
import { PayBandChart } from './charts/PayBandChart'
import { toAnalyticsFilter, useAnalyticsParams } from './useAnalyticsParams'

type Metric = 'medianUsd' | 'averageUsd' | 'totalUsd' | 'headcount'
const METRICS: { key: Metric; label: string; kind: 'usd' | 'count' }[] = [
  { key: 'medianUsd', label: 'Median salary', kind: 'usd' },
  { key: 'averageUsd', label: 'Average salary', kind: 'usd' },
  { key: 'totalUsd', label: 'Total payroll', kind: 'usd' },
  { key: 'headcount', label: 'Headcount', kind: 'count' },
]

export function AnalyticsPage() {
  const { params, update, reset, active } = useAnalyticsParams()
  const { levels } = useFilterOptions()
  const [metric, setMetric] = useState<Metric>('medianUsd')
  const variables = useMemo(() => ({ filter: toAnalyticsFilter(params), bucketUsd: 25_000 }), [params])
  const { data, previousData, loading, error } = useQuery(ANALYTICS, { variables })
  const analytics = data?.analytics ?? previousData?.analytics
  const metricSpec = METRICS.find((m) => m.key === metric)!
  const fmt = metricSpec.kind === 'usd' ? formatUsd : formatNumber

  const ranked = (groups: { label: string; headcount: number; medianUsd: number; averageUsd: number; totalUsd: number }[] | undefined) =>
    [...(groups ?? [])].map((g) => ({ label: g.label, value: g[metric], headcount: g.headcount })).sort((a, b) => b.value - a.value)

  const metricSelect = (
    <TextField select size="small" value={metric} onChange={(e) => setMetric(e.target.value as Metric)} sx={{ minWidth: 150 }} aria-label="Metric">
      {METRICS.map((m) => <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>)}
    </TextField>
  )

  const groupTable = (rows: ReturnType<typeof ranked>) => ({
    columns: [{ key: 'label', label: 'Group' }, { key: 'value', label: metricSpec.label, align: 'right' as const }, { key: 'headcount', label: 'Headcount', align: 'right' as const }],
    rows: rows.map((r) => ({ label: r.label, value: fmt(r.value), headcount: formatNumber(r.headcount) })),
  })

  const genderPivot = analytics ? pivotByLevel(analytics.payByGenderAndLevel, levels) : { genders: [], data: [] }

  return (
    <>
      <PageHeader title="Pay analytics" subtitle="How ACME pays people, normalised to USD at stored exchange rates. Leavers are excluded unless included below." />
      <AnalyticsFilters params={params} active={active} onChange={update} onReset={reset} />
      <ErrorAlert error={error} title="Could not load analytics" />

      {!analytics && loading ? (
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((i) => <Grid key={i} size={{ xs: 6, md: 3 }}><Skeleton variant="rounded" height={110} /></Grid>)}
          <Grid size={12}><Skeleton variant="rounded" height={360} /></Grid>
        </Grid>
      ) : analytics && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}><StatTile label="Headcount" value={formatNumber(analytics.summary.headcount)} hint="employees in scope" /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StatTile label="Annual payroll" value={formatUsdCompact(analytics.summary.totalPayrollUsd)} hint={formatUsd(analytics.summary.totalPayrollUsd)} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StatTile label="Median salary" value={formatUsd(analytics.summary.medianUsd)} hint="half earn more, half earn less" /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StatTile label="Average salary" value={formatUsd(analytics.summary.averageUsd)} hint="payroll ÷ headcount" /></Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <ChartCard
              title="Pay bands by level"
              subtitle="Bar = 25th–75th percentile · tick = median · line = min–max"
              height={360}
              table={{
                columns: [
                  { key: 'label', label: 'Level' }, { key: 'headcount', label: 'Headcount', align: 'right' }, { key: 'minUsd', label: 'Min', align: 'right' },
                  { key: 'p25Usd', label: 'P25', align: 'right' }, { key: 'medianUsd', label: 'Median', align: 'right' }, { key: 'p75Usd', label: 'P75', align: 'right' }, { key: 'maxUsd', label: 'Max', align: 'right' },
                ],
                rows: analytics.byLevel.map((b) => ({ label: b.label, headcount: formatNumber(b.headcount), minUsd: formatUsd(b.minUsd), p25Usd: formatUsd(b.p25Usd), medianUsd: formatUsd(b.medianUsd), p75Usd: formatUsd(b.p75Usd), maxUsd: formatUsd(b.maxUsd) })),
              }}
            >
              <PayBandChart bands={analytics.byLevel} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <ChartCard
              title="Salary distribution"
              subtitle="Employees per $25k band (USD equivalent)"
              height={360}
              table={{
                columns: [{ key: 'band', label: 'Band' }, { key: 'headcount', label: 'Employees', align: 'right' }],
                rows: analytics.salaryDistribution.map((b) => ({ band: `${formatUsd(b.lowerUsd)} – ${formatUsd(b.upperUsd)}`, headcount: formatNumber(b.headcount) })),
              }}
            >
              <DistributionChart data={analytics.salaryDistribution} />
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <ChartCard title="By department" subtitle={metricSpec.label} controls={metricSelect} height={380} table={groupTable(ranked(analytics.byDepartment))}>
              <RankedBarChart data={ranked(analytics.byDepartment)} kind={metricSpec.kind} valueLabel={metricSpec.label} />
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ChartCard title="By country" subtitle={metricSpec.label} height={380} table={groupTable(ranked(analytics.byCountry))}>
              <RankedBarChart data={ranked(analytics.byCountry)} kind={metricSpec.kind} valueLabel={metricSpec.label} />
            </ChartCard>
          </Grid>

          <Grid size={12}>
            <ChartCard
              title="Median pay by gender within each level"
              subtitle="Like-for-like comparison; small groups are noisy, so headcounts are in the tooltip and table"
              height={340}
              table={{
                columns: [{ key: 'level', label: 'Level' }, ...genderPivot.genders.map((g) => ({ key: g, label: GENDER_LABELS[g], align: 'right' as const }))],
                rows: genderPivot.data.map((row) => ({
                  level: row.level,
                  ...Object.fromEntries(genderPivot.genders.map((g) => [g, row[g] === undefined ? '—' : `${formatUsd(Number(row[g]))} (${formatNumber(Number(row[`${g}_n`]))})`])),
                })),
              }}
            >
              <GenderByLevelChart rows={analytics.payByGenderAndLevel} levels={levels} />
            </ChartCard>
          </Grid>
        </Grid>
      )}
    </>
  )
}
