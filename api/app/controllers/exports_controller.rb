# frozen_string_literal: true

require "csv"

# GET /exports/employees.csv?search=...&departments[]=...&sort_by=salary&sort_direction=desc
# Same filter/sort vocabulary as the GraphQL `employees` field, so "export what
# I'm looking at" is exact. Plain REST because browsers download files from
# links, not from GraphQL responses.
class ExportsController < ApplicationController
  HEADERS = %w[employee_code first_name last_name email department job_title level country currency
               annual_salary annual_salary_usd status hired_on terminated_on salary_effective_from].freeze
  BATCH = 1_000

  def employees
    search = Employees::Search.new(filter: filter_params, sort_by: params[:sort_by], sort_direction: params[:sort_direction])
    rates = ExchangeRate.pluck(:currency, :usd_rate).to_h

    csv = CSV.generate do |out|
      out << HEADERS
      each_row(search) do |employee|
        salary = employee.current_salary
        out << [ employee.employee_code, employee.first_name, employee.last_name, employee.email, employee.department, employee.job_title,
                 employee.level, employee.country_code, salary.currency, salary.amount.to_s("F"), (salary.amount * rates.fetch(salary.currency)).round(2).to_s("F"),
                 employee.status, employee.hired_on, employee.terminated_on, salary.effective_from ]
      end
    end

    send_data csv, filename: "acme-employees-#{Date.current.iso8601}.csv", type: "text/csv"
  end

  private

  def filter_params
    params.permit(:search, departments: [], country_codes: [], levels: [], statuses: [], genders: []).to_h
  end

  # Walks the sorted relation in pages so memory stays flat regardless of size.
  def each_row(search)
    page = 1
    loop do
      batch = Employees::Search.new(filter: filter_params, sort_by: params[:sort_by], sort_direction: params[:sort_direction],
                                    page: page, per_page: BATCH).records.to_a
      batch.each { |employee| yield employee }
      break if batch.size < BATCH

      page += 1
    end
  end
end
