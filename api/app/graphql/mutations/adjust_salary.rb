# frozen_string_literal: true

module Mutations
  class AdjustSalary < BaseMutation
    description "Records a new salary period; the previous one is closed the day before"

    argument :employee_id, ID, required: true
    argument :adjustment, Types::Inputs::SalaryAdjustmentInput, required: true

    field :employee, Types::EmployeeType, null: true
    field :salary_record, Types::SalaryRecordType, null: true

    def resolve(employee_id:, adjustment:)
      employee = Employee.find_by(id: employee_id)
      return not_found("employeeId", "Employee not found") unless employee

      result = Salaries::Adjust.call(employee: employee, **adjustment.to_h)
      payload(result, :salary_record).merge(employee: result.success? ? employee : nil)
    end
  end
end
