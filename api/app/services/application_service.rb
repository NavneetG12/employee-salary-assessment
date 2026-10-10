# frozen_string_literal: true

# Thin base for use-case objects. Each service exposes `.call(...)` and returns a
# Result; callers never rescue validation errors themselves.
class ApplicationService
  Result = Data.define(:record, :errors) do
    def success? = errors.empty?
    def failure? = !success?
  end

  UserError = Data.define(:path, :message)

  def self.call(...) = new(...).call

  private

  def success(record) = Result.new(record: record, errors: [])
  def failure(errors) = Result.new(record: nil, errors: Array(errors))
  def error(path, message) = UserError.new(path: path.to_s, message: message)

  def errors_from(model)
    model.errors.map { |e| error(e.attribute, e.message) }
  end
end
