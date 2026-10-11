# frozen_string_literal: true

# Serves the built React app for any non-API path so client-side routes
# (/employees/42, /analytics) work on hard refresh. The HTML is never cached;
# the hashed assets under /public/assets are cached for a year.
class SpaController < ApplicationController
  INDEX = Rails.root.join("app/views/spa/index.html")

  def index
    unless File.exist?(INDEX)
      return render json: { error: "Web app not built. Run `bin/build-web` or use the Vite dev server on :5173." }, status: :not_found
    end

    response.headers["Cache-Control"] = "no-store"
    send_file INDEX, type: "text/html", disposition: "inline"
  end
end
