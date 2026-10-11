import { Autocomplete, Badge, Button, Chip, FormControlLabel, Paper, Stack, Switch, TextField } from '@mui/material'
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined'
import { useFilterOptions } from '@/features/employees/useFilterOptions'
import type { AnalyticsParams } from './useAnalyticsParams'

interface Props {
  params: AnalyticsParams
  active: number
  onChange: (patch: Partial<AnalyticsParams>) => void
  onReset: () => void
}

export function AnalyticsFilters({ params, active, onChange, onReset }: Props) {
  const options = useFilterOptions()
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap sx={{ alignItems: { md: 'center' }, flexWrap: 'wrap' }}>
        <Autocomplete
          multiple
          size="small"
          options={options.departments}
          value={params.departments}
          onChange={(_, v) => onChange({ departments: v })}
          renderInput={(p) => <TextField {...p} label="Department" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={v} {...getProps({ index: i })} key={v} />)}
          sx={{ minWidth: 220, flex: 1 }}
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
          sx={{ minWidth: 220, flex: 1 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={options.levels}
          value={params.levels}
          onChange={(_, v) => onChange({ levels: v })}
          renderInput={(p) => <TextField {...p} label="Level" />}
          renderValue={(vals, getProps) => vals.map((v, i) => <Chip size="small" label={v} {...getProps({ index: i })} key={v} />)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <FormControlLabel
          control={<Switch size="small" checked={params.includeLeavers} onChange={(e) => onChange({ includeLeavers: e.target.checked })} />}
          label="Include leavers"
          sx={{ ml: 0.5, whiteSpace: 'nowrap' }}
        />
        <Badge badgeContent={active} color="primary" invisible={active === 0}>
          <Button onClick={onReset} startIcon={<FilterAltOffOutlinedIcon />} color="inherit" disabled={active === 0}>Clear</Button>
        </Badge>
      </Stack>
    </Paper>
  )
}
