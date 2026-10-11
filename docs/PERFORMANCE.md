# Performance notes

All numbers measured locally on the seeded database (10,000 employees, 55,569 salary records, PostgreSQL 14, Apple Silicon). Targets from REQUIREMENTS.md: directory and analytics under 300 ms.

| Operation | Result |
|---|---|
| Seed 10,000 employees + 55,569 salary rows | 3.7 s (bulk `insert_all` in 2,000-row batches, one transaction) |
| GraphQL `employees` page: search `"ar"` + department filter, sorted by USD salary desc, 50 rows | 3 ms |
| GraphQL `analytics` with all seven aggregates (summary, 4 breakdowns, histogram, gender × level) | 4 ms total |
| Single aggregate (median by level over 9,313 active rows), `EXPLAIN ANALYZE` | 15 ms execution incl. planning |
| Table sizes incl. indexes | employees 9.7 MB, salary_records 10 MB |

## Why it is fast

**Indexes that match the access paths**
- `salary_records(employee_id) WHERE effective_to IS NULL`: the partial unique index doubles as the fastest way to reach each employee's current salary (one index scan over 10k narrow entries).
- `employees.search_text` GIN trigram index for substring search; `department`, `country_code`, `level`, `status`, `hired_on` B-tree indexes for filters and sorts; `(last_name, first_name)` for the default sort.

**No N+1.** The directory joins the current salary and exchange rate in one query, eager-loads `current_salary` for the page, and resolves exchange rates once per request via the GraphQL context. A spec asserts zero extra queries when reading salaries for a loaded page.

**Aggregation in the database.** Medians and quartiles use `percentile_cont`; the histogram uses `floor(amount_usd / bucket)` grouping. Nothing is loaded into Ruby to be summed.

**Bounded responses.** `perPage` is clamped to 200; schema depth and complexity are capped.

## Query plan for a typical directory search

```
Limit (rows=50)
  -> Sort (top-N heapsort, 28 kB)  key: amount * usd_rate DESC, id
     -> Nested Loop (rows=638)
        -> Hash Join (salary_records.employee_id = employees.id)
           -> Index Scan index_salary_records_one_current_per_employee (rows=10000)
           -> Bitmap Heap Scan employees  Recheck: department = 'Engineering'  Filter: search_text ILIKE '%ar%'
              -> Bitmap Index Scan index_employees_on_department
        -> Memoize (exchange_rates by currency)
```

The planner picks the department index and filters the trigram condition on the heap because `%ar%` is too short to be selective; for longer terms it switches to the GIN index. Either way the work is bounded by the filtered employee set, not the salary history.

## What would change at 100x scale

- Analytics: a materialised view of current salaries in USD refreshed on salary change, or summary tables per dimension.
- Directory: keyset pagination for deep pages (offset is fine for an org directory where nobody pages to 9,000).
- Export: stream the CSV response instead of building it in memory (the code already walks in pages).
