import { Chip } from '@mui/material'
import { labelFor, STATUS_LABELS } from '@/lib/format'

const COLORS: Record<string, 'success' | 'warning' | 'default'> = { ACTIVE: 'success', ON_LEAVE: 'warning', TERMINATED: 'default' }

export function StatusChip({ status }: { status: string }) {
  return <Chip size="small" label={labelFor(STATUS_LABELS, status)} color={COLORS[status] ?? 'default'} variant={status === 'ACTIVE' ? 'filled' : 'outlined'} />
}
