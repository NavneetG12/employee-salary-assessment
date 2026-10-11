# frozen_string_literal: true

RSpec.describe "GET /exports/employees", type: :request do
  before do
    create(:exchange_rate, :gbp)
    create(:employee, :with_salary, first_name: "Ada", last_name: "Lovelace", country_code: "GB", currency: "GBP", amount: 100_000)
    create(:employee, :with_salary, first_name: "Bob", last_name: "Marley", department: "Sales", amount: 60_000)
  end

  it "downloads the filtered, sorted directory as CSV with USD column" do
    get "/exports/employees", params: { departments: [ "Engineering" ], sort_by: "salary", sort_direction: "desc" }

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/csv")
    expect(response.headers["Content-Disposition"]).to include("acme-employees-")

    rows = CSV.parse(response.body, headers: true)
    expect(rows.size).to eq(1)
    expect(rows.first.to_h).to include("first_name" => "Ada", "currency" => "GBP", "annual_salary" => "100000.0", "annual_salary_usd" => "125000.0")
  end

  it "exports everyone when unfiltered, in name order" do
    get "/exports/employees"
    expect(CSV.parse(response.body, headers: true).map { |r| r["first_name"] }).to eq(%w[Ada Bob])
  end
end
