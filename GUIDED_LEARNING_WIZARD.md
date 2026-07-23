# Guided Learning Budget Wizard

A step-by-step budgeting experience that teaches financial literacy while the
user builds a budget. Each step focuses on a single budget category and pairs it
with a short lesson; the final screen scores the resulting budget.

## The flow

The wizard walks through four categories, one per step, then a summary:

1. **Income** – take-home pay and side income
2. **Fixed expenses** – recurring "needs" (rent, insurance, loan payments)
3. **Variable spending** – flexible "wants" (groceries, dining, entertainment)
4. **Savings** – money paid to your future self
5. **Summary dashboard** – full budget + financial health score

### Education on every step

Each step renders (unless quick mode is on):

- **An explanation** of what the category is.
- **A "why it matters" callout** – the practical impact of getting it right.
- **A "common mistake"** young adults make with that category.
- **An interactive mini-challenge / rule-of-thumb widget:**
  - Income & Savings steps: a **savings-rate slider** — drag to see how much a
    given rate could grow into over 10 / 20 / 30 years (7% assumed return).
  - Fixed & Variable steps: a **live 50/30/20 gauge** that compares the category
    total to its target share of income as you add line items.

Educational content is **co-located with each step's component** (a local
`EDUCATION` constant in each `steps/*Step.tsx` file) so the lesson and the UI
evolve together.

### Financial health score

The summary dashboard computes a 0–100 score with a letter grade, built from
four explained metrics based on the 50/30/20 rule plus a cash-flow check:

| Metric              | Target                | Weight |
| ------------------- | --------------------- | ------ |
| Savings rate        | ≥ 20% of income       | 0.35   |
| Cash flow           | Not overspending      | 0.25   |
| Fixed costs (needs) | ≤ 50% of income       | 0.20   |
| Variable (wants)    | ≤ 30% of income       | 0.20   |

Each metric shows a plain-language explanation tailored to the user's numbers.

## Quick mode

A **Quick mode** toggle (top-right) hides the educational cards and
mini-challenges for returning users who just want to fill in numbers. The
preference is persisted and survives "Start Over".

## Persistence

All state is saved to `localStorage` under the key `guided-budget-v1` and
restored on the next visit (see `lib/budget/guided/storage.ts`). Loading is
defensive: malformed or stale data falls back to a clean initial state. No
server-side storage or database schema changes are involved.

## Architecture

### Components (`components/GuidedBudget/`)

```
GuidedBudgetWizard.tsx     # Container: useReducer + localStorage + quick mode
ProgressIndicator.tsx      # Sticky progress bar with clickable completed steps
StepLayout.tsx             # Shared step scaffold (heading, education, nav)
EducationCard.tsx          # Presents explanation / why-it-matters / mistake
SavingsRateSlider.tsx      # Interactive long-term wealth projection
RuleOfThumbGauge.tsx       # Live 50/30/20 comparison gauge
LineItemEditor.tsx         # Reusable add/edit/remove list for a category
SummaryDashboard.tsx       # Full budget + financial health score
steps/
  IncomeStep.tsx           # Each step co-locates its own EDUCATION content
  FixedExpensesStep.tsx
  VariableExpensesStep.tsx
  SavingsStep.tsx
```

### State & logic (`lib/budget/guided/`)

```
types.ts          # State shape, actions, category ordering
reducer.ts        # useReducer logic (add/update/remove/navigate/quick-mode)
calculations.ts   # Totals, financial health score, wealth projection
storage.ts        # Validated localStorage load/save/clear
__tests__/        # reducer, calculations, and storage tests
```

## Tests

```bash
npm test                        # all tests
npx jest lib/budget/guided      # just this variation's tests
```

Covers reducer actions and navigation clamping, the health-score math and
compound-interest projection, and localStorage serialization/validation.
