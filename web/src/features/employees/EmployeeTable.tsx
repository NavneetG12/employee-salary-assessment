import { useMemo } from 'react'
import { Box, Link, Stack, Typography } from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { Link as RouterLink } from 'react-router-dom'
import type { EmployeesQuery, EmployeeSortFieldEnum } from '@/gql/graphql'
import { formatDate, formatMoney, formatUsd } from '@/lib/format'
import { StatusChip } from '@/components/StatusChip'
import type { DirectoryParams } from './useDirectoryParams'

export type EmployeeRow = EmployeesQuery['employees']['nodes'][number]

interface Props {
  rows: EmployeeRow[]
  totalCount: number
  loading: boolean
  params: DirectoryParams
  onChange: (patch: Partial<DirectoryParams>, opts?: { resetPage?: boolean }) => void
}

// Column field -> API sort key. Columns without an entry are not sortable server-side.
const SORT_KEYS: Record<string, EmployeeSortFieldEnum> = {
  fullName: 'NAME',
  employeeCode: 'EMPLOYEE_CODE',
  department: 'DEPARTMENT',
  level: 'LEVEL',
  country: 'COUNTRY',
  hiredOn: 'HIRED_ON',
  salary: 'SALARY',
}

export function EmployeeTable({ rows, totalCount, loading, params, onChange }: Props) {
  const columns = useMemo<GridColDef<EmployeeRow>[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'Employee',
        flex: 1.4,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack sx={{ height: '100%', justifyContent: 'center' }}>
            <Link component={RouterLink} to={`/employees/${row.id}`} underline="hover" sx={{ fontWeight: 600 }}>
              {row.fullName}
            </Link>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.jobTitle}
            </Typography>
          </Stack>
        ),
      },
      { field: 'employeeCode', headerName: 'Code', width: 130 },
      { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
      { field: 'level', headerName: 'Level', width: 110 },
      { field: 'country', headerName: 'Country', width: 140, valueGetter: (_, row) => row.country.name },
      {
        field: 'salary',
        headerName: 'Annual salary',
        width: 170,
        align: 'right',
        headerAlign: 'right',
        valueGetter: (_, row) => row.currentSalary?.amount ?? null,
        renderCell: ({ row }) =>
          row.currentSalary ? (
            <Stack sx={{ height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatMoney(row.currentSalary.amount, row.currentSalary.currency)}
              </Typography>
              {row.currentSalary.currency !== 'USD' && (
                <Typography variant="caption" color="text.secondary">
                  ≈ {formatUsd(row.currentSalary.amountUsd)}
                </Typography>
              )}
            </Stack>
          ) : (
            '—'
          ),
      },
      { field: 'hiredOn', headerName: 'Hired', width: 130, valueFormatter: (v: string) => formatDate(v) },
      { field: 'status', headerName: 'Status', width: 120, sortable: false, renderCell: ({ row }) => <StatusChip status={row.status} /> },
    ],
    [],
  )

  const sortField = Object.entries(SORT_KEYS).find(([, key]) => key === params.sortBy)?.[0] ?? 'fullName'
  const sortModel: GridSortModel = [{ field: sortField, sort: params.sortDirection === 'DESC' ? 'desc' : 'asc' }]
  const paginationModel: GridPaginationModel = { page: params.page - 1, pageSize: params.perPage }

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={totalCount}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        disableColumnFilter
        disableColumnMenu
        disableRowSelectionOnClick
        rowHeight={60}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={(m) => onChange({ page: m.page + 1, perPage: m.pageSize }, { resetPage: m.pageSize !== params.perPage })}
        sortModel={sortModel}
        onSortModelChange={(m) => {
          const next = m[0]
          if (!next) return onChange({ sortBy: 'NAME', sortDirection: 'ASC' })
          onChange({ sortBy: SORT_KEYS[next.field] ?? 'NAME', sortDirection: next.sort === 'desc' ? 'DESC' : 'ASC' })
        }}
        sortingOrder={['asc', 'desc']}
        slotProps={{ loadingOverlay: { variant: 'linear-progress', noRowsVariant: 'skeleton' } }}
        sx={{ border: 0, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 } }}
        autoHeight
      />
    </Box>
  )
}
