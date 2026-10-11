# frozen_string_literal: true

module Types
  class AnalyticsSummaryType < Types::BaseObject
    field :headcount, Integer, null: false
    field :total_payroll_usd, Float, null: false
    field :average_usd, Float, null: false
    field :median_usd, Float, null: false
  end
end
