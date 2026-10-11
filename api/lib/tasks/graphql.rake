# frozen_string_literal: true

# `bin/rails graphql:schema:dump` writes ../web/schema.graphql, which the web
# app's GraphQL Code Generator reads to produce typed documents.
namespace :graphql do
  namespace :schema do
    desc "Dump the GraphQL schema IDL to web/schema.graphql"
    task dump: :environment do
      path = Rails.root.join("..", "web", "schema.graphql")
      File.write(path, ApiSchema.to_definition)
      puts "Wrote #{path}"
    end
  end
end
