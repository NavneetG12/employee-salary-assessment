# frozen_string_literal: true

require Rails.root.join("lib/acme/seed/exchange_rates")
require Rails.root.join("lib/acme/seed/employee_generator")

RSpec.describe Acme::Seed::EmployeeGenerator do
  subject(:generator) { described_class.new(count: 200, seed: 7) }

  let(:result) { generator.generate }
  let(:employees) { result[0] }
  let(:salaries) { result[1] }

  it "is deterministic for a given seed" do
    expect(described_class.new(count: 50, seed: 1).generate).to eq(described_class.new(count: 50, seed: 1).generate)
    expect(described_class.new(count: 50, seed: 1).generate).not_to eq(described_class.new(count: 50, seed: 2).generate)
  end

  it "produces valid employees with unique codes and emails" do
    expect(employees.size).to eq(200)
    expect(employees.map { |e| e[:employee_code] }.uniq.size).to eq(200)
    expect(employees.map { |e| e[:email] }.uniq.size).to eq(200)
    expect(employees.map { |e| Employee.new(e) }).to all(be_valid)
  end

  it "gives every employee exactly one open salary record in their local currency, with contiguous periods" do
    employees.each do |employee|
      history = salaries.fetch(employee[:employee_code])
      expect(history.count { |r| r[:effective_to].nil? }).to eq(1)
      expect(history.first[:reason]).to eq("hire")
      expect(history.first[:effective_from]).to eq(employee[:hired_on])
      expect(history.map { |r| r[:currency] }.uniq).to eq([ Acme::Countries.find(employee[:country_code]).currency ])
      history.each_cons(2) { |a, b| expect(b[:effective_from]).to eq(a[:effective_to] + 1) }
      expect(history.map { |r| r[:amount] }).to all(be > 0)
    end
  end

  it "pays senior levels more than junior levels on average (USD)" do
    usd = ->(e) { salaries[e[:employee_code]].last.then { |r| r[:amount] * Acme::Seed::ExchangeRates::RATES[r[:currency]] } }
    avg = ->(level) { employees.select { |e| e[:level] == level }.then { |es| es.sum(&usd) / es.size } }
    expect(avg.("Senior")).to be > avg.("Junior")
  end
end
