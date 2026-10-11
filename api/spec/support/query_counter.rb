# frozen_string_literal: true

# `expect { ... }.not_to exceed_query_limit(n)` — counts SQL statements issued
# inside the block (ignoring transaction bookkeeping).
RSpec::Matchers.define :exceed_query_limit do |limit|
  supports_block_expectations

  match do |block|
    @count = 0
    counter = ->(*, payload) { @count += 1 unless payload[:name] == "SCHEMA" || payload[:sql] =~ /\A(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)/i }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    @count > limit
  end

  failure_message_when_negated { |_| "expected at most #{limit} queries, got #{@count}" }
end
