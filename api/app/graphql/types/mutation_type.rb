# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_employee, mutation: Mutations::CreateEmployee
    field :update_employee, mutation: Mutations::UpdateEmployee
    field :adjust_salary, mutation: Mutations::AdjustSalary
  end
end
