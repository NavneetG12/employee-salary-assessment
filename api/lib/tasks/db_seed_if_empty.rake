# frozen_string_literal: true

namespace :db do
  desc "Seed the database only if it has no employees (safe to run on every boot)"
  task seed_if_empty: :environment do
    if Employee.exists?
      puts "Database already has #{Employee.count} employees; skipping seed."
    else
      Rake::Task["db:seed"].invoke
    end
  end
end
