import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EmployeeFilterInput, EmployeeSortFieldEnum, EmployeeStatusEnum, SortDirectionEnum } from '@/gql/graphql'

/**
 * The directory's search / filter / sort / page state lives in the URL so a
 * view can be bookmarked or shared, and so the CSV export can reproduce it.
 */
export interface DirectoryParams {
  search: string
  departments: string[]
  countryCodes: string[]
  levels: string[]
  statuses: EmployeeStatusEnum[]
  sortBy: EmployeeSortFieldEnum
  sortDirection: SortDirectionEnum
  page: number
  perPage: number
}

export const DEFAULT_PARAMS: DirectoryParams = {
  search: '',
  departments: [],
  countryCodes: [],
  levels: [],
  statuses: ['ACTIVE', 'ON_LEAVE'],
  sortBy: 'NAME',
  sortDirection: 'ASC',
  page: 1,
  perPage: 25,
}

const SORT_FIELDS: EmployeeSortFieldEnum[] = ['NAME', 'EMPLOYEE_CODE', 'DEPARTMENT', 'LEVEL', 'COUNTRY', 'HIRED_ON', 'SALARY']
const STATUSES: EmployeeStatusEnum[] = ['ACTIVE', 'ON_LEAVE', 'TERMINATED']

export function parseParams(sp: URLSearchParams): DirectoryParams {
  const sortBy = sp.get('sort')?.toUpperCase()
  const dir = sp.get('dir')?.toUpperCase()
  const statuses = sp.getAll('status').map((s) => s.toUpperCase()).filter((s): s is EmployeeStatusEnum => (STATUSES as string[]).includes(s))
  return {
    search: sp.get('q') ?? '',
    departments: sp.getAll('dept'),
    countryCodes: sp.getAll('country'),
    levels: sp.getAll('level'),
    statuses: sp.has('status') ? statuses : DEFAULT_PARAMS.statuses,
    sortBy: (SORT_FIELDS as string[]).includes(sortBy ?? '') ? (sortBy as EmployeeSortFieldEnum) : DEFAULT_PARAMS.sortBy,
    sortDirection: dir === 'DESC' ? 'DESC' : 'ASC',
    page: Math.max(1, Number(sp.get('page')) || 1),
    perPage: [25, 50, 100].includes(Number(sp.get('per'))) ? Number(sp.get('per')) : DEFAULT_PARAMS.perPage,
  }
}

export function serializeParams(p: DirectoryParams): URLSearchParams {
  const sp = new URLSearchParams()
  if (p.search) sp.set('q', p.search)
  p.departments.forEach((d) => sp.append('dept', d))
  p.countryCodes.forEach((c) => sp.append('country', c))
  p.levels.forEach((l) => sp.append('level', l))
  // An explicit "all" has to be representable, so statuses are always written
  // unless they equal the default.
  if (p.statuses.join() !== DEFAULT_PARAMS.statuses.join()) {
    if (p.statuses.length === 0) sp.set('status', '')
    else p.statuses.forEach((s) => sp.append('status', s.toLowerCase()))
  }
  if (p.sortBy !== DEFAULT_PARAMS.sortBy) sp.set('sort', p.sortBy.toLowerCase())
  if (p.sortDirection !== DEFAULT_PARAMS.sortDirection) sp.set('dir', p.sortDirection.toLowerCase())
  if (p.page !== 1) sp.set('page', String(p.page))
  if (p.perPage !== DEFAULT_PARAMS.perPage) sp.set('per', String(p.perPage))
  return sp
}

export function toFilterInput(p: DirectoryParams): EmployeeFilterInput {
  return {
    search: p.search || null,
    departments: p.departments.length ? p.departments : null,
    countryCodes: p.countryCodes.length ? p.countryCodes : null,
    levels: p.levels.length ? p.levels : null,
    statuses: p.statuses.length ? p.statuses : null,
  }
}

/** Query string for GET /exports/employees matching the current view. */
export function toExportQuery(p: DirectoryParams): string {
  const sp = new URLSearchParams()
  if (p.search) sp.set('search', p.search)
  p.departments.forEach((d) => sp.append('departments[]', d))
  p.countryCodes.forEach((c) => sp.append('country_codes[]', c))
  p.levels.forEach((l) => sp.append('levels[]', l))
  p.statuses.forEach((s) => sp.append('statuses[]', s.toLowerCase()))
  sp.set('sort_by', p.sortBy.toLowerCase())
  sp.set('sort_direction', p.sortDirection.toLowerCase())
  return sp.toString()
}

export function activeFilterCount(p: DirectoryParams): number {
  return (
    (p.search ? 1 : 0) +
    (p.departments.length ? 1 : 0) +
    (p.countryCodes.length ? 1 : 0) +
    (p.levels.length ? 1 : 0) +
    (p.statuses.join() !== DEFAULT_PARAMS.statuses.join() ? 1 : 0)
  )
}

export function useDirectoryParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parseParams(searchParams), [searchParams])

  const update = useCallback(
    (patch: Partial<DirectoryParams>, { resetPage = true } = {}) => {
      setSearchParams((prev) => serializeParams({ ...parseParams(prev), ...(resetPage ? { page: 1 } : {}), ...patch }), { replace: true })
    },
    [setSearchParams],
  )

  const reset = useCallback(() => setSearchParams(new URLSearchParams(), { replace: true }), [setSearchParams])

  return { params, update, reset }
}
