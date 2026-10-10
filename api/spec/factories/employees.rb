# frozen_string_literal: true

FactoryBot.define do
  factory :employee do
    sequence(:employee_code) { |n| format("ACME-%06d", n) }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    sequence(:email) { |n| "person#{n}@acme.example" }
    department { "Engineering" }
    job_title { "Software Engineer" }
    level { "Senior" }
    country_code { "US" }
    gender { "undisclosed" }
    status { "active" }
    hired_on { Date.new(2022, 3, 1) }

    trait :terminated do
      status { "terminated" }
      terminated_on { Date.new(2025, 6, 30) }
    end

    # Gives the employee one open salary record (and an exchange rate for it).
    trait :with_salary do
      transient do
        amount { 120_000 }
        currency { "USD" }
      end

      after(:create) do |employee, evaluator|
        ExchangeRate.find_or_create_by!(currency: evaluator.currency) { |r| r.usd_rate = 1; r.as_of = Date.new(2026, 1, 1) }
        create(:salary_record, employee: employee, amount: evaluator.amount, currency: evaluator.currency,
                               effective_from: employee.hired_on, reason: "hire")
      end
    end
  end
end
