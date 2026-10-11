import { describe, expect, it } from 'vitest'
import { formatChange, formatDate, formatMoney, formatUsd, formatUsdCompact, labelFor, STATUS_LABELS } from './format'

describe('formatMoney', () => {
  it('formats whole units with the currency symbol', () => {
    expect(formatMoney(120000, 'USD')).toBe('$120,000')
    expect(formatMoney(35500, 'GBP')).toBe('£35,500')
  })

  it('uses the ISO code for currencies whose symbol is ambiguous', () => {
    expect(formatMoney(2500000, 'INR')).toBe('INR 2,500,000')
    expect(formatMoney(8000000, 'JPY')).toBe('JPY 8,000,000')
  })

  it('never shows cents', () => {
    expect(formatUsd(99999.99)).toBe('$100,000')
  })
})

describe('formatUsdCompact', () => {
  it('compacts to k and M', () => {
    expect(formatUsdCompact(950)).toBe('$950')
    expect(formatUsdCompact(48_200)).toBe('$48k')
    expect(formatUsdCompact(1_250_000)).toBe('$1.3M')
    expect(formatUsdCompact(491_374_033)).toBe('$491M')
  })
})

describe('formatDate', () => {
  it('renders ISO dates without timezone drift', () => {
    expect(formatDate('2026-04-01')).toBe('Apr 1, 2026')
    expect(formatDate(null)).toBe('—')
  })
})

describe('formatChange', () => {
  it('signs and rounds the percentage', () => {
    expect(formatChange(100000, 108500)).toBe('+8.5%')
    expect(formatChange(100000, 95000)).toBe('-5.0%')
    expect(formatChange(0, 1)).toBe('—')
  })
})

describe('labelFor', () => {
  it('falls back to the raw key', () => {
    expect(labelFor(STATUS_LABELS, 'ON_LEAVE')).toBe('On leave')
    expect(labelFor(STATUS_LABELS, 'MYSTERY')).toBe('MYSTERY')
    expect(labelFor(STATUS_LABELS, null)).toBe('—')
  })
})
