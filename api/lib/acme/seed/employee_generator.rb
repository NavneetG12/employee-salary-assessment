# frozen_string_literal: true

module Acme
  module Seed
    # Generates a deterministic, realistic-looking workforce. All randomness goes
    # through one seeded RNG so the same seed always yields the same org.
    #
    # Salaries are modelled as  base(level) * dept_factor * country_factor * noise
    # in USD and then converted to the local currency, so that cross-country and
    # cross-level analytics show believable structure instead of white noise.
    class EmployeeGenerator
      COUNTRY_WEIGHTS = { "US" => 30, "IN" => 20, "GB" => 12, "DE" => 8, "CA" => 7, "AU" => 5, "FR" => 5, "SG" => 5, "BR" => 4, "JP" => 4 }.freeze
      DEPARTMENT_WEIGHTS = { "Engineering" => 35, "Sales" => 15, "Customer Success" => 10, "Product" => 8, "Marketing" => 7,
                             "Operations" => 7, "Finance" => 6, "Design" => 5, "People" => 4, "Legal" => 3 }.freeze
      LEVEL_WEIGHTS = { "Junior" => 18, "Mid" => 28, "Senior" => 25, "Staff" => 10, "Principal" => 4, "Manager" => 9, "Director" => 4, "VP" => 2 }.freeze
      GENDER_WEIGHTS = { "female" => 44, "male" => 52, "non_binary" => 2, "undisclosed" => 2 }.freeze
      STATUS_WEIGHTS = { "active" => 90, "on_leave" => 3, "terminated" => 7 }.freeze

      LEVEL_BASE_USD = { "Junior" => 65_000, "Mid" => 90_000, "Senior" => 125_000, "Staff" => 165_000, "Principal" => 210_000,
                         "Manager" => 150_000, "Director" => 220_000, "VP" => 300_000 }.freeze
      DEPARTMENT_FACTOR = { "Engineering" => 1.15, "Product" => 1.10, "Legal" => 1.10, "Design" => 1.0, "Sales" => 1.0, "Finance" => 0.95,
                            "Marketing" => 0.90, "Operations" => 0.85, "People" => 0.85, "Customer Success" => 0.80 }.freeze
      # Purchasing-power adjustment relative to the US, applied before converting to local currency.
      COUNTRY_FACTOR = { "US" => 1.0, "SG" => 0.85, "AU" => 0.85, "GB" => 0.80, "CA" => 0.80, "DE" => 0.75, "FR" => 0.70,
                         "JP" => 0.65, "BR" => 0.35, "IN" => 0.25 }.freeze
      # Synthetic data carries a small, documented pay gap so the pay-equity view has something to show.
      GENDER_FACTOR = { "female" => 0.97, "male" => 1.0, "non_binary" => 0.98, "undisclosed" => 1.0 }.freeze

      TITLES = {
        "Engineering" => %w[Software\ Engineer Backend\ Engineer Frontend\ Engineer Platform\ Engineer Data\ Engineer SRE],
        "Product" => %w[Product\ Manager Technical\ Product\ Manager Product\ Analyst],
        "Design" => %w[Product\ Designer UX\ Researcher Visual\ Designer],
        "Sales" => %w[Account\ Executive Sales\ Development\ Rep Solutions\ Engineer Account\ Manager],
        "Marketing" => %w[Marketing\ Manager Content\ Strategist Growth\ Marketer Brand\ Designer],
        "Customer Success" => %w[Customer\ Success\ Manager Support\ Engineer Onboarding\ Specialist],
        "Finance" => %w[Financial\ Analyst Accountant FP&A\ Analyst Payroll\ Specialist],
        "People" => %w[HR\ Business\ Partner Recruiter People\ Operations\ Specialist],
        "Legal" => %w[Legal\ Counsel Paralegal Compliance\ Analyst],
        "Operations" => %w[Operations\ Analyst Program\ Manager Facilities\ Coordinator]
      }.freeze

      REFERENCE_DATE = Date.new(2026, 10, 1)

      attr_reader :rng

      def initialize(count:, seed: 42)
        @count = count
        @rng = Random.new(seed)
        Faker::Config.random = @rng
      end

      # Returns [employee_rows, salary_rows_by_employee_code] ready for insert_all.
      def generate
        employees = Array.new(@count) { |i| build_employee(i + 1) }
        salaries = employees.to_h { |e| [e[:employee_code], build_salary_history(e)] }
        [employees, salaries]
      end

      private

      def build_employee(number)
        country = weighted(COUNTRY_WEIGHTS)
        department = weighted(DEPARTMENT_WEIGHTS)
        first = Faker::Name.first_name
        last = Faker::Name.last_name
        status = weighted(STATUS_WEIGHTS)
        hired_on = REFERENCE_DATE - rng.rand(30..(14 * 365))
        {
          employee_code: format("ACME-%06d", number),
          first_name: first,
          last_name: last,
          email: "#{slug(first)}.#{slug(last)}#{number}@acme.example",
          department: department,
          job_title: TITLES.fetch(department).sample(random: rng),
          level: weighted(LEVEL_WEIGHTS),
          country_code: country,
          gender: weighted(GENDER_WEIGHTS),
          status: status,
          hired_on: hired_on,
          terminated_on: (status == "terminated" ? hired_on + rng.rand(90..[ (REFERENCE_DATE - hired_on).to_i, 91 ].max) : nil)
        }
      end

      # Opening salary at hire, then a review most years with occasional promotions.
      def build_salary_history(employee)
        currency = Acme::Countries.find(employee[:country_code]).currency
        usd = LEVEL_BASE_USD.fetch(employee[:level]) * DEPARTMENT_FACTOR.fetch(employee[:department]) *
              COUNTRY_FACTOR.fetch(employee[:country_code]) * GENDER_FACTOR.fetch(employee[:gender]) * rng.rand(0.88..1.12)
        # Historic salary is lower; walk back from today's figure by the raises we are about to apply.
        years = ((REFERENCE_DATE - employee[:hired_on]).to_i / 365.0).floor
        review_years = (1..years).select { rng.rand < 0.7 }
        raises = review_years.map { rng.rand < 0.2 ? [ "promotion", rng.rand(1.12..1.20) ] : [ "annual_review", rng.rand(1.03..1.08) ] }
        starting_usd = usd / raises.sum(1.0) { |_, f| f - 1 }.then { |total| 1 + total }

        records = []
        amount_usd = starting_usd
        from = employee[:hired_on]
        reason = "hire"
        review_years.zip(raises).each do |year, (next_reason, factor)|
          to = Date.new(employee[:hired_on].year + year, 4, 1)
          next if to <= from || to > REFERENCE_DATE

          records << salary_row(amount_usd, currency, from, to - 1, reason)
          amount_usd *= factor
          from = to
          reason = next_reason
        end
        records << salary_row(amount_usd, currency, from, nil, reason)
        records
      end

      def salary_row(amount_usd, currency, from, to, reason)
        local = amount_usd / ExchangeRates::RATES.fetch(currency)
        step = %w[JPY INR].include?(currency) ? 10_000 : 500
        { amount: (local / step).round * step, currency: currency, effective_from: from, effective_to: to, reason: reason, note: nil }
      end

      def weighted(weights)
        pick = rng.rand(weights.values.sum)
        weights.each { |key, w| return key if (pick -= w) < 0 }
        weights.keys.last
      end

      def slug(name) = name.downcase.gsub(/[^a-z]/, "")
    end
  end
end
