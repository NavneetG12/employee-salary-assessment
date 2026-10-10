# frozen_string_literal: true

FactoryBot.define do
  factory :salary_record do
    employee
    amount { 100_000 }
    currency { "USD" }
    effective_from { Date.new(2022, 3, 1) }
    effective_to { nil }
    reason { "hire" }
  end
end
