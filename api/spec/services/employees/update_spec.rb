# frozen_string_literal: true

RSpec.describe Employees::Update do
  let(:employee) { create(:employee) }

  it "updates attributes" do
    result = described_class.call(employee: employee, attributes: { job_title: "Principal Engineer", level: "Principal" })
    expect(result).to be_success
    expect(employee.reload).to have_attributes(job_title: "Principal Engineer", level: "Principal")
  end

  it "records a leaver and clears the date again on rehire" do
    described_class.call(employee: employee, attributes: { status: "terminated", terminated_on: Date.new(2026, 1, 31) })
    expect(employee.reload).to be_terminated

    described_class.call(employee: employee, attributes: { status: "active" })
    expect(employee.reload).to have_attributes(status: "active", terminated_on: nil)
  end

  it "returns errors without saving" do
    result = described_class.call(employee: employee, attributes: { department: "Nope" })
    expect(result).to be_failure
    expect(result.errors.first).to have_attributes(path: "department")
    expect(employee.reload.department).to eq("Engineering")
  end
end
