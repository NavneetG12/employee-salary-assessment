# frozen_string_literal: true

module Types
  class GenderLevelStatType < Types::BaseObject
    field :level, String, null: false
    field :gender, Types::Enums::GenderEnum, null: false
    field :headcount, Integer, null: false
    field :median_usd, Float, null: false
  end
end
