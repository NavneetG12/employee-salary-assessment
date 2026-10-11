// Presentation helpers shared across pages. Kept pure so they are trivially testable.

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'INR'])

/** "¥12,340,000", "$120,000", "₹2,500,000" — whole units, locale-aware. */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    currencyDisplay: ZERO_DECIMAL_CURRENCIES.has(currency) ? 'code' : 'symbol',
  }).format(amount)
}

export function formatUsd(amount: number): string {
  return formatMoney(amount, 'USD')
}

/** Compact form for charts and KPI tiles: "$1.2M", "$48k". */
export function formatUsdCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`
  if (Math.abs(amount) >= 1_000) return `$${Math.round(amount / 1_000)}k`
  return `$${Math.round(amount)}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Signed percentage change between two amounts, e.g. "+8.5%". */
export function formatChange(from: number, to: number): string {
  if (from === 0) return '—'
  const pct = ((to - from) / from) * 100
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
}

export const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Active', ON_LEAVE: 'On leave', TERMINATED: 'Terminated' }
export const GENDER_LABELS: Record<string, string> = { FEMALE: 'Female', MALE: 'Male', NON_BINARY: 'Non-binary', UNDISCLOSED: 'Undisclosed' }
export const REASON_LABELS: Record<string, string> = {
  HIRE: 'Hire',
  PROMOTION: 'Promotion',
  ANNUAL_REVIEW: 'Annual review',
  MARKET_ADJUSTMENT: 'Market adjustment',
  CORRECTION: 'Correction',
  ROLE_CHANGE: 'Role change',
}

export function labelFor(map: Record<string, string>, key: string | null | undefined): string {
  if (!key) return '—'
  return map[key] ?? key
}

/** Today's date as YYYY-MM-DD in local time, for date inputs. */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
