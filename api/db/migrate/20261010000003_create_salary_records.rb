# frozen_string_literal: true

class CreateSalaryRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :salary_records do |t|
      t.references :employee, null: false, foreign_key: true
      t.decimal :amount, precision: 14, scale: 2, null: false
      t.string :currency, limit: 3, null: false
      t.date :effective_from, null: false
      t.date :effective_to # NULL means "current"
      t.string :reason, null: false
      t.text :note
      t.timestamps
    end

    add_index :salary_records, %i[employee_id effective_from]
    # Exactly one open (current) salary per employee, enforced by the database.
    add_index :salary_records, :employee_id, unique: true, where: "effective_to IS NULL",
                                             name: "index_salary_records_one_current_per_employee"
    add_index :salary_records, :currency

    add_check_constraint :salary_records, "amount > 0", name: "salary_records_positive_amount"
    add_check_constraint :salary_records, "effective_to IS NULL OR effective_to >= effective_from",
                         name: "salary_records_valid_period"
  end
end
