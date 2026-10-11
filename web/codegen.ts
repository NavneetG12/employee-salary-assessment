import type { CodegenConfig } from '@graphql-codegen/cli'

// Reads the schema dumped by `bin/rails graphql:schema:dump` and generates
// typed documents for every graphql(`...`) call in src/.
const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        scalars: { ISO8601Date: 'string', ISO8601DateTime: 'string' },
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
