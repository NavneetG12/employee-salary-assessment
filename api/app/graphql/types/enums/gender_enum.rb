# frozen_string_literal: true

module Types
  module Enums
    class GenderEnum < Types::BaseEnum
      Employee.genders.each_key { |g| value g.upcase, value: g }
    end
  end
end
