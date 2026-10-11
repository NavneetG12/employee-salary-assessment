# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :employees, Types::EmployeePageType, null: false, description: "Searchable, filterable, paginated directory" do
      argument :filter, Types::Inputs::EmployeeFilterInput, required: false
      argument :sort_by, Types::Enums::EmployeeSortFieldEnum, required: false, default_value: "name"
      argument :sort_direction, Types::Enums::SortDirectionEnum, required: false, default_value: "asc"
      argument :page, Integer, required: false, default_value: 1
      argument :per_page, Integer, required: false, default_value: Employees::Search::DEFAULT_PER_PAGE
    end

    field :employee, Types::EmployeeType, null: true do
      argument :id, ID, required: true
    end

    field :filter_options, Types::FilterOptionsType, null: false

    def employees(filter: nil, sort_by:, sort_direction:, page:, per_page:)
      Employees::Search.new(filter: filter&.to_h, sort_by: sort_by, sort_direction: sort_direction, page: page, per_page: per_page)
    end

    def employee(id:)
      Employee.includes(:current_salary).find_by(id: id)
    end

    def filter_options
      {
        departments: Employee::DEPARTMENTS,
        levels: Employee::LEVELS,
        countries: Acme::Countries::ALL,
        currencies: Acme::Countries::CURRENCIES,
        salary_reasons: SalaryRecord::REASONS
      }
    end
  end
end
