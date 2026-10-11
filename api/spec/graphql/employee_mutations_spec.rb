# frozen_string_literal: true

RSpec.describe "Employee mutations" do
  before { create(:exchange_rate); create(:exchange_rate, :gbp) }

  describe "createEmployee" do
    let(:mutation) do
      <<~GQL
        mutation($input: CreateEmployeeInput!) {
          createEmployee(input: $input) {
            employee { employeeCode fullName country { code } currentSalary { amount currency reason effectiveFrom } }
            errors { path message }
          }
        }
      GQL
    end
    let(:attributes) do
      { firstName: "Ada", lastName: "Lovelace", email: "ada@acme.example", department: "Engineering", jobTitle: "Engineer",
        level: "Staff", countryCode: "GB", gender: "FEMALE", hiredOn: "2026-02-01" }
    end

    it "creates the employee with an opening salary in the local currency" do
      data = execute_graphql(mutation, variables: { input: { attributes: attributes, salary: { amount: 95_000 } } }).dig(:data, :createEmployee)

      expect(data[:errors]).to be_empty
      expect(data[:employee]).to include(employeeCode: "ACME-000001", fullName: "Ada Lovelace", country: { code: "GB" })
      expect(data[:employee][:currentSalary]).to eq(amount: 95_000.0, currency: "GBP", reason: "HIRE", effectiveFrom: "2026-02-01")
    end

    it "returns field errors instead of raising" do
      data = execute_graphql(mutation, variables: { input: { attributes: attributes.merge(email: "nope"), salary: { amount: 0 } } }).dig(:data, :createEmployee)

      expect(data[:employee]).to be_nil
      expect(data[:errors]).to include({ path: "email", message: "is invalid" }, { path: "salary.amount", message: "must be greater than 0" })
    end
  end

  describe "updateEmployee" do
    let(:employee) { create(:employee, :with_salary) }
    let(:mutation) do
      "mutation($input: UpdateEmployeeInput!) { updateEmployee(input: $input) { employee { jobTitle status terminatedOn } errors { path message } } }"
    end

    it "updates fields and records a leaver" do
      data = execute_graphql(mutation, variables: { input: { id: employee.id, attributes: { jobTitle: "CTO", status: "TERMINATED", terminatedOn: "2026-05-31" } } })
               .dig(:data, :updateEmployee)
      expect(data[:errors]).to be_empty
      expect(data[:employee]).to eq(jobTitle: "CTO", status: "TERMINATED", terminatedOn: "2026-05-31")
    end

    it "reports a missing employee" do
      data = execute_graphql(mutation, variables: { input: { id: 0, attributes: { jobTitle: "x" } } }).dig(:data, :updateEmployee)
      expect(data[:errors]).to eq([ { path: "id", message: "Employee not found" } ])
    end
  end

  describe "adjustSalary" do
    let(:employee) { create(:employee, :with_salary, amount: 100_000) }
    let(:mutation) do
      <<~GQL
        mutation($input: AdjustSalaryInput!) {
          adjustSalary(input: $input) {
            salaryRecord { amount currency reason effectiveFrom current }
            employee { currentSalary { amount } salaryHistory { amount effectiveTo } }
            errors { path message }
          }
        }
      GQL
    end

    it "appends a new salary period" do
      data = execute_graphql(mutation, variables: { input: { employeeId: employee.id,
                                                             adjustment: { amount: 115_000, effectiveFrom: "2024-04-01", reason: "PROMOTION", note: "Staff" } } })
               .dig(:data, :adjustSalary)

      expect(data[:errors]).to be_empty
      expect(data[:salaryRecord]).to eq(amount: 115_000.0, currency: "USD", reason: "PROMOTION", effectiveFrom: "2024-04-01", current: true)
      expect(data[:employee][:salaryHistory]).to eq([ { amount: 100_000.0, effectiveTo: "2024-03-31" }, { amount: 115_000.0, effectiveTo: nil } ])
    end

    it "surfaces business-rule errors" do
      data = execute_graphql(mutation, variables: { input: { employeeId: employee.id,
                                                             adjustment: { amount: 1, effectiveFrom: "2020-01-01", reason: "CORRECTION" } } })
               .dig(:data, :adjustSalary)
      expect(data[:salaryRecord]).to be_nil
      expect(data[:errors].first).to include(path: "effective_from")
    end
  end
end
