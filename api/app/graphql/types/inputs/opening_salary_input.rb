# frozen_string_literal: true

module Types
  module Inputs
    class OpeningSalaryInput < Types::BaseInputObject
      argument :amount, Float, required: true
      argument :currency, String, required: false, description: "Defaults to the country's currency"
      argument :effective_from, GraphQL::Types::ISO8601Date, required: false, description: "Defaults to the hire date"
      argument :note, String, required: false
    end
  end
end
