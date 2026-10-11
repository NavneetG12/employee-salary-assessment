import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Box, Breadcrumbs, Button, Chip, Grid, Link, Paper, Skeleton, Stack, Typography } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { ErrorAlert } from '@/components/ErrorAlert'
import { StatusChip } from '@/components/StatusChip'
import { formatDate, formatMoney, formatUsd, GENDER_LABELS, labelFor, REASON_LABELS } from '@/lib/format'
import { EMPLOYEE } from './queries'
import { SalaryHistory } from './SalaryHistory'
import { AdjustSalaryDialog } from './AdjustSalaryDialog'
import { EmployeeFormDialog } from './EmployeeFormDialog'

export function EmployeePage() {
  const { id = '' } = useParams()
  const { data, loading, error } = useQuery(EMPLOYEE, { variables: { id } })
  const [adjusting, setAdjusting] = useState(false)
  const [editing, setEditing] = useState(false)
  const employee = data?.employee

  if (loading && !employee) return <Skeleton variant="rounded" height={320} />
  if (error) return <ErrorAlert error={error} title="Could not load employee" />
  if (!employee) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Employee not found</Typography>
        <Button component={RouterLink} to="/employees" sx={{ mt: 2 }}>Back to directory</Button>
      </Paper>
    )
  }

  const salary = employee.currentSalary
  const tenureYears = Math.max(0, (Date.now() - new Date(employee.hiredOn).getTime()) / (365.25 * 24 * 3600 * 1000))

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link component={RouterLink} to="/employees" underline="hover" color="inherit">Employees</Link>
            <Typography color="text.primary">{employee.employeeCode}</Typography>
          </Breadcrumbs>
        }
        title={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <span>{employee.fullName}</span>
            <StatusChip status={employee.status} />
          </Stack>
        }
        subtitle={`${employee.jobTitle} · ${employee.department} · ${employee.level}`}
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="contained" startIcon={<PaymentsOutlinedIcon />} onClick={() => setAdjusting(true)} disabled={!salary}>Adjust salary</Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="overline" color="text.secondary">Current salary</Typography>
            {salary ? (
              <>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{formatMoney(salary.amount, salary.currency)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {salary.currency !== 'USD' ? `≈ ${formatUsd(salary.amountUsd)} · ` : ''}per year
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
                  <Chip size="small" variant="outlined" label={`Since ${formatDate(salary.effectiveFrom)}`} />
                  <Chip size="small" variant="outlined" label={labelFor(REASON_LABELS, salary.reason)} />
                </Stack>
              </>
            ) : (
              <Typography color="text.secondary">No salary recorded</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="overline" color="text.secondary">Profile</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Field label="Employee code" value={employee.employeeCode} />
              <Field label="Email" value={employee.email} />
              <Field label="Country" value={`${employee.country.name} (${employee.country.currency})`} />
              <Field label="Gender" value={labelFor(GENDER_LABELS, employee.gender)} />
              <Field label="Hired" value={`${formatDate(employee.hiredOn)} · ${tenureYears.toFixed(1)} yrs`} />
              <Field label={employee.status === 'TERMINATED' ? 'Last day' : 'Last updated'} value={employee.status === 'TERMINATED' ? formatDate(employee.terminatedOn) : formatDate(employee.updatedAt.slice(0, 10))} />
            </Grid>
          </Paper>
        </Grid>
        <Grid size={12}>
          <SalaryHistory history={employee.salaryHistory} />
        </Grid>
      </Grid>

      <AdjustSalaryDialog open={adjusting} onClose={() => setAdjusting(false)} employee={employee} />
      <EmployeeFormDialog open={editing} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} employee={employee} />
    </>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Grid>
  )
}
