# frozen_string_literal: true

module Acme
  module Seed
    # Fixed rates (1 unit of currency in USD). Deliberately static so analytics
    # are reproducible; see docs/REQUIREMENTS.md "Live FX rates".
    module ExchangeRates
      AS_OF = Date.new(2026, 1, 1)
      RATES = {
        "USD" => 1.0, "GBP" => 1.27, "EUR" => 1.08, "INR" => 0.012, "CAD" => 0.73,
        "AUD" => 0.66, "SGD" => 0.74, "BRL" => 0.19, "JPY" => 0.0067
      }.freeze

      def self.upsert!
        rows = RATES.map { |currency, rate| { currency: currency, usd_rate: rate, as_of: AS_OF, created_at: Time.current, updated_at: Time.current } }
        ExchangeRate.upsert_all(rows, unique_by: :currency)
      end
    end
  end
end
