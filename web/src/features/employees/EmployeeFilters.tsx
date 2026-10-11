import { useEffect, useState } from 'react'
import { Autocomplete, Badge, Button, Chip, InputAdornment, Paper, Stack, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined'
import type { EmployeeStatusEnum } from '@/gql/graphql'
import { STATUS_LABELS } from '@/lib/format'
import { activeFilterCount, type DirectoryParams } from './useDirectoryParams'
import { useFilterOptions } from './useFilterOptions'

interface Props {
  params: DirectoryParams
  onChange: (patch: Partial<DirectoryParams>) => void
  onReset: () => void
}

const STATUS_OPTIONS: EmployeeStatusEnum[] = ['ACTIVE', 'ON_LEAVE', 'TERMINATED']

export function EmployeeFilters({ params, onChange, onReset }: Props) {
  const options = useFilterOptions()
  const [search, setSearch] = useState(params.search)

  // Keep the local field in sync with back/forward navigation.
  useEffect(() => setSearch(params.search), [params.search])

  // Debounce typing so each keystroke doesn't hit the server.
  useEffect(() => {
    if (search === params.search) return
    const t = setTimeout(() => onChange({ search }), 300)
    return () => clearTimeout(t)
  }, [search, params.search, onChange])

  const count = activeFilterCount(params)

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} useFlexGap sx={{ alignItems: { lg: 'center' }, flexWrap: 'wrap' }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or employee code"
          slotProps={{
            input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> },
            htmlInput: { 'aria-label': 'Search employees' },
          }}
          sx={{ minWidth: { lg: 320 }, flex: { lg: 1 } }}
        />
        <Autocomplete
          multiple
          size="small"
          options={options.departments}
          value={params.departments}
          onChange={(_, v) => onChange({ departments: v })}
          renderInput={(p) => <TextField {...p} label="Department" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={v} {...getProps({ index: i })} key={v} />)}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={options.countries}
          getOptionLabel={(c) => c.name}
          isOptionEqualToValue={(a, b) => a.code === b.code}
          value={options.countries.filter((c) => params.countryCodes.includes(c.code))}
          onChange={(_, v) => onChange({ countryCodes: v.map((c) => c.code) })}
          renderInput={(p) => <TextField {...p} label="Country" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={v.code} {...getProps({ index: i })} key={v.code} />)}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={options.levels}
          value={params.levels}
          onChange={(_, v) => onChange({ levels: v })}
          renderInput={(p) => <TextField {...p} label="Level" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={v} {...getProps({ index: i })} key={v} />)}
          sx={{ minWidth: 180 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={STATUS_OPTIONS}
          getOptionLabel={(s) => STATUS_LABELS[s]}
          value={params.statuses}
          onChange={(_, v) => onChange({ statuses: v })}
          renderInput={(p) => <TextField {...p} label="Status" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={STATUS_LABELS[v]} {...getProps({ index: i })} key={v} />)}
          sx={{ minWidth: 200 }}
        />
        <Badge badgeContent={count} color="primary" invisible={count === 0}>
          <Button onClick={onReset} startIcon={<FilterAltOffOutlinedIcon />} color="inherit" disabled={count === 0}>
            Clear
          </Button>
        </Badge>
      </Stack>
    </Paper>
  )
}
