# frozen_string_literal: true

class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pg_trgm"

    create_table :employees do |t|
      t.string :employee_code, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :department, null: false
      t.string :job_title, null: false
      t.string :level, null: false
      t.string :country_code, limit: 2, null: false
      t.string :gender, null: false, default: "undisclosed"
      t.string :status, null: false, default: "active"
      t.date :hired_on, null: false
      t.date :terminated_on
      t.timestamps
    end

    # Stored generated column so free-text search can hit one trigram index
    # instead of OR-ing ILIKEs across three columns.
    add_column :employees, :search_text, :virtual,
               type: :text, stored: true,
               as: "lower(first_name || ' ' || last_name || ' ' || email || ' ' || employee_code)"

    add_index :employees, :employee_code, unique: true
    add_index :employees, "lower(email)", unique: true, name: "index_employees_on_lower_email"
    add_index :employees, :search_text, using: :gin, opclass: :gin_trgm_ops
    add_index :employees, :department
    add_index :employees, :country_code
    add_index :employees, :level
    add_index :employees, :status
    add_index :employees, :hired_on
    add_index :employees, %i[last_name first_name]
  end
end
