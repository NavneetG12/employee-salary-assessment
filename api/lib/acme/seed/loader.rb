# frozen_string_literal: true

module Acme
  module Seed
    # Bulk-loads generated data with insert_all (one round trip per batch) instead
    # of ActiveRecord#create, which makes seeding 10k employees take seconds.
    class Loader
      BATCH = 2_000

      def self.run!(count: 10_000, seed: 42, reset: true, logger: Rails.logger)
        new(count: count, seed: seed, logger: logger).run!(reset: reset)
      end

      def initialize(count:, seed:, logger:)
        @count = count
        @seed = seed
        @logger = logger
      end

      def run!(reset:)
        started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        employees, salaries = EmployeeGenerator.new(count: @count, seed: @seed).generate

        ActiveRecord::Base.transaction do
          ActiveRecord::Base.connection.execute("TRUNCATE salary_records, employees RESTART IDENTITY") if reset
          ExchangeRates.upsert!
          employees.each_slice(BATCH) { |slice| Employee.insert_all!(stamp(slice)) }

          ids_by_code = Employee.where(employee_code: salaries.keys).pluck(:employee_code, :id).to_h
          rows = salaries.flat_map { |code, records| records.map { |r| r.merge(employee_id: ids_by_code.fetch(code)) } }
          rows.each_slice(BATCH) { |slice| SalaryRecord.insert_all!(stamp(slice)) }
        end

        elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
        @logger.info("Seeded #{Employee.count} employees and #{SalaryRecord.count} salary records in #{elapsed.round(1)}s")
      end

      private

      def stamp(rows)
        now = Time.current
        rows.map { |r| r.merge(created_at: now, updated_at: now) }
      end
    end
  end
end
