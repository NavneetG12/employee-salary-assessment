export interface UserError {
  path: string
  message: string
}

/** Turns a list of API UserErrors into { fieldPath: message } for form display. */
export function errorsByPath(errors: readonly UserError[] | undefined | null): Record<string, string> {
  const out: Record<string, string> = {}
  for (const e of errors ?? []) {
    if (!(e.path in out)) out[e.path] = e.message
  }
  return out
}

/** API paths are snake_case; form fields are camelCase. */
export function camel(path: string): string {
  return path.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}
