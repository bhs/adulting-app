# Testing & Coverage

This project uses a **coverage-driven** testing workflow: automated coverage
instrumentation guides where tests are written, and the CI pipeline fails when
coverage regresses below the configured thresholds.

## Tooling

- **[Jest](https://jestjs.io/)** as the test runner, configured through
  `next/jest` (see `jest.config.js`).
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**
  (`@testing-library/react`, `@testing-library/user-event`) for component and
  integration tests.
- **[jest-dom](https://github.com/testing-library/jest-dom)** for expressive DOM
  matchers (`toBeInTheDocument`, `toBeDisabled`, …).
- Jest's built-in coverage (powered by V8/Istanbul) for reports and threshold
  enforcement — no extra coverage dependency is required.

## Commands

```bash
npm test               # Run the full suite
npm run test:watch     # Watch mode for local development
npm run test:coverage  # Run with a coverage report + threshold enforcement
npm run test:ci        # Coverage run tuned for CI (--ci, limited workers)
```

A coverage run prints a per-file table and writes reports to `coverage/`
(git-ignored):

- `coverage/lcov-report/index.html` — browsable HTML report
- `coverage/lcov.info` — machine-readable report for external tooling
- `coverage/coverage-summary.json` — JSON totals

## Coverage thresholds

Thresholds live in `jest.config.js` under `coverageThreshold`. Jest exits
non-zero (failing the run) if any of them is not met.

| Scope                        | Statements | Branches | Functions | Lines |
| ---------------------------- | ---------- | -------- | --------- | ----- |
| Global                       | 80%        | 80%      | 80%       | 80%   |
| `lib/budget/calculations.ts` | 100%       | 100%     | 100%      | 100%  |
| `lib/budget/reducer.ts`      | 90%        | 90%      | 90%       | 90%   |

The stricter per-module gates protect the **financial calculation** code, where
a rounding or branch regression would directly affect the numbers shown to
users.

Coverage is collected from `lib/**` and `components/**` (excluding test files,
type declarations, and barrel `index.ts` re-exports).

## How to add tests

1. Run `npm run test:coverage` and open the report (or read the terminal
   table).
2. Find modules/lines/branches that are red and write focused tests for them —
   unit tests for pure logic (`lib/`), component tests for UI (`components/`),
   and integration tests for multi-component flows (e.g. the budget wizard in
   `components/BudgetCalculator/__tests__/BudgetCalculator.test.tsx`).
3. Re-run coverage and confirm the thresholds pass.

### Conventions

- Tests live in `__tests__/` folders next to the code they cover and are named
  `*.test.ts` / `*.test.tsx` (matched by `testMatch` in `jest.config.js`).
- `jest.setup.ts` registers jest-dom matchers and stubs `framer-motion` so
  animation-heavy components render as plain DOM under jsdom.
- Files that `jest.mock()` a module and then statically `import` the subject use
  the **global** `jest` (not `import { jest } from '@jest/globals'`). Under
  `next/jest`'s SWC transform, importing `jest` disables `jest.mock()` hoisting,
  which would let the subject bind to the real module before the mock is
  registered.

## CI enforcement

`.github/workflows/ci.yml` runs `npm run test:ci` on every push and pull
request to `main`. Because coverage thresholds are wired into Jest, a coverage
regression fails the job automatically. The HTML/lcov report is uploaded as a
build artifact (`coverage-report`) for inspection.
