import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EmployeeFilterInput } from '@/gql/graphql'

export interface AnalyticsParams {
  departments: string[]
  countryCodes: string[]
  levels: string[]
  includeLeavers: boolean
}

export function parseAnalyticsParams(sp: URLSearchParams): AnalyticsParams {
  return {
    departments: sp.getAll('dept'),
    countryCodes: sp.getAll('country'),
    levels: sp.getAll('level'),
    includeLeavers: sp.get('leavers') === '1',
  }
}

export function toAnalyticsFilter(p: AnalyticsParams): EmployeeFilterInput {
  return {
    departments: p.departments.length ? p.departments : null,
    countryCodes: p.countryCodes.length ? p.countryCodes : null,
    levels: p.levels.length ? p.levels : null,
    // The API defaults to active + on leave; passing all three statuses includes leavers.
    statuses: p.includeLeavers ? ['ACTIVE', 'ON_LEAVE', 'TERMINATED'] : null,
  }
}

export function useAnalyticsParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parseAnalyticsParams(searchParams), [searchParams])
  const update = useCallback(
    (patch: Partial<AnalyticsParams>) => {
      setSearchParams(
        (prev) => {
          const next = { ...parseAnalyticsParams(prev), ...patch }
          const sp = new URLSearchParams()
          next.departments.forEach((d) => sp.append('dept', d))
          next.countryCodes.forEach((c) => sp.append('country', c))
          next.levels.forEach((l) => sp.append('level', l))
          if (next.includeLeavers) sp.set('leavers', '1')
          return sp
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )
  const reset = useCallback(() => setSearchParams(new URLSearchParams(), { replace: true }), [setSearchParams])
  const active = params.departments.length + params.countryCodes.length + params.levels.length + (params.includeLeavers ? 1 : 0)
  return { params, update, reset, active }
}
