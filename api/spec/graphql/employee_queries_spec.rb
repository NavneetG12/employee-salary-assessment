# frozen_string_literal: true

RSpec.describe "Employee queries" do
  before { create(:exchange_rate, :gbp) }

  let!(:ada) do
    create(:employee, :with_salary, first_name: "Ada", last_name: "Lovelace", country_code: "GB", currency: "GBP",
                                    amount: 100_000, level: "Staff", gender: "female")
  end
  let!(:bob) { create(:employee, :with_salary, first_name: "Bob", last_name: "Marley", department: "Sales", amount: 60_000) }

  describe "employees" do
    let(:query) do
      <<~GQL
        query($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {
          employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {
            totalCount page perPage totalPages
            nodes { id employeeCode fullName department level status gender country { code currency } currentSalary { amount currency amountUsd current } }
          }
        }
      GQL
    end

    it "returns a page with totals and USD-normalised salaries" do
      data = execute_graphql(query, variables: { sortBy: "SALARY", sortDirection: "DESC", perPage: 1 }).dig(:data, :employees)

      expect(data).to include(totalCount: 2, page: 1, perPage: 1, totalPages: 2)
      expect(data[:nodes].first).to include(fullName: "Ada Lovelace", level: "Staff", status: "ACTIVE", gender: "FEMALE",
                                            country: { code: "GB", currency: "GBP" })
      expect(data[:nodes].first[:currentSalary]).to include(amount: 100_000.0, currency: "GBP", amountUsd: 125_000.0, current: true)
    end

    it "applies filters" do
      data = execute_graphql(query, variables: { filter: { departments: [ "Sales" ], statuses: [ "ACTIVE" ] } }).dig(:data, :employees)
      expect(data[:nodes].map { |n| n[:fullName] }).to eq([ "Bob Marley" ])
    end

    it "rejects unknown enum values with a GraphQL error rather than a 500" do
      result = execute_graphql(query, variables: { sortBy: "BOGUS" })
      expect(result[:errors].first[:message]).to match(/invalid value/)
      expect(result[:data]).to be_nil
    end
  end

  describe "employee" do
    it "returns the profile with chronological salary history" do
      create(:salary_record, employee: ada, amount: 80_000, currency: "GBP", effective_from: Date.new(2019, 1, 1),
                             effective_to: Date.new(2022, 2, 28), reason: "hire")
      query = <<~GQL
        query($id: ID!) { employee(id: $id) { fullName email hiredOn salaryHistory { amount effectiveFrom effectiveTo reason current } } }
      GQL
      data = execute_graphql(query, variables: { id: ada.id }).dig(:data, :employee)

      expect(data).to include(fullName: "Ada Lovelace", hiredOn: "2022-03-01")
      expect(data[:salaryHistory]).to eq([
        { amount: 80_000.0, effectiveFrom: "2019-01-01", effectiveTo: "2022-02-28", reason: "HIRE", current: false },
        { amount: 100_000.0, effectiveFrom: "2022-03-01", effectiveTo: nil, reason: "HIRE", current: true }
      ])
    end

    it "returns null for an unknown id" do
      expect(execute_graphql("query { employee(id: \"999999\") { id } }").dig(:data, :employee)).to be_nil
    end
  end

  describe "filterOptions" do
    it "exposes reference data" do
      data = execute_graphql("query { filterOptions { departments levels countries { code name currency } currencies salaryReasons } }").dig(:data, :filterOptions)
      expect(data[:levels].first).to eq("Junior")
      expect(data[:countries]).to include(code: "IN", name: "India", currency: "INR")
      expect(data[:salaryReasons]).to include("PROMOTION")
    end
  end
end
