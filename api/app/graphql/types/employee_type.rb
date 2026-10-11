# frozen_string_literal: true

module Types
  class EmployeeType < Types::BaseObject
    field :id, ID, null: false
    field :employee_code, String, null: false
    field :first_name, String, null: false
    field :last_name, String, null: false
    field :full_name, String, null: false
    field :email, String, null: false
    field :department, String, null: false
    field :job_title, String, null: false
    field :level, String, null: false
    field :country, Types::CountryType, null: false
    field :gender, Types::Enums::GenderEnum, null: false
    field :status, Types::Enums::EmployeeStatusEnum, null: false
    field :hired_on, GraphQL::Types::ISO8601Date, null: false
    field :terminated_on, GraphQL::Types::ISO8601Date, null: true
    field :current_salary, Types::SalaryRecordType, null: true
    field :salary_history, [Types::SalaryRecordType], null: false, description: "Oldest first"
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    def salary_history
      object.salary_records.chronological
    end
  end
end
