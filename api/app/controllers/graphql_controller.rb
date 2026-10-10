# frozen_string_literal: true

class GraphqlController < ApplicationController
  def execute
    result = ApiSchema.execute(
      params[:query],
      variables: prepare_variables(params[:variables]),
      context: {},
      operation_name: params[:operationName]
    )
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?

    handle_error_in_development(e)
  end

  private

  def prepare_variables(variables_param)
    case variables_param
    when String then variables_param.present? ? JSON.parse(variables_param) || {} : {}
    when Hash then variables_param
    when ActionController::Parameters then variables_param.to_unsafe_hash
    when nil then {}
    else raise ArgumentError, "Unexpected parameter: #{variables_param}"
    end
  end

  def handle_error_in_development(err)
    logger.error err.message
    logger.error err.backtrace.join("\n")
    render json: { errors: [ { message: err.message, backtrace: err.backtrace } ], data: {} }, status: :internal_server_error
  end
end
