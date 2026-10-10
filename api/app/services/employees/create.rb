# frozen_string_literal: true

module Employees
  # Creates an employee together with their opening salary in one transaction.
  # An employee without a salary is not a meaningful record for HR, so the two
  # are never created separately.
  class Create < ApplicationService
    def initialize(attributes:, salary:)
      @attributes = attributes.to_h.symbolize_keys
      @salary = salary.to_h.symbolize_keys
    end

    def call
      employee = Employee.new(@attributes)
      employee.employee_code = Employee.next_employee_code if employee.employee_code.blank?

      record = employee.salary_records.build(
        amount: @salary[:amount],
        currency: @salary[:currency].presence || employee.default_currency,
        effective_from: @salary[:effective_from].presence || employee.hired_on,
        reason: "hire",
        note: @salary[:note]
      )

      ActiveRecord::Base.transaction do
        employee.save!
      end
      success(employee)
    rescue ActiveRecord::RecordInvalid
      failure(errors_from(employee) + errors_from(record).map { |e| error("salary.#{e.path}", e.message) })
    end
  end
end
