# frozen_string_literal: true

RSpec.describe SalaryRecord do
  it "is valid with the factory defaults" do
    expect(build(:salary_record)).to be_valid
  end

  it "requires a positive amount and a known reason and currency" do
    record = build(:salary_record, amount: 0, reason: "whim", currency: "XXX")
    expect(record).not_to be_valid
    expect(record.errors.attribute_names).to contain_exactly(:amount, :reason, :currency)
  end

  it "rejects a period that ends before it starts" do
    record = build(:salary_record, effective_from: Date.new(2024, 5, 1), effective_to: Date.new(2024, 4, 1))
    expect(record).not_to be_valid
    expect(record.errors[:effective_to]).to be_present
  end

  it "allows only one current record per employee (database-enforced)" do
    employee = create(:employee)
    create(:salary_record, employee: employee)
    expect { create(:salary_record, employee: employee, amount: 1) }
      .to raise_error(ActiveRecord::RecordNotUnique)
  end

  it "converts to USD using the exchange rate table" do
    create(:exchange_rate, :gbp)
    record = build(:salary_record, amount: 80_000, currency: "GBP")
    expect(record.amount_usd).to eq(100_000)
  end
end
