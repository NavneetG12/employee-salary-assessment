# frozen_string_literal: true

RSpec.describe "SPA fallback", type: :request do
  it "serves the built index.html for client-side routes without caching it" do
    index = Rails.root.join("tmp/spa_index_test.html")
    File.write(index, "<html><body>app</body></html>")
    stub_const("SpaController::INDEX", index)

    get "/employees/42"

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/html")
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(response.body).to include("app")
  ensure
    File.delete(index) if File.exist?(index)
  end

  it "explains itself when the web app has not been built" do
    stub_const("SpaController::INDEX", Rails.root.join("tmp/does-not-exist.html"))
    get "/analytics"
    expect(response).to have_http_status(:not_found)
    expect(response.parsed_body["error"]).to match(/not built/)
  end

  it "serves the app to clients that accept anything" do
    index = Rails.root.join("tmp/spa_index_test2.html")
    File.write(index, "<html>app</html>")
    stub_const("SpaController::INDEX", index)

    get "/employees/42", headers: { "Accept" => "*/*" }

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("text/html")
  ensure
    File.delete(index) if File.exist?(index)
  end

  it "does not swallow API or asset paths" do
    get "/assets/missing.js"
    expect(response).to have_http_status(:not_found)
    post "/graphql", params: { query: "{ filterOptions { levels } }" }
    expect(response).to have_http_status(:ok)
  end
end
