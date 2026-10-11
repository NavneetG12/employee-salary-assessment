import { Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { EmployeeQuery } from '@/gql/graphql'
import { formatChange, formatDate, formatMoney, formatUsd, labelFor, REASON_LABELS } from '@/lib/format'

type Record_ = NonNullable<EmployeeQuery['employee']>['salaryHistory'][number]

/** Newest first, each row showing the change versus the previous period. */
export function SalaryHistory({ history }: { history: Record_[] }) {
  const rows = history.map((r, i) => ({ record: r, previous: history[i - 1] })).reverse()
  return (
    <Paper>
      <Stack sx={{ px: 2.5, py: 2, justifyContent: 'space-between', alignItems: 'baseline' }} direction="row">
        <Typography variant="h6">Salary history</Typography>
        <Typography variant="body2" color="text.secondary">{history.length} {history.length === 1 ? 'period' : 'periods'}</Typography>
      </Stack>
      <Table size="small" aria-label="Salary history">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell align="right">Annual salary</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ record, previous }) => (
            <TableRow key={record.id} selected={record.current} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: record.current ? 600 : 400 }}>
                  {formatDate(record.effectiveFrom)} → {record.effectiveTo ? formatDate(record.effectiveTo) : 'present'}
                </Typography>
                {record.current && <Chip label="Current" size="small" color="primary" sx={{ mt: 0.5, height: 20 }} />}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(record.amount, record.currency)}</Typography>
                {record.currency !== 'USD' && <Typography variant="caption" color="text.secondary">≈ {formatUsd(record.amountUsd)}</Typography>}
              </TableCell>
              <TableCell align="right">
                {previous && previous.currency === record.currency ? (
                  <Typography variant="body2" sx={{ color: record.amount >= previous.amount ? 'success.main' : 'error.main', fontWeight: 500 }}>
                    {formatChange(previous.amount, record.amount)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell>{labelFor(REASON_LABELS, record.reason)}</TableCell>
              <TableCell sx={{ color: 'text.secondary', maxWidth: 320 }}>{record.note ?? ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
