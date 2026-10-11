# frozen_string_literal: true

module Types
  # Each field is one aggregate SQL query, run only when requested.
  class AnalyticsType < Types::BaseObject
    field :summary, Types::AnalyticsSummaryType, null: false
    field :by_department, [Types::GroupStatType], null: false
    field :by_country, [Types::GroupStatType], null: false
    field :by_level, [Types::GroupStatType], null: false, description: "Pay bands, most junior first"
    field :by_gender, [Types::GroupStatType], null: false
    field :salary_distribution, [Types::HistogramBucketType], null: false do
      argument :bucket_usd, Integer, required: false, default_value: Analytics::Report::DEFAULT_BUCKET_USD
    end
    field :pay_by_gender_and_level, [Types::GenderLevelStatType], null: false

    def by_department = object.by(:department)
    def by_country = object.by(:country)
    def by_level = object.by(:level)
    def by_gender = object.by(:gender)
    def salary_distribution(bucket_usd:) = object.salary_distribution(bucket_usd: bucket_usd)
  end
end
