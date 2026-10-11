# frozen_string_literal: true

module Types
  module Inputs
    class SalaryAdjustmentInput < Types::BaseInputObject
      argument :amount, Float, required: true
      argument :currency, String, required: false, description: "Defaults to the current salary's currency"
      argument :effective_from, GraphQL::Types::ISO8601Date, required: true
      argument :reason, Types::Enums::SalaryReasonEnum, required: true
      argument :note, String, required: false
    end
  end
end
