# Build plan and progress

Incremental commits, one concern each. Checked items are committed and green.

- [x] Requirements document (`docs/REQUIREMENTS.md`)
- [x] Rails 8 API scaffold: PostgreSQL, graphql-ruby, RSpec/FactoryBot/Faker, CORS
- [x] Schema + models: employees, salary_records (append-only history, one current row enforced by partial unique index), exchange_rates
- [x] Services: `Employees::Create`, `Employees::Update`, `Salaries::Adjust` (Result objects with field-level errors)
- [x] Seed: 10,000 employees / ~55k salary rows in ~4s via `insert_all`, deterministic (`bin/rails db:seed`)
- [x] GraphQL queries: `employees` (search / filter / sort / offset pagination), `employee(id)`, `filterOptions`
- [x] GraphQL mutations: `createEmployee`, `updateEmployee`, `adjustSalary` returning `{ record, errors: [UserError] }`
- [x] GraphQL `analytics`: headcount, payroll (USD), avg/median; by department / country / level (min, p25, median, p75, max); histogram; median by gender per level — all via SQL `percentile_cont`
- [x] CSV export endpoint for the filtered directory
- [x] Web: Vite + React + TypeScript + Apollo Client + MUI, GraphQL codegen from dumped `schema.graphql`
- [x] Web pages: directory (server-side DataGrid), employee profile + salary timeline + adjust-salary dialog, create/edit form, analytics dashboard (Recharts)
- [x] Web tests: Vitest + Testing Library + Apollo `MockedProvider`
- [x] Deployment: single Docker image (Rails serves API + built SPA from `public/`), `render.yaml`, `docker-compose.yml`
- [x] Docs: architecture, decisions/trade-offs, performance notes, AI usage log; README with run instructions

- [x] Deployed to Railway (Docker build from the CLI, Postgres add-on, seeded on first boot): https://web-production-1cc3.up.railway.app

Remaining for the author: record the demo video.
