# How AI tooling was used

The whole solution was built in a single Claude Code session (Claude, agentic CLI) with the engineer directing scope, stack and priorities. This file records how the collaboration worked, the instructions given, and where the AI was wrong and had to be corrected, because that is the part that shows whether the tool was used well.

## The brief given to the agent

The full assessment text was pasted, followed by one line of direction:

> rails + react + graphql + apollo client + postgres

Everything else (requirements document, data model, test strategy, UI design, deployment shape) was proposed by the agent and reviewed through the resulting commits. The agent was asked to work autonomously and make small, incremental commits.

## Working method

1. **Requirements before code.** The first commit is the one-page requirements document, including what was deliberately left out. The agent was asked to keep it to one page and to justify each exclusion.
2. **Plan as a checklist** (`docs/PLAN.md`), updated as work progressed, so the session could be interrupted and resumed (it was, once, at a usage limit).
3. **Domain layer first, tests alongside.** Migrations → models + specs → services + specs → seed + specs → GraphQL + specs. Each step was a commit with a green suite.
4. **Verify, don't assume.** Before writing frontend code the agent inspected the installed library versions and type definitions (Apollo Client 4, MUI 9, DataGrid 9 were newer than its training data). It then rendered every page with headless Chrome and inspected the screenshots, which caught a label collision on the pay-band chart.
5. **Tooling for the parts that are computable.** The categorical chart palette was run through a colour-vision-deficiency validator rather than judged by eye. Query plans were captured with `EXPLAIN ANALYZE` rather than described.

## Representative prompts and instructions

These are the kinds of instructions used, in the agent's own working log:

- "Write a one-page requirements doc before building. Persona is the HR manager. State what you are leaving out and why."
- "Salary history must be append-only; enforce one current record per employee in the database, not just in Ruby."
- "Seed 10,000 employees deterministically with realistic structure across level, department and country; it must run in seconds."
- "Reuse the directory's filtered relation for analytics so both views agree. All math in SQL with numerics."
- "Every chart gets a tooltip and a table view; colour belongs to the entity, not its rank; validate the palette."
- "Screenshot each page against the seeded data and fix anything that looks wrong before committing."

## Where the AI was wrong, and what caught it

| Issue | How it surfaced | Fix |
|---|---|---|
| Assumed MUI still accepted layout shorthands (`alignItems=`, `fontWeight=`) on `Stack`/`Typography` | TypeScript errors on first typecheck (removed in MUI 9) | Moved to `sx`; checked the changelog |
| Guessed an icon name (`PeopleOutline`) that doesn't exist in the installed icon set | Typecheck | Listed the package and picked an existing icon |
| Histogram buckets came back keyed by `BigDecimal`, so lookups by integer returned zero | Unit spec with hand-computed expectations | Cast in SQL and normalised keys |
| Typing into a `<input type="date">` with `user-event` under jsdom does nothing | Component test failed | Used `fireEvent.change` for date inputs |
| Native HTML `required` validation blocked the form's submit handler, so custom inline errors never appeared in tests (and would have shown browser bubbles to users) | Component test failed | `noValidate` on the forms; custom messages are the single validation UX |
| Started the API on port 3000, which was already taken by another local project | Health check returned a different app's schema | Checked `lsof`, used 3001 locally, documented the override |
| Generated graphql-ruby rake task crashed on a `nil` output path | Rake error | Replaced with a 6-line task |

None of these would have been visible without running the compiler, the tests and the browser. The habit that mattered most was treating the agent's first draft as a hypothesis and verifying it the same way a colleague's PR would be.

## What the agent did not do

- It did not deploy or record the demo video: both need the author's accounts and screen. The deployment config (`Dockerfile`, `docker-compose.yml`, `render.yaml`) was built and tested locally instead.
- It did not add authentication; the requirements document explains why that was scoped out for this exercise.
