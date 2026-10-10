# frozen_string_literal: true

RSpec.describe ExchangeRate do
  it "enforces a unique currency and a positive rate" do
    create(:exchange_rate)
    expect(build(:exchange_rate)).not_to be_valid
    expect(build(:exchange_rate, currency: "EUR", usd_rate: 0)).not_to be_valid
  end

  it "raises a clear error when a rate is missing" do
    expect { described_class.usd_rate_for("JPY") }.to raise_error(ActiveRecord::RecordNotFound, /JPY/)
  end
end
