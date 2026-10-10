# frozen_string_literal: true

# 1 unit of `currency` == `usd_rate` USD. USD is the organisation's reporting
# currency; every cross-country comparison is normalised through this table.
class ExchangeRate < ApplicationRecord
  validates :currency, presence: true, uniqueness: true, length: { is: 3 }
  validates :usd_rate, presence: true, numericality: { greater_than: 0 }
  validates :as_of, presence: true

  # SQL fragment that converts a salary_records row to USD. Centralised so the
  # directory sort, the analytics and the CSV export all agree on the math.
  USD_AMOUNT_SQL = "salary_records.amount * exchange_rates.usd_rate"

  def self.usd_rate_for(currency)
    where(currency: currency).pick(:usd_rate) or raise ActiveRecord::RecordNotFound, "No exchange rate for #{currency}"
  end
end
