import { Box, Typography } from '@mui/material'

export interface TooltipRow {
  label: string
  value: string
  color?: string
}

/** Shared tooltip body so every chart formats values the same way. */
export function ChartTooltip({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{title}</Typography>
      {rows.map((r) => (
        <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13 }}>
          {r.color && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color, flexShrink: 0 }} />}
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{r.label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.value}</Typography>
        </Box>
      ))}
    </Box>
  )
}
