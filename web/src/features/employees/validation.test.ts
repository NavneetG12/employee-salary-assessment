import { describe, expect, it } from 'vitest'
import { validateForm } from './EmployeeFormDialog'
import { validateAdjustment } from './AdjustSalaryDialog'

const validEmployee = {
  firstName: 'Ada', lastName: 'Lovelace', email: 'ada@acme.example', department: 'Engineering', jobTitle: 'Engineer', level: 'Staff',
  countryCode: 'GB', gender: 'FEMALE' as const, status: 'ACTIVE' as const, hiredOn: '2026-02-01', terminatedOn: '', salaryAmount: '95000', salaryCurrency: '',
}

describe('validateForm', () => {
  it('accepts a complete new employee', () => {
    expect(validateForm(validEmployee, true)).toEqual({})
  })

  it('requires the opening salary only when creating', () => {
    const form = { ...validEmployee, salaryAmount: '' }
    expect(validateForm(form, true)).toHaveProperty('salaryAmount')
    expect(validateForm(form, false)).toEqual({})
  })

  it('flags bad email and termination dates', () => {
    const errors = validateForm({ ...validEmployee, email: 'nope', status: 'TERMINATED', terminatedOn: '2025-01-01' }, false)
    expect(errors.email).toBe('Enter a valid email')
    expect(errors.terminatedOn).toBe('Cannot be before the hire date')
  })

  it('requires a last day for leavers', () => {
    expect(validateForm({ ...validEmployee, status: 'TERMINATED' }, false).terminatedOn).toMatch(/Required/)
  })
})

describe('validateAdjustment', () => {
  const form = { amount: '110000', currency: 'USD', effectiveFrom: '2026-04-01', reason: 'ANNUAL_REVIEW' as const, note: '' }

  it('accepts a later effective date and positive amount', () => {
    expect(validateAdjustment(form, '2025-04-01')).toEqual({})
  })

  it('rejects an effective date on or before the current period start', () => {
    expect(validateAdjustment({ ...form, effectiveFrom: '2025-04-01' }, '2025-04-01').effectiveFrom).toMatch(/Must be after Apr 1, 2025/)
  })

  it('rejects non-positive amounts and a missing reason', () => {
    const errors = validateAdjustment({ ...form, amount: '0', reason: '' }, undefined)
    expect(errors.amount).toBeDefined()
    expect(errors.reason).toBe('Required')
  })
})
