# frozen_string_literal: true

require Rails.root.join("lib/acme/seed/exchange_rates")
require Rails.root.join("lib/acme/seed/employee_generator")
require Rails.root.join("lib/acme/seed/loader")

RSpec.describe Acme::Seed::Loader do
  it "loads employees, salary histories and exchange rates", :aggregate_failures do
    described_class.run!(count: 120, seed: 3, reset: false, logger: Logger.new(nil))

    expect(Employee.count).to eq(120)
    expect(SalaryRecord.current.count).to eq(120)
    expect(SalaryRecord.count).to be > 120
    expect(ExchangeRate.count).to eq(Acme::Seed::ExchangeRates::RATES.size)
    expect(Employee.with_current_salary.count).to eq(120)
  end
end
