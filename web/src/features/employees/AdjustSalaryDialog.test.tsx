import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AdjustSalaryDialog } from './AdjustSalaryDialog'
import { ADJUST_SALARY, FILTER_OPTIONS } from './queries'

const employee = {
  id: '7', employeeCode: 'ACME-000007', firstName: 'Ada', lastName: 'Lovelace', fullName: 'Ada Lovelace', email: 'ada@acme.example',
  department: 'Engineering', jobTitle: 'Engineer', level: 'Staff', gender: 'FEMALE' as const, status: 'ACTIVE' as const, hiredOn: '2022-03-01',
  terminatedOn: null, updatedAt: '2026-01-01T00:00:00Z', country: { code: 'US', name: 'United States', currency: 'USD' },
  currentSalary: { id: '1', amount: 100000, currency: 'USD', amountUsd: 100000, effectiveFrom: '2025-04-01', reason: 'ANNUAL_REVIEW' as const },
  salaryHistory: [],
}

const filterOptionsMock = {
  request: { query: FILTER_OPTIONS },
  result: {
    data: {
      filterOptions: {
        __typename: 'FilterOptions', departments: ['Engineering'], levels: ['Staff'], currencies: ['USD', 'GBP'],
        salaryReasons: ['HIRE', 'PROMOTION', 'ANNUAL_REVIEW', 'CORRECTION'], countries: [{ __typename: 'Country', code: 'US', name: 'United States', currency: 'USD' }],
      },
    },
  },
}

function renderDialog(mocks: object[] = []) {
  const onClose = vi.fn()
  render(
    <MockedProvider mocks={[filterOptionsMock, ...mocks] as never}>
      <AdjustSalaryDialog open onClose={onClose} employee={employee} />
    </MockedProvider>,
  )
  return { onClose }
}

describe('AdjustSalaryDialog', () => {
  it('shows the current salary and blocks an effective date before the current period', async () => {
    const user = userEvent.setup()
    renderDialog()

    expect(screen.getByText(/Current:/)).toHaveTextContent('$100,000')

    await user.type(screen.getByLabelText(/New annual amount/), '110000')
    fireEvent.change(screen.getByLabelText(/Effective from/), { target: { value: '2024-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Record change' }))

    expect(await screen.findByText(/Must be after Apr 1, 2025/)).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument() // reason
  })

  it('shows the percentage change and submits a valid adjustment', async () => {
    const user = userEvent.setup()
    const adjustMock = {
      request: {
        query: ADJUST_SALARY,
        variables: { input: { employeeId: '7', adjustment: { amount: 110000, currency: 'USD', effectiveFrom: '2026-04-01', reason: 'PROMOTION', note: null } } },
      },
      result: {
        data: {
          adjustSalary: {
            __typename: 'AdjustSalaryPayload',
            salaryRecord: { __typename: 'SalaryRecord', id: '2' },
            employee: { __typename: 'Employee', id: '7', currentSalary: { __typename: 'SalaryRecord', ...employee.currentSalary, id: '2', amount: 110000, amountUsd: 110000, effectiveFrom: '2026-04-01', reason: 'PROMOTION' }, salaryHistory: [] },
            errors: [],
          },
        },
      },
    }
    const { onClose } = renderDialog([adjustMock])

    await user.type(screen.getByLabelText(/New annual amount/), '110000')
    expect(screen.getByText('+10.0% vs current')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Effective from/), { target: { value: '2026-04-01' } })
    await user.click(screen.getByLabelText(/Reason/))
    await user.click(await screen.findByRole('option', { name: 'Promotion' }))
    await user.click(screen.getByRole('button', { name: 'Record change' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('maps server-side errors onto the field', async () => {
    const user = userEvent.setup()
    const failing = {
      request: {
        query: ADJUST_SALARY,
        variables: { input: { employeeId: '7', adjustment: { amount: 1, currency: 'USD', effectiveFrom: '2026-04-01', reason: 'CORRECTION', note: null } } },
      },
      result: { data: { adjustSalary: { __typename: 'AdjustSalaryPayload', salaryRecord: null, employee: null, errors: [{ __typename: 'UserError', path: 'effective_from', message: 'overlaps a later record' }] } } },
    }
    renderDialog([failing])

    await user.type(screen.getByLabelText(/New annual amount/), '1')
    fireEvent.change(screen.getByLabelText(/Effective from/), { target: { value: '2026-04-01' } })
    await user.click(screen.getByLabelText(/Reason/))
    await user.click(await screen.findByRole('option', { name: 'Correction' }))
    await user.click(screen.getByRole('button', { name: 'Record change' }))

    expect(await screen.findByText('overlaps a later record')).toBeInTheDocument()
  })
})
