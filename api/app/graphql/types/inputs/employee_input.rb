# frozen_string_literal: true

module Types
  module Inputs
    # Every field optional so the same input serves create (validated by the
    # model) and partial update.
    class EmployeeInput < Types::BaseInputObject
      argument :first_name, String, required: false
      argument :last_name, String, required: false
      argument :email, String, required: false
      argument :department, String, required: false
      argument :job_title, String, required: false
      argument :level, String, required: false
      argument :country_code, String, required: false
      argument :gender, Types::Enums::GenderEnum, required: false
      argument :status, Types::Enums::EmployeeStatusEnum, required: false
      argument :hired_on, GraphQL::Types::ISO8601Date, required: false
      argument :terminated_on, GraphQL::Types::ISO8601Date, required: false
    end
  end
end
