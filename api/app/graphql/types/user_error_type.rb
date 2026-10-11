# frozen_string_literal: true

module Types
  # A validation problem the user can fix. `path` names the input field
  # (e.g. "email", "salary.amount") or "base" for record-level problems.
  class UserErrorType < Types::BaseObject
    field :path, String, null: false
    field :message, String, null: false
  end
end
