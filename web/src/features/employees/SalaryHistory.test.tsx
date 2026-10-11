import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalaryHistory } from './SalaryHistory'

const history = [
  { id: '1', amount: 23000, currency: 'GBP', amountUsd: 29210, effectiveFrom: '2017-03-28', effectiveTo: '2019-03-31', reason: 'HIRE' as const, note: null, current: false, createdAt: '' },
  { id: '2', amount: 27000, currency: 'GBP', amountUsd: 34290, effectiveFrom: '2019-04-01', effectiveTo: null, reason: 'PROMOTION' as const, note: 'Calibration', current: true, createdAt: '' },
]

describe('SalaryHistory', () => {
  it('lists periods newest first with the change versus the previous period', () => {
    render(<SalaryHistory history={history} />)
    const rows = within(screen.getByRole('table', { name: 'Salary history' })).getAllByRole('row').slice(1)

    expect(rows[0]).toHaveTextContent('Apr 1, 2019 → present')
    expect(rows[0]).toHaveTextContent('£27,000')
    expect(rows[0]).toHaveTextContent('+17.4%')
    expect(rows[0]).toHaveTextContent('Promotion')
    expect(rows[0]).toHaveTextContent('Calibration')
    expect(within(rows[0]).getByText('Current')).toBeInTheDocument()

    expect(rows[1]).toHaveTextContent('Mar 28, 2017 → Mar 31, 2019')
    expect(rows[1]).toHaveTextContent('—')
  })
})
