# frozen_string_literal: true

module Types
  module Inputs
    class EmployeeFilterInput < Types::BaseInputObject
      argument :search, String, required: false, description: "Matches name, email or employee code"
      argument :departments, [String], required: false
      argument :country_codes, [String], required: false
      argument :levels, [String], required: false
      argument :statuses, [Types::Enums::EmployeeStatusEnum], required: false
      argument :genders, [Types::Enums::GenderEnum], required: false
    end
  end
end
