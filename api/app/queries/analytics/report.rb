# frozen_string_literal: true

module Analytics
  # Answers "how does ACME pay people?" entirely in SQL over the current salary
  # of each employee, normalised to USD. Every method is a single aggregate
  # query, so the dashboard stays fast at 10k+ employees without caching.
  #
  # Terminated employees are excluded unless the filter asks for them: payroll
  # questions are about the people we pay today.
  class Report
    USD = ExchangeRate::USD_AMOUNT_SQL
    DEFAULT_STATUSES = %w[active on_leave].freeze
    DEFAULT_BUCKET_USD = 25_000

    DIMENSIONS = {
      "department" => { column: "employees.department", order: :total_desc },
      "country" => { column: "employees.country_code", order: :headcount_desc },
      "level" => { column: "employees.level", order: Employee::LEVELS },
      "gender" => { column: "employees.gender", order: Employee.genders.keys }
    }.freeze

    Summary = Data.define(:headcount, :total_payroll_usd, :average_usd, :median_usd)
    GroupStat = Data.define(:key, :label, :headcount, :total_usd, :average_usd, :median_usd, :p25_usd, :p75_usd, :min_usd, :max_usd)
    Bucket = Data.define(:lower_usd, :upper_usd, :headcount)
    GenderLevelStat = Data.define(:level, :gender, :headcount, :median_usd)

    def initialize(filter: {})
      filter = (filter || {}).to_h.symbolize_keys.except(:search)
      filter[:statuses] = DEFAULT_STATUSES if filter[:statuses].blank?
      @filter = filter
    end

    def summary
      count, total, avg, median = base.pick(Arel.sql(<<~SQL.squish))
        count(*), coalesce(sum(#{USD}), 0), coalesce(avg(#{USD}), 0),
        coalesce(percentile_cont(0.5) within group (order by #{USD}), 0)
      SQL
      Summary.new(headcount: count, total_payroll_usd: money(total), average_usd: money(avg), median_usd: money(median))
    end

    def by(dimension)
      spec = DIMENSIONS.fetch(dimension.to_s)
      rows = base.group(Arel.sql(spec[:column])).pluck(Arel.sql(<<~SQL.squish))
        #{spec[:column]}, count(*), sum(#{USD}), avg(#{USD}),
        percentile_cont(0.5) within group (order by #{USD}),
        percentile_cont(0.25) within group (order by #{USD}),
        percentile_cont(0.75) within group (order by #{USD}),
        min(#{USD}), max(#{USD})
      SQL
      stats = rows.map do |key, count, total, avg, median, p25, p75, min, max|
        GroupStat.new(key: key, label: label_for(dimension, key), headcount: count, total_usd: money(total), average_usd: money(avg),
                      median_usd: money(median), p25_usd: money(p25), p75_usd: money(p75), min_usd: money(min), max_usd: money(max))
      end
      sort_groups(stats, spec[:order])
    end

    # Contiguous histogram of current USD salaries in fixed-width buckets.
    def salary_distribution(bucket_usd: DEFAULT_BUCKET_USD)
      bucket_usd = bucket_usd.to_i.clamp(1_000, 1_000_000)
      counts = base.group(Arel.sql("floor((#{USD}) / #{bucket_usd})::integer")).count.transform_keys(&:to_i)
      return [] if counts.empty?

      (counts.keys.min..counts.keys.max).map do |i|
        Bucket.new(lower_usd: i * bucket_usd, upper_usd: (i + 1) * bucket_usd, headcount: counts.fetch(i, 0))
      end
    end

    # Median pay per gender within each level: the like-for-like pay-equity view.
    def pay_by_gender_and_level
      rows = base.group("employees.level", "employees.gender")
                 .pluck(Arel.sql("employees.level, employees.gender, count(*), percentile_cont(0.5) within group (order by #{USD})"))
      rows.map { |level, gender, count, median| GenderLevelStat.new(level: level, gender: gender, headcount: count, median_usd: money(median)) }
          .sort_by { |s| [ Employee::LEVELS.index(s.level), Employee.genders.keys.index(s.gender) ] }
    end

    private

    def base = Employees::Search.new(filter: @filter).relation

    def money(value) = value.to_d.round(2).to_f

    def label_for(dimension, key)
      case dimension.to_s
      when "country" then Acme::Countries.find_by_code(key)&.name || key
      when "gender" then key.to_s.humanize
      else key
      end
    end

    def sort_groups(stats, order)
      case order
      when :total_desc then stats.sort_by { |s| -s.total_usd }
      when :headcount_desc then stats.sort_by { |s| [ -s.headcount, s.key ] }
      when Array then stats.sort_by { |s| order.index(s.key) || order.size }
      end
    end
  end
end
