import { Alert, AlertTitle } from '@mui/material'

export function ErrorAlert({ error, title = 'Something went wrong' }: { error: unknown; title?: string }) {
  if (!error) return null
  const message = error instanceof Error ? error.message : String(error)
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  )
}
