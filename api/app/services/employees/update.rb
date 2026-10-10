# frozen_string_literal: true

module Employees
  class Update < ApplicationService
    def initialize(employee:, attributes:)
      @employee = employee
      @attributes = attributes.to_h.symbolize_keys
    end

    def call
      @employee.assign_attributes(@attributes)
      # Leaving the company clears nothing else; rejoining clears the leave date.
      @employee.terminated_on = nil unless @employee.terminated?
      @employee.save!
      success(@employee)
    rescue ActiveRecord::RecordInvalid
      failure(errors_from(@employee))
    end
  end
end
