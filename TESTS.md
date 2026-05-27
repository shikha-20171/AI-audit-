# Tests

All automated tests currently focus on the audit engine, because that is the highest-risk product logic and the minimum required coverage area from the brief.

## Test Files

- `src/lib/audit.test.ts`
  - Covers Cursor Business downgrading to Pro for a tiny team
  - Covers Claude Team downgrading to Pro when seat count is below the plan minimum
  - Covers low-volume OpenAI API spend converting to a chat subscription for research-style use
  - Covers high recurring API spend surfacing a credits note without fabricating savings
  - Covers duplicate coding copilots being consolidated
  - Covers overlapping small-team chat subscriptions being removed

## How To Run

```bash
npm test
```

## Notes

- The suite uses Vitest.
- The tests are deterministic and do not call external APIs.
- CI runs both lint and tests on every push to `main`.
