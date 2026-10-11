import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, MenuItem, TextField, Typography,
} from '@mui/material'
import type { EmployeeInput, EmployeeQuery, GenderEnum, EmployeeStatusEnum } from '@/gql/graphql'
import { GENDER_LABELS, STATUS_LABELS, todayIso } from '@/lib/format'
import { camel, errorsByPath } from '@/lib/errors'
import { CREATE_EMPLOYEE, UPDATE_EMPLOYEE } from './queries'
import { useFilterOptions } from './useFilterOptions'

type ExistingEmployee = NonNullable<EmployeeQuery['employee']>

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (id: string) => void
  /** When given, the dialog edits this employee; otherwise it creates one. */
  employee?: ExistingEmployee
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  department: string
  jobTitle: string
  level: string
  countryCode: string
  gender: GenderEnum
  status: EmployeeStatusEnum
  hiredOn: string
  terminatedOn: string
  salaryAmount: string
  salaryCurrency: string
}

const GENDERS: GenderEnum[] = ['FEMALE', 'MALE', 'NON_BINARY', 'UNDISCLOSED']
const STATUSES: EmployeeStatusEnum[] = ['ACTIVE', 'ON_LEAVE', 'TERMINATED']

function initialState(employee?: ExistingEmployee): FormState {
  return {
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    department: employee?.department ?? '',
    jobTitle: employee?.jobTitle ?? '',
    level: employee?.level ?? '',
    countryCode: employee?.country.code ?? '',
    gender: employee?.gender ?? 'UNDISCLOSED',
    status: employee?.status ?? 'ACTIVE',
    hiredOn: employee?.hiredOn ?? todayIso(),
    terminatedOn: employee?.terminatedOn ?? '',
    salaryAmount: '',
    salaryCurrency: '',
  }
}

/** Client-side checks for fast feedback; the server remains the source of truth. */
export function validateForm(form: FormState, creating: boolean): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.firstName.trim()) errors.firstName = 'Required'
  if (!form.lastName.trim()) errors.lastName = 'Required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.department) errors.department = 'Required'
  if (!form.jobTitle.trim()) errors.jobTitle = 'Required'
  if (!form.level) errors.level = 'Required'
  if (!form.countryCode) errors.countryCode = 'Required'
  if (!form.hiredOn) errors.hiredOn = 'Required'
  if (form.status === 'TERMINATED' && !form.terminatedOn) errors.terminatedOn = 'Required when status is Terminated'
  if (form.status === 'TERMINATED' && form.terminatedOn && form.hiredOn && form.terminatedOn < form.hiredOn) errors.terminatedOn = 'Cannot be before the hire date'
  if (creating) {
    const amount = Number(form.salaryAmount)
    if (!form.salaryAmount || !Number.isFinite(amount) || amount <= 0) errors.salaryAmount = 'Enter an amount greater than 0'
  }
  return errors
}

export function EmployeeFormDialog({ open, onClose, onSaved, employee }: Props) {
  const creating = !employee
  const options = useFilterOptions()
  const [form, setForm] = useState<FormState>(() => initialState(employee))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const [createEmployee, createState] = useMutation(CREATE_EMPLOYEE, { refetchQueries: ['Employees', 'Analytics'] })
  const [updateEmployee, updateState] = useMutation(UPDATE_EMPLOYEE, { refetchQueries: ['Employees', 'Analytics'] })
  const saving = createState.loading || updateState.loading
  const networkError = createState.error ?? updateState.error

  useEffect(() => {
    if (open) {
      setForm(initialState(employee))
      setErrors({})
      setSubmitted(false)
    }
  }, [open, employee])

  const country = useMemo(() => options.countries.find((c) => c.code === form.countryCode), [options.countries, form.countryCode])
  const currency = form.salaryCurrency || country?.currency || 'USD'

  const set = (field: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (submitted) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const toInput = (): EmployeeInput => ({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    department: form.department,
    jobTitle: form.jobTitle.trim(),
    level: form.level,
    countryCode: form.countryCode,
    gender: form.gender,
    status: form.status,
    hiredOn: form.hiredOn,
    terminatedOn: form.status === 'TERMINATED' ? form.terminatedOn : null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const clientErrors = validateForm(form, creating)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return

    if (creating) {
      const { data } = await createEmployee({
        variables: { input: { attributes: toInput(), salary: { amount: Number(form.salaryAmount), currency, effectiveFrom: form.hiredOn } } },
      })
      const payload = data?.createEmployee
      if (payload?.employee) return onSaved(payload.employee.id)
      setErrors(mapServerErrors(payload?.errors))
    } else {
      const { data } = await updateEmployee({ variables: { input: { id: employee.id, attributes: toInput() } } })
      const payload = data?.updateEmployee
      if (payload?.employee) return onSaved(payload.employee.id)
      setErrors(mapServerErrors(payload?.errors))
    }
  }

  const field = (name: keyof FormState) => ({ value: form[name], onChange: set(name), error: Boolean(errors[name]), helperText: errors[name] || undefined, fullWidth: true })

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth component="form" onSubmit={handleSubmit}>
      <DialogTitle>{creating ? 'Add employee' : `Edit ${employee.fullName}`}</DialogTitle>
      <DialogContent dividers>
        {networkError && <Alert severity="error" sx={{ mb: 2 }}>{networkError.message}</Alert>}
        {errors.base && <Alert severity="error" sx={{ mb: 2 }}>{errors.base}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="First name" required autoFocus {...field('firstName')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last name" required {...field('lastName')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="Work email" type="email" required {...field('email')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField label="Job title" required {...field('jobTitle')} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Department" required {...field('department')}>
              {options.departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Level" required {...field('level')}>
              {options.levels.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Country" required {...field('countryCode')}>
              {options.countries.map((c) => <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Gender" {...field('gender')}>
              {GENDERS.map((g) => <MenuItem key={g} value={g}>{GENDER_LABELS[g]}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Hire date" type="date" required slotProps={{ inputLabel: { shrink: true } }} {...field('hiredOn')} />
          </Grid>
          {!creating && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Status" {...field('status')}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {!creating && form.status === 'TERMINATED' && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Last day" type="date" required slotProps={{ inputLabel: { shrink: true } }} {...field('terminatedOn')} />
            </Grid>
          )}
          {creating && (
            <>
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Opening salary</Typography>
                <Typography variant="caption" color="text.secondary">Recorded as the first entry in the salary history, effective from the hire date.</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Annual amount"
                  type="number"
                  required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">{currency}</InputAdornment>, inputProps: { min: 1, step: 1 } } }}
                  {...field('salaryAmount')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Currency" value={currency} onChange={set('salaryCurrency')} fullWidth helperText={country ? `Default for ${country.name}: ${country.currency}` : undefined}>
                  {options.currencies.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : creating ? 'Create employee' : 'Save changes'}</Button>
      </DialogActions>
    </Dialog>
  )
}

/** "salary.amount" -> salaryAmount, "country_code" -> countryCode, "base" stays. */
function mapServerErrors(errors: readonly { path: string; message: string }[] | undefined): Record<string, string> {
  const byPath = errorsByPath(errors)
  const out: Record<string, string> = {}
  for (const [path, message] of Object.entries(byPath)) {
    const key = path.startsWith('salary.') ? `salary${capitalize(camel(path.slice(7)))}` : camel(path)
    out[key] = message
  }
  return out
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
