# frozen_string_literal: true

module Types
  module Enums
    class SalaryReasonEnum < Types::BaseEnum
      SalaryRecord::REASONS.each { |r| value r.upcase, value: r }
    end
  end
end
