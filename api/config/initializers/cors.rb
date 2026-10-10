# frozen_string_literal: true

# In development the Vite dev server (port 5173) calls the API cross-origin.
# In production the SPA is served by Rails itself, so no CORS is needed there.
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(",")
    resource "*", headers: :any, methods: %i[get post options]
  end
end
