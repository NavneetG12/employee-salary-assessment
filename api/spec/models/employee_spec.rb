# frozen_string_literal: true

RSpec.describe Employee do
  describe "validations" do
    it "is valid with the factory defaults" do
      expect(build(:employee)).to be_valid
    end

    it "requires a known department, level and country" do
      employee = build(:employee, department: "Astrology", level: "Wizard", country_code: "ZZ")
      expect(employee).not_to be_valid
      expect(employee.errors.attribute_names).to contain_exactly(:department, :level, :country_code)
    end

    it "normalises and uniquely constrains email case-insensitively" do
      create(:employee, email: "Ada@ACME.example")
      dup = build(:employee, email: "  ADA@acme.example ")
      expect(dup).not_to be_valid
      expect(dup.errors[:email]).to include("has already been taken")
    end

    it "requires terminated_on when terminated and forbids it otherwise" do
      expect(build(:employee, status: "terminated", terminated_on: nil)).not_to be_valid
      expect(build(:employee, status: "active", terminated_on: Date.new(2025, 1, 1))).not_to be_valid
      expect(build(:employee, :terminated)).to be_valid
    end

    it "rejects termination before hire" do
      employee = build(:employee, status: "terminated", hired_on: Date.new(2024, 1, 1), terminated_on: Date.new(2023, 1, 1))
      expect(employee).not_to be_valid
      expect(employee.errors[:terminated_on]).to include("cannot be before the hire date")
    end
  end

  describe ".search" do
    before do
      create(:employee, first_name: "Grace", last_name: "Hopper", email: "grace@acme.example", employee_code: "ACME-000042")
      create(:employee, first_name: "Alan", last_name: "Turing", email: "alan@acme.example", employee_code: "ACME-000043")
    end

    it "matches on any part of the name, email or code, case-insensitively" do
      expect(described_class.search("HOPP").map(&:first_name)).to eq(%w[Grace])
      expect(described_class.search("alan@").map(&:first_name)).to eq(%w[Alan])
      expect(described_class.search("000042").map(&:first_name)).to eq(%w[Grace])
      expect(described_class.search("grace hopper").map(&:first_name)).to eq(%w[Grace])
    end

    it "returns everything for a blank term and escapes LIKE wildcards" do
      expect(described_class.search("  ").count).to eq(2)
      expect(described_class.search("%").count).to eq(0)
    end
  end

  describe ".with_current_salary" do
    it "joins only the open salary record" do
      employee = create(:employee, :with_salary, amount: 50_000)
      create(:salary_record, employee: employee, amount: 40_000, effective_from: Date.new(2020, 1, 1), effective_to: Date.new(2022, 2, 28))

      row = described_class.with_current_salary.select("employees.*, salary_records.amount AS current_amount").find(employee.id)
      expect(row.current_amount).to eq(50_000)
    end
  end

  describe ".next_employee_code" do
    it "increments the highest existing code and zero-pads" do
      create(:employee, employee_code: "ACME-000007")
      expect(described_class.next_employee_code).to eq("ACME-000008")
    end

    it "starts at 1 when there are no employees" do
      expect(described_class.next_employee_code).to eq("ACME-000001")
    end
  end

  it "derives the default currency from the country" do
    expect(build(:employee, country_code: "IN").default_currency).to eq("INR")
  end
end
