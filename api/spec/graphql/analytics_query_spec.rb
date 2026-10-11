# frozen_string_literal: true

RSpec.describe "analytics query" do
  before do
    create(:exchange_rate, :inr)
    create(:employee, :with_salary, department: "Engineering", level: "Senior", country_code: "US", amount: 100_000)
    create(:employee, :with_salary, department: "Engineering", level: "Junior", country_code: "IN", currency: "INR", amount: 2_500_000) # 30,000 USD
    create(:employee, :with_salary, :terminated, department: "Sales", level: "VP", amount: 900_000)
  end

  let(:query) do
    <<~GQL
      query($filter: EmployeeFilterInput) {
        analytics(filter: $filter) {
          summary { headcount totalPayrollUsd medianUsd }
          byLevel { key label headcount medianUsd p25Usd p75Usd }
          byCountry { key label headcount }
          salaryDistribution(bucketUsd: 50000) { lowerUsd upperUsd headcount }
          payByGenderAndLevel { level gender headcount medianUsd }
        }
      }
    GQL
  end

  it "returns USD-normalised statistics for the current workforce" do
    data = execute_graphql(query).dig(:data, :analytics)

    expect(data[:summary]).to eq(headcount: 2, totalPayrollUsd: 130_000.0, medianUsd: 65_000.0)
    expect(data[:byLevel].map { |l| l.slice(:key, :headcount, :medianUsd) }).to eq([ { key: "Junior", headcount: 1, medianUsd: 30_000.0 },
                                                                                     { key: "Senior", headcount: 1, medianUsd: 100_000.0 } ])
    expect(data[:byCountry]).to include(key: "IN", label: "India", headcount: 1)
    expect(data[:salaryDistribution]).to eq([ { lowerUsd: 0.0, upperUsd: 50_000.0, headcount: 1 },
                                              { lowerUsd: 50_000.0, upperUsd: 100_000.0, headcount: 0 },
                                              { lowerUsd: 100_000.0, upperUsd: 150_000.0, headcount: 1 } ])
    expect(data[:payByGenderAndLevel].first).to include(level: "Junior", gender: "UNDISCLOSED", headcount: 1)
  end

  it "honours the filter" do
    data = execute_graphql(query, variables: { filter: { statuses: [ "TERMINATED" ] } }).dig(:data, :analytics)
    expect(data[:summary]).to include(headcount: 1, totalPayrollUsd: 900_000.0)
  end
end
