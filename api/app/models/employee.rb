# frozen_string_literal: true

class Employee < ApplicationRecord
  DEPARTMENTS = %w[Engineering Product Design Sales Marketing Customer\ Success Finance People Legal Operations].freeze
  # Ordered from most junior to most senior; the order drives pay-band charts.
  LEVELS = %w[Junior Mid Senior Staff Principal Manager Director VP].freeze
  EMAIL_FORMAT = URI::MailTo::EMAIL_REGEXP

  enum :status, { active: "active", on_leave: "on_leave", terminated: "terminated" }, validate: true
  enum :gender, { female: "female", male: "male", non_binary: "non_binary", undisclosed: "undisclosed" }, validate: true

  has_many :salary_records, dependent: :destroy
  has_one :current_salary, -> { current }, class_name: "SalaryRecord", inverse_of: :employee

  before_validation :normalise_email

  validates :employee_code, presence: true, uniqueness: true
  validates :first_name, :last_name, :job_title, presence: true
  validates :email, presence: true, format: EMAIL_FORMAT, uniqueness: { case_sensitive: false }
  validates :department, inclusion: { in: DEPARTMENTS }
  validates :level, inclusion: { in: LEVELS }
  validates :country_code, inclusion: { in: Acme::Countries::CODES }
  validates :hired_on, presence: true
  validate :termination_consistent_with_status

  scope :search, ->(term) {
    term = term.to_s.strip.downcase
    term.blank? ? all : where("employees.search_text ILIKE ?", "%#{sanitize_sql_like(term)}%")
  }

  # Joins the single current salary record and its exchange rate so callers can
  # select / order by `salary_records.amount` or the USD-normalised amount.
  scope :with_current_salary, -> {
    joins("INNER JOIN salary_records ON salary_records.employee_id = employees.id AND salary_records.effective_to IS NULL")
      .joins("INNER JOIN exchange_rates ON exchange_rates.currency = salary_records.currency")
  }

  def full_name = "#{first_name} #{last_name}"
  def country = Acme::Countries.find(country_code)

  # Local currency for this employee, derived from their country.
  def default_currency = country.currency

  def self.next_employee_code
    last_number = maximum("NULLIF(regexp_replace(employee_code, '\\D', '', 'g'), '')::integer").to_i
    format("ACME-%06d", last_number + 1)
  end

  private

  def normalise_email
    self.email = email.to_s.strip.downcase.presence
  end

  def termination_consistent_with_status
    if terminated? && terminated_on.blank?
      errors.add(:terminated_on, "is required when status is terminated")
    elsif !terminated? && terminated_on.present?
      errors.add(:terminated_on, "must be blank unless status is terminated")
    elsif terminated_on.present? && hired_on.present? && terminated_on < hired_on
      errors.add(:terminated_on, "cannot be before the hire date")
    end
  end
end
