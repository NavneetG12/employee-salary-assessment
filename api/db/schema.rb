# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_10_10_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "employees", force: :cascade do |t|
    t.string "employee_code", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "department", null: false
    t.string "job_title", null: false
    t.string "level", null: false
    t.string "country_code", limit: 2, null: false
    t.string "gender", default: "undisclosed", null: false
    t.string "status", default: "active", null: false
    t.date "hired_on", null: false
    t.date "terminated_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.virtual "search_text", type: :text, as: "lower((((((((first_name)::text || ' '::text) || (last_name)::text) || ' '::text) || (email)::text) || ' '::text) || (employee_code)::text))", stored: true
    t.index "lower((email)::text)", name: "index_employees_on_lower_email", unique: true
    t.index ["country_code"], name: "index_employees_on_country_code"
    t.index ["department"], name: "index_employees_on_department"
    t.index ["employee_code"], name: "index_employees_on_employee_code", unique: true
    t.index ["hired_on"], name: "index_employees_on_hired_on"
    t.index ["last_name", "first_name"], name: "index_employees_on_last_name_and_first_name"
    t.index ["level"], name: "index_employees_on_level"
    t.index ["search_text"], name: "index_employees_on_search_text", opclass: :gin_trgm_ops, using: :gin
    t.index ["status"], name: "index_employees_on_status"
  end

  create_table "exchange_rates", force: :cascade do |t|
    t.string "currency", limit: 3, null: false
    t.decimal "usd_rate", precision: 18, scale: 8, null: false
    t.date "as_of", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["currency"], name: "index_exchange_rates_on_currency", unique: true
    t.check_constraint "usd_rate > 0::numeric", name: "exchange_rates_positive_rate"
  end

  create_table "salary_records", force: :cascade do |t|
    t.bigint "employee_id", null: false
    t.decimal "amount", precision: 14, scale: 2, null: false
    t.string "currency", limit: 3, null: false
    t.date "effective_from", null: false
    t.date "effective_to"
    t.string "reason", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["currency"], name: "index_salary_records_on_currency"
    t.index ["employee_id", "effective_from"], name: "index_salary_records_on_employee_id_and_effective_from"
    t.index ["employee_id"], name: "index_salary_records_on_employee_id"
    t.index ["employee_id"], name: "index_salary_records_one_current_per_employee", unique: true, where: "(effective_to IS NULL)"
    t.check_constraint "amount > 0::numeric", name: "salary_records_positive_amount"
    t.check_constraint "effective_to IS NULL OR effective_to >= effective_from", name: "salary_records_valid_period"
  end

  add_foreign_key "salary_records", "employees"
end
