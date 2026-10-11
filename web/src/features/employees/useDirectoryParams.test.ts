import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS, parseParams, serializeParams, toExportQuery, toFilterInput } from './useDirectoryParams'

describe('parseParams', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseParams(new URLSearchParams())).toEqual(DEFAULT_PARAMS)
  })

  it('reads every supported parameter', () => {
    const p = parseParams(new URLSearchParams('q=ada&dept=Engineering&dept=Sales&country=GB&level=Staff&status=terminated&sort=salary&dir=desc&page=3&per=50'))
    expect(p).toEqual({
      search: 'ada',
      departments: ['Engineering', 'Sales'],
      countryCodes: ['GB'],
      levels: ['Staff'],
      statuses: ['TERMINATED'],
      sortBy: 'SALARY',
      sortDirection: 'DESC',
      page: 3,
      perPage: 50,
    })
  })

  it('ignores garbage values instead of breaking the page', () => {
    const p = parseParams(new URLSearchParams('sort=drop&dir=sideways&page=-4&per=7&status=bogus'))
    expect(p.sortBy).toBe('NAME')
    expect(p.sortDirection).toBe('ASC')
    expect(p.page).toBe(1)
    expect(p.perPage).toBe(25)
    expect(p.statuses).toEqual([])
  })
})

describe('serializeParams', () => {
  it('round-trips and omits defaults', () => {
    expect(serializeParams(DEFAULT_PARAMS).toString()).toBe('')
    const p = { ...DEFAULT_PARAMS, search: 'x', statuses: [] as never[], sortBy: 'HIRED_ON' as const, page: 2 }
    const sp = serializeParams(p)
    expect(sp.toString()).toBe('q=x&status=&sort=hired_on&page=2')
    expect(parseParams(sp)).toEqual(p)
  })
})

describe('toFilterInput / toExportQuery', () => {
  it('sends nulls for empty filters so the API applies no constraint', () => {
    expect(toFilterInput(DEFAULT_PARAMS)).toEqual({ search: null, departments: null, countryCodes: null, levels: null, statuses: ['ACTIVE', 'ON_LEAVE'] })
  })

  it('produces the Rails-style array params for the CSV export', () => {
    const q = toExportQuery({ ...DEFAULT_PARAMS, departments: ['Engineering'], sortBy: 'SALARY', sortDirection: 'DESC' })
    expect(decodeURIComponent(q)).toBe('departments[]=Engineering&statuses[]=active&statuses[]=on_leave&sort_by=salary&sort_direction=desc')
  })
})
