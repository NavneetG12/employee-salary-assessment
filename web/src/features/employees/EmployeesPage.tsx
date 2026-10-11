import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Button } from '@mui/material'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { ErrorAlert } from '@/components/ErrorAlert'
import { formatNumber } from '@/lib/format'
import { EMPLOYEES } from './queries'
import { EmployeeFilters } from './EmployeeFilters'
import { EmployeeTable } from './EmployeeTable'
import { EmployeeFormDialog } from './EmployeeFormDialog'
import { toExportQuery, toFilterInput, useDirectoryParams } from './useDirectoryParams'

export function EmployeesPage() {
  const { params, update, reset } = useDirectoryParams()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  const variables = useMemo(
    () => ({ filter: toFilterInput(params), sortBy: params.sortBy, sortDirection: params.sortDirection, page: params.page, perPage: params.perPage }),
    [params],
  )
  const { data, previousData, loading, error } = useQuery(EMPLOYEES, { variables })
  const page = data?.employees ?? previousData?.employees
  const exportHref = `/exports/employees?${toExportQuery(params)}`

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={page ? `${formatNumber(page.totalCount)} ${page.totalCount === 1 ? 'employee' : 'employees'} match the current filters` : 'Loading directory…'}
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} component="a" href={exportHref} download>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => setCreating(true)}>
              Add employee
            </Button>
          </>
        }
      />
      <EmployeeFilters params={params} onChange={update} onReset={reset} />
      <ErrorAlert error={error} title="Could not load employees" />
      <EmployeeTable rows={page?.nodes ?? []} totalCount={page?.totalCount ?? 0} loading={loading && !page} params={params} onChange={update} />
      <EmployeeFormDialog open={creating} onClose={() => setCreating(false)} onSaved={(id) => navigate(`/employees/${id}`)} />
    </>
  )
}
