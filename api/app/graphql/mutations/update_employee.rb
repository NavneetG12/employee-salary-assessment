# frozen_string_literal: true

module Mutations
  class UpdateEmployee < BaseMutation
    argument :id, ID, required: true
    argument :attributes, Types::Inputs::EmployeeInput, required: true

    field :employee, Types::EmployeeType, null: true

    def resolve(id:, attributes:)
      employee = Employee.find_by(id: id)
      return not_found("id", "Employee not found") unless employee

      payload(Employees::Update.call(employee: employee, attributes: attributes.to_h), :employee)
    end
  end
end
