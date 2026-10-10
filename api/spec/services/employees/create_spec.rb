# frozen_string_literal: true

RSpec.describe Employees::Create do
  let(:attributes) do
    { first_name: "Ada", last_name: "Lovelace", email: "ada@acme.example", department: "Engineering",
      job_title: "Staff Engineer", level: "Staff", country_code: "GB", gender: "female", hired_on: Date.new(2026, 2, 1) }
  end

  it "creates the employee and an opening salary in the local currency" do
    result = described_class.call(attributes: attributes, salary: { amount: 95_000 })

    expect(result).to be_success
    employee = result.record
    expect(employee).to be_persisted
    expect(employee.employee_code).to eq("ACME-000001")
    expect(employee.current_salary).to have_attributes(amount: 95_000, currency: "GBP", reason: "hire",
                                                       effective_from: Date.new(2026, 2, 1), effective_to: nil)
  end

  it "honours an explicit currency and effective date" do
    result = described_class.call(attributes: attributes, salary: { amount: 1, currency: "USD", effective_from: Date.new(2026, 3, 1) })
    expect(result.record.current_salary).to have_attributes(currency: "USD", effective_from: Date.new(2026, 3, 1))
  end

  it "returns field-level errors and persists nothing when invalid" do
    result = described_class.call(attributes: attributes.merge(email: "bad"), salary: { amount: -5 })

    expect(result).to be_failure
    expect(result.errors.map(&:path)).to include("email", "salary.amount")
    expect(Employee.count).to eq(0)
    expect(SalaryRecord.count).to eq(0)
  end
end
