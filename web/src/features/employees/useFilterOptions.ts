import { useQuery } from '@apollo/client/react'
import { FILTER_OPTIONS } from './queries'

/** Reference data (departments, levels, countries...) — loaded once and cached for the session. */
export function useFilterOptions() {
  const { data } = useQuery(FILTER_OPTIONS, { fetchPolicy: 'cache-first' })
  return {
    departments: data?.filterOptions.departments ?? [],
    levels: data?.filterOptions.levels ?? [],
    countries: data?.filterOptions.countries ?? [],
    currencies: data?.filterOptions.currencies ?? [],
    salaryReasons: data?.filterOptions.salaryReasons ?? [],
  }
}
