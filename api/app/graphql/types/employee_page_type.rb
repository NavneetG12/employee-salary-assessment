# frozen_string_literal: true

module Types
  # Offset pagination: HR users think in page numbers and need a total count,
  # which Relay cursors make awkward.
  class EmployeePageType < Types::BaseObject
    field :nodes, [Types::EmployeeType], null: false
    field :total_count, Integer, null: false
    field :page, Integer, null: false
    field :per_page, Integer, null: false
    field :total_pages, Integer, null: false

    def nodes = object.records
  end
end
