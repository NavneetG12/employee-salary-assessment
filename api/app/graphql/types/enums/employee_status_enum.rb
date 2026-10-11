# frozen_string_literal: true

module Types
  module Enums
    class EmployeeStatusEnum < Types::BaseEnum
      Employee.statuses.each_key { |s| value s.upcase, value: s }
    end
  end
end
