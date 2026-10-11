# frozen_string_literal: true

RSpec.describe Employees::Search do
  before do
    create(:exchange_rate, :gbp)
    create(:employee, :with_salary, first_name: "Ada", last_name: "Lovelace", department: "Engineering", level: "Staff",
                                    country_code: "GB", currency: "GBP", amount: 100_000, hired_on: Date.new(2020, 1, 1))
    create(:employee, :with_salary, first_name: "Bob", last_name: "Marley", department: "Sales", level: "Junior",
                                    country_code: "US", amount: 60_000, hired_on: Date.new(2024, 1, 1))
    create(:employee, :with_salary, :terminated, first_name: "Cy", last_name: "Young", department: "Engineering", level: "Mid",
                                                 country_code: "US", amount: 90_000, hired_on: Date.new(2022, 1, 1))
  end

  def names(**opts) = described_class.new(**opts).records.map(&:first_name)

  it "sorts by name by default" do
    expect(names).to eq(%w[Ada Bob Cy])
  end

  it "filters by department, country, level, status and search together" do
    expect(names(filter: { departments: %w[Engineering] })).to eq(%w[Ada Cy])
    expect(names(filter: { country_codes: %w[US] })).to eq(%w[Bob Cy])
    expect(names(filter: { levels: %w[Staff Mid] })).to eq(%w[Ada Cy])
    expect(names(filter: { statuses: %w[terminated] })).to eq(%w[Cy])
    expect(names(filter: { departments: %w[Engineering], search: "young" })).to eq(%w[Cy])
  end

  it "sorts by USD-normalised salary across currencies" do
    # Ada: 100,000 GBP * 1.25 = 125,000 USD, the highest.
    expect(names(sort_by: "salary", sort_direction: "desc")).to eq(%w[Ada Cy Bob])
    expect(names(sort_by: "salary")).to eq(%w[Bob Cy Ada])
  end

  it "sorts levels by seniority rather than alphabetically" do
    expect(names(sort_by: "level")).to eq(%w[Bob Cy Ada])
  end

  it "sorts by hire date" do
    expect(names(sort_by: "hired_on", sort_direction: "desc")).to eq(%w[Bob Cy Ada])
  end

  it "paginates and reports totals" do
    search = described_class.new(page: 2, per_page: 2)
    expect(search.records.map(&:first_name)).to eq(%w[Cy])
    expect(search.total_count).to eq(3)
    expect(search.total_pages).to eq(2)
  end

  it "falls back to safe defaults for unknown sort and out-of-range paging" do
    search = described_class.new(sort_by: "drop table", sort_direction: "sideways", page: -3, per_page: 10_000)
    expect(search.records.map(&:first_name)).to eq(%w[Ada Bob Cy])
    expect(search.per_page).to eq(described_class::MAX_PER_PAGE)
  end

  it "loads the current salary without N+1" do
    records = described_class.new.records.to_a
    expect { records.each { |e| e.current_salary.amount } }.not_to exceed_query_limit(0)
  end
end
