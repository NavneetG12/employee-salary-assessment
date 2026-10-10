# frozen_string_literal: true

module Salaries
  # Records a salary change as a new period: the current record is closed the day
  # before the new one starts, and the new record becomes current. History is
  # append-only; existing rows are never rewritten.
  class Adjust < ApplicationService
    def initialize(employee:, amount:, effective_from:, reason:, currency: nil, note: nil)
      @employee = employee
      @amount = amount
      @currency = currency
      @effective_from = effective_from
      @reason = reason
      @note = note
    end

    def call
      ActiveRecord::Base.transaction do
        @employee.lock!
        current = @employee.current_salary
        return failure(error(:base, "Employee has no current salary to adjust")) if current.nil?
        return failure(error(:reason, "\"hire\" is only valid for the opening salary")) if @reason == "hire"

        if @effective_from.blank? || @effective_from <= current.effective_from
          return failure(error(:effective_from, "must be after the current salary's start date (#{current.effective_from})"))
        end

        new_record = @employee.salary_records.build(
          amount: @amount,
          currency: @currency.presence || current.currency,
          effective_from: @effective_from,
          reason: @reason,
          note: @note
        )
        return failure(errors_from(new_record)) if new_record.invalid?

        current.update!(effective_to: @effective_from - 1.day)
        new_record.save!
        @employee.reload
        success(new_record)
      end
    end
  end
end
