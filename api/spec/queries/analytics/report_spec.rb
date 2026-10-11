# frozen_string_literal: true

RSpec.describe Analytics::Report do
  before do
    create(:exchange_rate, :gbp)
    create(:employee, :with_salary, department: "Engineering", level: "Senior", country_code: "US", gender: "male", amount: 100_000)
    create(:employee, :with_salary, department: "Engineering", level: "Senior", country_code: "US", gender: "female", amount: 90_000)
    create(:employee, :with_salary, department: "Engineering", level: "Junior", country_code: "GB", gender: "female", amount: 40_000, currency: "GBP") # 50,000 USD
    create(:employee, :with_salary, department: "Sales", level: "Mid", country_code: "US", gender: "male", amount: 70_000, status: "on_leave")
    create(:employee, :with_salary, :terminated, department: "Sales", level: "VP", country_code: "US", amount: 500_000)
  end

  subject(:report) { described_class.new }

  describe "#summary" do
    it "covers active and on-leave employees in USD, excluding leavers by default" do
      expect(report.summary).to have_attributes(headcount: 4, total_payroll_usd: 310_000.0, average_usd: 77_500.0, median_usd: 80_000.0)
    end

    it "includes leavers when asked" do
      expect(described_class.new(filter: { statuses: %w[terminated] }).summary).to have_attributes(headcount: 1, total_payroll_usd: 500_000.0)
    end

    it "returns zeros for an empty population" do
      expect(described_class.new(filter: { departments: %w[Legal] }).summary).to have_attributes(headcount: 0, total_payroll_usd: 0.0, median_usd: 0.0)
    end
  end

  describe "#by" do
    it "groups by department ordered by total payroll" do
      eng, sales = report.by(:department)
      expect(eng).to have_attributes(key: "Engineering", headcount: 3, total_usd: 240_000.0, median_usd: 90_000.0, min_usd: 50_000.0, max_usd: 100_000.0)
      expect(eng.p25_usd).to eq(70_000.0)
      expect(eng.p75_usd).to eq(95_000.0)
      expect(sales).to have_attributes(key: "Sales", headcount: 1)
    end

    it "orders levels by seniority and labels countries" do
      expect(report.by(:level).map(&:key)).to eq(%w[Junior Mid Senior])
      expect(report.by(:country).map(&:label)).to eq([ "United States", "United Kingdom" ])
    end

    it "rejects unknown dimensions" do
      expect { report.by(:shoe_size) }.to raise_error(KeyError)
    end
  end

  describe "#salary_distribution" do
    it "returns contiguous buckets including empty ones" do
      buckets = report.salary_distribution(bucket_usd: 25_000)
      expect(buckets.map { |b| [ b.lower_usd, b.headcount ] }).to eq([ [ 50_000, 2 ], [ 75_000, 1 ], [ 100_000, 1 ] ])
      expect(described_class.new(filter: { departments: %w[Legal] }).salary_distribution).to eq([])
    end
  end

  describe "#pay_by_gender_and_level" do
    it "gives like-for-like medians per level and gender" do
      senior = report.pay_by_gender_and_level.select { |s| s.level == "Senior" }
      expect(senior.map { |s| [ s.gender, s.headcount, s.median_usd ] }).to eq([ [ "female", 1, 90_000.0 ], [ "male", 1, 100_000.0 ] ])
    end
  end
end
