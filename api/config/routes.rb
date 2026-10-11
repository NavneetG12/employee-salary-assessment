Rails.application.routes.draw do
  post "/graphql", to: "graphql#execute"
  get "/exports/employees", to: "exports#employees", defaults: { format: :csv }

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end

  get "up" => "rails/health#show", as: :rails_health_check

  # Everything else is a client-side route of the SPA. Browsers ask for HTML;
  # `*/*` (curl, link previews) is treated the same. Assets never fall through.
  spa = ->(req) { !req.path.start_with?("/assets/") && (req.format.html? || req.format == Mime::ALL) }
  root to: "spa#index"
  get "*path", to: "spa#index", constraints: spa
end
