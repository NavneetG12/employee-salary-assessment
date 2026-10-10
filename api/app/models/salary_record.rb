# frozen_string_literal: true

# One row per salary period. The open row (effective_to IS NULL) is the current
# salary; closed rows are the immutable history. A unique partial index in the
# database guarantees at most one open row per employee.
class SalaryRecord < ApplicationRecord
  REASONS = %w[hire promotion annual_review market_adjustment correction role_change].freeze

  belongs_to :employee, inverse_of: :salary_records

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, inclusion: { in: Acme::Countries::CURRENCIES }
  validates :effective_from, presence: true
  validates :reason, inclusion: { in: REASONS }
  validate :period_is_ordered

  scope :current, -> { where(effective_to: nil) }
  scope :chronological, -> { order(:effective_from, :id) }

  def current? = effective_to.nil?

  def amount_usd
    (amount * ExchangeRate.usd_rate_for(currency)).round(2)
  end

  private

  def period_is_ordered
    return if effective_to.blank? || effective_from.blank?

    errors.add(:effective_to, "must be on or after effective_from") if effective_to < effective_from
  end
end
