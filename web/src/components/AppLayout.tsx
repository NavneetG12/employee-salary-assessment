import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import PeopleOutlineIcon from '@mui/icons-material/PeopleAltOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/employees', label: 'Employees', icon: <PeopleOutlineIcon fontSize="small" /> },
  { to: '/analytics', label: 'Pay analytics', icon: <InsightsOutlinedIcon fontSize="small" /> },
]

export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ gap: 3 }}>
          <Stack direction="row" spacing={1.25} component={RouterLink} to="/employees" sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
              A
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ACME Salary Manager
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ ml: 2 }}>
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to)
              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  startIcon={item.icon}
                  color={active ? 'primary' : 'inherit'}
                  sx={{ bgcolor: active ? 'action.selected' : undefined, color: active ? 'primary.main' : 'text.secondary' }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            HR Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
