# frozen_string_literal: true

module Types
  module Enums
    class EmployeeSortFieldEnum < Types::BaseEnum
      Employees::Search::SORTS.each_key { |s| value s.upcase, value: s }
    end
  end
end
