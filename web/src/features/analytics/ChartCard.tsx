import { useState, type ReactNode } from 'react'
import { Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'

export interface TableSpec {
  columns: { key: string; label: string; align?: 'left' | 'right' }[]
  rows: Record<string, string | number>[]
}

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  /** Optional extra controls rendered in the header row. */
  controls?: ReactNode
  /** When provided, the reader can switch the chart for an equivalent table. */
  table?: TableSpec
  height?: number
}

export function ChartCard({ title, subtitle, children, controls, table, height = 320 }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          {controls}
          {table && (
            <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label={`${title} view`}>
              <ToggleButton value="chart" aria-label="Chart view"><BarChartOutlinedIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="table" aria-label="Table view"><TableChartOutlinedIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
      </Stack>
      <Box sx={{ height, overflow: view === 'table' ? 'auto' : 'visible' }}>
        {view === 'chart' || !table ? (
          children
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{table.columns.map((c) => <TableCell key={c.key} align={c.align}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((r, i) => (
                <TableRow key={i}>{table.columns.map((c) => <TableCell key={c.key} align={c.align} sx={{ fontVariantNumeric: 'tabular-nums' }}>{r[c.key]}</TableCell>)}</TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  )
}
