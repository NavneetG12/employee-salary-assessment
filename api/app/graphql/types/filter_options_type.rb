# frozen_string_literal: true

module Types
  # Reference data the UI needs to render filter controls and forms.
  class FilterOptionsType < Types::BaseObject
    field :departments, [String], null: false
    field :levels, [String], null: false, description: "Ordered from most junior to most senior"
    field :countries, [Types::CountryType], null: false
    field :currencies, [String], null: false
    field :salary_reasons, [Types::Enums::SalaryReasonEnum], null: false
  end
end
