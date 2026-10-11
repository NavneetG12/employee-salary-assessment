# frozen_string_literal: true

RSpec.describe "POST /graphql", type: :request do
  it "executes a query with JSON variables over HTTP" do
    create(:employee, :with_salary, first_name: "Ada")

    post "/graphql", params: { query: "query($p: Int) { employees(perPage: $p) { totalCount nodes { firstName } } }", variables: { p: 10 } }.to_json,
                     headers: { "CONTENT_TYPE" => "application/json" }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("data", "employees")).to eq("totalCount" => 1, "nodes" => [ { "firstName" => "Ada" } ])
  end
end
