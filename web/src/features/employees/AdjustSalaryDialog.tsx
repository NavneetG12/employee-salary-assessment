import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material'
import type { EmployeeQuery, SalaryReasonEnum } from '@/gql/graphql'
import { formatChange, formatDate, formatMoney, REASON_LABELS, todayIso } from '@/lib/format'
import { camel, errorsByPath } from '@/lib/errors'
import { ADJUST_SALARY } from './queries'
import { useFilterOptions } from './useFilterOptions'

type Employee = NonNullable<EmployeeQuery['employee']>

interface Props {
  open: boolean
  onClose: () => void
  employee: Employee
}

interface FormState {
  amount: string
  currency: string
  effectiveFrom: string
  reason: SalaryReasonEnum | ''
  note: string
}

export function validateAdjustment(form: FormState, currentEffectiveFrom: string | undefined): Record<string, string> {
  const errors: Record<string, string> = {}
  const amount = Number(form.amount)
  if (!form.amount || !Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than 0'
  if (!form.effectiveFrom) errors.effectiveFrom = 'Required'
  else if (currentEffectiveFrom && form.effectiveFrom <= currentEffectiveFrom) errors.effectiveFrom = `Must be after ${formatDate(currentEffectiveFrom)}, when the current salary started`
  if (!form.reason) errors.reason = 'Required'
  return errors
}

export function AdjustSalaryDialog({ open, onClose, employee }: Props) {
  const options = useFilterOptions()
  const current = employee.currentSalary
  const initial = (): FormState => ({ amount: '', currency: current?.currency ?? employee.country.currency, effectiveFrom: todayIso(), reason: '', note: '' })
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adjust, { loading, error }] = useMutation(ADJUST_SALARY, { refetchQueries: ['Employees', 'Analytics'] })

  useEffect(() => {
    if (open) {
      setForm(initial())
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee.id])

  const set = (field: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const reasons = options.salaryReasons.filter((r) => r !== 'HIRE')
  const amount = Number(form.amount)
  const showChange = current && form.currency === current.currency && Number.isFinite(amount) && amount > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clientErrors = validateAdjustment(form, current?.effectiveFrom)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return
    const { data } = await adjust({
      variables: {
        input: {
          employeeId: employee.id,
          adjustment: { amount, currency: form.currency, effectiveFrom: form.effectiveFrom, reason: form.reason as SalaryReasonEnum, note: form.note.trim() || null },
        },
      },
    })
    const payload = data?.adjustSalary
    if (payload?.salaryRecord) return onClose()
    const byPath = errorsByPath(payload?.errors)
    setErrors(Object.fromEntries(Object.entries(byPath).map(([k, v]) => [camel(k), v])))
  }

  const field = (name: keyof FormState) => ({ value: form[name], onChange: set(name), error: Boolean(errors[name]), helperText: errors[name] || undefined, fullWidth: true })

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth component="form" onSubmit={handleSubmit}>
      <DialogTitle>Adjust salary</DialogTitle>
      <DialogContent dividers>
        {current && (
          <Alert severity="info" icon={false} sx={{ mb: 2 }}>
            <Typography variant="body2">
              Current: <strong>{formatMoney(current.amount, current.currency)}</strong> since {formatDate(current.effectiveFrom)}. The current period will be closed the day before the new effective date.
            </Typography>
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
        {errors.base && <Alert severity="error" sx={{ mb: 2 }}>{errors.base}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 8 }}>
            <TextField
              label="New annual amount"
              type="number"
              required
              autoFocus
              slotProps={{ input: { startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment>, inputProps: { min: 1, step: 1 } } }}
              {...field('amount')}
              helperText={errors.amount || (showChange ? `${formatChange(current.amount, amount)} vs current` : undefined)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField select label="Currency" {...field('currency')}>
              {options.currencies.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Effective from" type="date" required slotProps={{ inputLabel: { shrink: true } }} {...field('effectiveFrom')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Reason" required {...field('reason')}>
              {reasons.map((r) => <MenuItem key={r} value={r}>{REASON_LABELS[r] ?? r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField label="Note (optional)" multiline minRows={2} placeholder="Context for the change, e.g. calibration outcome" {...field('note')} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving…' : 'Record change'}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
