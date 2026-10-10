# frozen_string_literal: true

class CreateExchangeRates < ActiveRecord::Migration[8.0]
  def change
    create_table :exchange_rates do |t|
      t.string :currency, limit: 3, null: false
      # 1 unit of `currency` buys `usd_rate` US dollars.
      t.decimal :usd_rate, precision: 18, scale: 8, null: false
      t.date :as_of, null: false
      t.timestamps
    end

    add_index :exchange_rates, :currency, unique: true
    add_check_constraint :exchange_rates, "usd_rate > 0", name: "exchange_rates_positive_rate"
  end
end
