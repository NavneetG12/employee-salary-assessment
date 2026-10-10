# frozen_string_literal: true

RSpec.describe Salaries::Adjust do
  let(:employee) { create(:employee, :with_salary, amount: 100_000) }

  def adjust(**overrides)
    described_class.call(employee: employee, amount: 110_000, effective_from: Date.new(2023, 4, 1), reason: "annual_review", **overrides)
  end

  it "closes the current record the day before and opens the new one" do
    result = adjust(note: "Strong year")

    expect(result).to be_success
    history = employee.salary_records.chronological
    expect(history.map { |r| [r.amount.to_i, r.effective_from, r.effective_to] }).to eq([
      [100_000, Date.new(2022, 3, 1), Date.new(2023, 3, 31)],
      [110_000, Date.new(2023, 4, 1), nil]
    ])
    expect(employee.current_salary).to have_attributes(amount: 110_000, reason: "annual_review", note: "Strong year")
  end

  it "keeps the current currency unless one is given" do
    expect(adjust.record.currency).to eq("USD")
    create(:exchange_rate, :gbp)
    expect(adjust(currency: "GBP", effective_from: Date.new(2024, 4, 1)).record.currency).to eq("GBP")
  end

  it "rejects an effective date on or before the current period start" do
    result = adjust(effective_from: Date.new(2022, 3, 1))
    expect(result).to be_failure
    expect(result.errors.first.path).to eq("effective_from")
    expect(employee.salary_records.count).to eq(1)
  end

  it "rejects invalid amounts without touching the current record" do
    result = adjust(amount: 0)
    expect(result).to be_failure
    expect(result.errors.first.path).to eq("amount")
    expect(employee.current_salary.reload.effective_to).to be_nil
  end

  it "rejects the hire reason after the opening salary" do
    expect(adjust(reason: "hire").errors.first.path).to eq("reason")
  end

  it "fails cleanly for an employee with no salary" do
    bare = create(:employee)
    result = described_class.call(employee: bare, amount: 1, effective_from: Date.today, reason: "correction")
    expect(result.errors.first.message).to match(/no current salary/)
  end
end
