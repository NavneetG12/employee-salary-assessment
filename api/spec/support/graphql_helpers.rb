# frozen_string_literal: true

# Executes a GraphQL document directly against the schema (no HTTP) and returns
# the result as a hash with symbolized keys. Fast and sufficient for most specs;
# the request spec covers the HTTP layer once.
module GraphqlHelpers
  def execute_graphql(query, variables: {})
    ApiSchema.execute(query, variables: variables.deep_stringify_keys, context: {}).to_h.deep_symbolize_keys
  end
end

RSpec.configure { |c| c.include GraphqlHelpers }
