# frozen_string_literal: true

class ApiSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  use GraphQL::Dataloader

  # Guard rails against abusive queries; the UI never gets close to these.
  max_depth(10)
  max_complexity(300)
  max_query_string_tokens(5000)
  validate_max_errors(20)
  default_max_page_size(200)
end
