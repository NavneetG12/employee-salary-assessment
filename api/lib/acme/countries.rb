# frozen_string_literal: true

module Acme
  # Static reference data for the countries ACME operates in. Kept in code rather
  # than a table because it changes rarely and is needed by validations, seeds
  # and the GraphQL layer alike.
  module Countries
    Country = Data.define(:code, :name, :currency)

    ALL = [
      Country.new("US", "United States", "USD"),
      Country.new("GB", "United Kingdom", "GBP"),
      Country.new("DE", "Germany", "EUR"),
      Country.new("FR", "France", "EUR"),
      Country.new("IN", "India", "INR"),
      Country.new("CA", "Canada", "CAD"),
      Country.new("AU", "Australia", "AUD"),
      Country.new("SG", "Singapore", "SGD"),
      Country.new("BR", "Brazil", "BRL"),
      Country.new("JP", "Japan", "JPY")
    ].freeze

    BY_CODE = ALL.index_by(&:code).freeze
    CODES = BY_CODE.keys.freeze
    CURRENCIES = ALL.map(&:currency).uniq.freeze

    def self.find(code) = BY_CODE.fetch(code.to_s.upcase) { raise KeyError, "Unknown country #{code.inspect}" }
    def self.find_by_code(code) = BY_CODE[code.to_s.upcase]
  end
end
