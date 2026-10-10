# ACME Salary Manager — Requirements

**Persona:** HR Manager at ACME (10,000 employees, ~10 countries). Today salaries live in spreadsheets.
**Goal:** Replace the spreadsheets with a web app that is the single source of truth for salary data and can answer "how does ACME pay people?" in seconds, not hours.

## What success looks like
1. Any employee's current salary and full salary history is findable in under 10 seconds.
2. A salary change is recorded as an auditable event (what, when, why), never as an overwrite.
3. Org-wide pay questions (by department, country, level, gender) are answered from live data, normalised to one reporting currency.
4. Nothing is lost moving off Excel: filtered data can be exported back to CSV.

## In scope (v1)
| # | Feature | Why it matters to the HR manager |
|---|---------|----------------------------------|
| 1 | **Employee directory** — server-side search (name / email / employee code), filters (department, country, level, status), sorting, pagination over 10k rows | The daily workflow; must stay fast at 10k+ |
| 2 | **Employee profile** with **salary history timeline** | "What did we pay this person and when did it change?" |
| 3 | **Create / edit employee** | Joiners, moves, leavers |
| 4 | **Adjust salary** (amount, currency, effective date, reason, note). Closes the prior record; prior records are immutable | Audit trail and the ability to answer historical questions |
| 5 | **Analytics dashboard** — headcount, total payroll, average/median salary; breakdowns by department, country, level (pay bands: min / p25 / median / p75 / max); salary distribution; median pay by gender per level | The "how do we pay people?" questions, including pay equity |
| 6 | **Multi-currency with USD normalisation** via an exchange-rate table | Cross-country comparison is meaningless in local currencies |
| 7 | **CSV export** of the current filtered directory | HR still needs to hand data to finance / auditors |
| 8 | **Seed data**: 10,000 realistic employees with multi-step salary histories | Lets reviewers evaluate real performance and real-looking analytics |

## Deliberately out of scope (and why)
| Left out | Reasoning |
|----------|-----------|
| Authentication / roles | Single persona (HR manager) in this brief. In production this is the first thing to add (SSO + role-based access, salary data is sensitive); it is orthogonal to the domain model and would consume a disproportionate share of the time budget. The app is structured so a `current_user` can be threaded through the GraphQL context later. |
| Payroll execution, payslips, tax | The brief is salary *management*, not payroll processing. Those are separate systems with regulatory scope per country. |
| Bonuses, equity, benefits, allowances | Total-compensation is a real need but multiplies the data model. v1 tracks base annual salary; the `salary_records` design extends to other components via a `component` column. |
| Live FX rates | Rates are stored in a table seeded with fixed values; swapping in a daily feed is a one-job change and would make tests non-deterministic. |
| Bulk CSV import | Import needs a validation / preview / error-correction UX to be trustworthy. One-time migration from Excel is better done as a scripted load with HR review than a self-serve feature. |
| Approval workflows, notifications | Depends on org structure and roles, which are out of scope with auth. |
| Soft-delete of employees | Leavers are modelled as `status: terminated` so history and analytics stay intact. Hard delete is intentionally not offered. |

## Non-functional requirements
- Directory and analytics queries must respond in < 300 ms at 10k employees (indexes, SQL aggregation, no N+1).
- All salary math is done in SQL with `numeric`, never floats in the database.
- Deterministic, fast test suite (seeded randomness, no network).
- One deployable unit: Rails serves the GraphQL API and the built React SPA.
