# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    argument_class Types::BaseArgument
    field_class Types::BaseField
    input_object_class Types::BaseInputObject
    object_class Types::BaseObject

    field :errors, [Types::UserErrorType], null: false

    private

    # Maps an ApplicationService::Result to the mutation payload.
    def payload(result, key)
      { key => result.record, errors: result.errors.map(&:to_h) }
    end

    def not_found(path, message)
      { errors: [ { path: path, message: message } ] }
    end
  end
end
