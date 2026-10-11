# frozen_string_literal: true

module Mutations
  class CreateEmployee < BaseMutation
    description "Creates an employee together with their opening salary"

    argument :attributes, Types::Inputs::EmployeeInput, required: true
    argument :salary, Types::Inputs::OpeningSalaryInput, required: true

    field :employee, Types::EmployeeType, null: true

    def resolve(attributes:, salary:)
      payload(Employees::Create.call(attributes: attributes.to_h, salary: salary.to_h), :employee)
    end
  end
end
