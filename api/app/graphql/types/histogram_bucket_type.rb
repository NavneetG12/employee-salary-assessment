# frozen_string_literal: true

module Types
  class HistogramBucketType < Types::BaseObject
    field :lower_usd, Float, null: false
    field :upper_usd, Float, null: false
    field :headcount, Integer, null: false
  end
end
