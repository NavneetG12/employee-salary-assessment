# frozen_string_literal: true

module Types
  class SalaryRecordType < Types::BaseObject
    field :id, ID, null: false
    field :amount, Float, null: false, description: "Annual salary in `currency`"
    field :currency, String, null: false
    field :amount_usd, Float, null: false, description: "Annual salary normalised to USD at the stored rate"
    field :effective_from, GraphQL::Types::ISO8601Date, null: false
    field :effective_to, GraphQL::Types::ISO8601Date, null: true, description: "Null for the current salary"
    field :current, Boolean, null: false, method: :current?
    field :reason, Types::Enums::SalaryReasonEnum, null: false
    field :note, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    def amount_usd
      # One rate lookup per request, shared by every salary row in the response.
      rates = context[:usd_rates] ||= ExchangeRate.pluck(:currency, :usd_rate).to_h
      (object.amount * rates.fetch(object.currency)).round(2)
    end
  end
end
