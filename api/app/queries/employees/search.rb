# frozen_string_literal: true

module Employees
  # Builds the directory query: free-text search, multi-value filters, sorting
  # (including by USD-normalised salary) and offset pagination. Shared by the
  # GraphQL `employees` field and the CSV export so both see identical rows.
  class Search
    DEFAULT_PER_PAGE = 25
    MAX_PER_PAGE = 200

    SORTS = {
      "name" => "employees.last_name %<dir>s, employees.first_name %<dir>s",
      "employee_code" => "employees.employee_code %<dir>s",
      "department" => "employees.department %<dir>s, employees.last_name ASC",
      "level" => "array_position(ARRAY[%<levels>s]::text[], employees.level) %<dir>s, employees.last_name ASC",
      "country" => "employees.country_code %<dir>s, employees.last_name ASC",
      "hired_on" => "employees.hired_on %<dir>s",
      "salary" => "#{ExchangeRate::USD_AMOUNT_SQL} %<dir>s"
    }.freeze

    attr_reader :page, :per_page

    def initialize(filter: {}, sort_by: "name", sort_direction: "asc", page: 1, per_page: DEFAULT_PER_PAGE)
      @filter = (filter || {}).to_h.symbolize_keys
      @sort_by = SORTS.key?(sort_by.to_s) ? sort_by.to_s : "name"
      @sort_direction = sort_direction.to_s.downcase == "desc" ? "DESC" : "ASC"
      @page = [ page.to_i, 1 ].max
      @per_page = per_page.to_i.clamp(1, MAX_PER_PAGE)
    end

    # Filtered, unsorted relation (joined to the current salary + rate).
    def relation
      scope = Employee.with_current_salary.search(@filter[:search])
      scope = scope.where(department: @filter[:departments]) if @filter[:departments].present?
      scope = scope.where(country_code: @filter[:country_codes]) if @filter[:country_codes].present?
      scope = scope.where(level: @filter[:levels]) if @filter[:levels].present?
      scope = scope.where(status: @filter[:statuses]) if @filter[:statuses].present?
      scope = scope.where(gender: @filter[:genders]) if @filter[:genders].present?
      scope
    end

    def sorted
      relation.order(Arel.sql(order_sql)).order(:id)
    end

    def records
      sorted.offset((page - 1) * per_page).limit(per_page).includes(:current_salary)
    end

    def total_count = relation.count

    def total_pages = [ (total_count.to_f / per_page).ceil, 1 ].max

    private

    def order_sql
      levels = Employee::LEVELS.map { |l| ActiveRecord::Base.connection.quote(l) }.join(",")
      format(SORTS.fetch(@sort_by), dir: @sort_direction, levels: levels)
    end
  end
end
