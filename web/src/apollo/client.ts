import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

// Same-origin in production (Rails serves the SPA); proxied by Vite in dev.
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql'

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: GRAPHQL_URL }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Each filter/sort/page combination is its own cache entry; the
            // whole argument set identifies the result.
            employees: { keyArgs: ['filter', 'sortBy', 'sortDirection', 'page', 'perPage'] },
            analytics: { keyArgs: ['filter'], merge: true },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' },
    },
  })
}
