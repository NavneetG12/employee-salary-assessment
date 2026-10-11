# frozen_string_literal: true

module Types
  # Pay statistics for one slice of the workforce (a department, country, ...).
  class GroupStatType < Types::BaseObject
    field :key, String, null: false
    field :label, String, null: false
    field :headcount, Integer, null: false
    field :total_usd, Float, null: false
    field :average_usd, Float, null: false
    field :median_usd, Float, null: false
    field :p25_usd, Float, null: false
    field :p75_usd, Float, null: false
    field :min_usd, Float, null: false
    field :max_usd, Float, null: false
  end
end
