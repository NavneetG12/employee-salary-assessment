# frozen_string_literal: true

FactoryBot.define do
  factory :exchange_rate do
    currency { "USD" }
    usd_rate { 1 }
    as_of { Date.new(2026, 1, 1) }

    trait(:gbp) { currency { "GBP" }; usd_rate { 1.25 } }
    trait(:inr) { currency { "INR" }; usd_rate { 0.012 } }
    trait(:eur) { currency { "EUR" }; usd_rate { 1.10 } }
  end
end
