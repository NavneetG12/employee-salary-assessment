# frozen_string_literal: true

# Usage: bin/rails db:seed                 (10,000 employees, seed 42)
#        SEED_COUNT=500 bin/rails db:seed  (smaller org for quick local runs)
require Rails.root.join("lib/acme/seed/exchange_rates")
require Rails.root.join("lib/acme/seed/employee_generator")
require Rails.root.join("lib/acme/seed/loader")

Acme::Seed::Loader.run!(
  count: Integer(ENV.fetch("SEED_COUNT", 10_000)),
  seed: Integer(ENV.fetch("SEED_RANDOM", 42)),
  logger: Logger.new($stdout)
)
