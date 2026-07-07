# Architecture Overview - Budget Calculator Wizard

## Component Hierarchy

```
app/page.tsx
  └── BudgetCalculator (main component with useReducer)
      ├── WizardNav (navigation bar)
      │   └── Displays current stage and completed stages
      │
      ├── Stage1Spending (conditional render when currentStage === 1)
      │   ├── Expense form (add/edit)
      │   ├── Expense list (with edit/remove)
      │   └── Total expenses display
      │
      ├── Stage2Income (conditional render when currentStage === 2)
      │   ├── Income form (add/edit)
      │   ├── Income list (with edit/remove)
      │   └── Total income display
      │
      └── Stage3Results (conditional render when currentStage === 3)
          ├── Summary cards (income, expenses)
          ├── Surplus/Deficit display
          ├── Points animation (Framer Motion)
          ├── Confetti animation
          └── Budget breakdown
```

## State Flow

```
┌─────────────────────────────────────────┐
│         BudgetCalculator.tsx            │
│                                         │
│  const [state, dispatch] = useReducer(  │
│    budgetReducer,                       │
│    initialBudgetState                   │
│  )                                      │
│                                         │
│  State:                                 │
│  ┌───────────────────────────────────┐ │
│  │ - expenses: ExpenseCategory[]    │ │
│  │ - income: IncomeSource[]         │ │
│  │ - currentStage: number           │ │
│  │ - completedStages: Set<number>   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
           │
           │ Props passed down
           │
    ┌──────┴───────┬─────────────┬──────────────┐
    │              │             │              │
    ▼              ▼             ▼              ▼
WizardNav    Stage1Spending  Stage2Income  Stage3Results
    │              │             │              │
    │              │             │              │
    └──────────────┴─────────────┴──────────────┘
                   │
                   │ Dispatch actions
                   │
                   ▼
        ┌──────────────────────┐
        │   budgetReducer()    │
        │  (lib/budget/reducer)│
        └──────────────────────┘
```

## Action Flow Examples

### Adding an Expense

```
User Input (Stage1Spending)
    │
    ▼
onAddExpense(name, amount)
    │
    ▼
dispatch({
  type: 'ADD_EXPENSE',
  payload: { name, amount }
})
    │
    ▼
budgetReducer() processes action
    │
    ▼
New state with expense added
    │
    ▼
Component re-renders with updated list
```

### Navigating Stages

```
User clicks "Next" button
    │
    ▼
handleNextStage(currentStage)
    │
    ├── dispatch({ type: 'COMPLETE_STAGE', payload: { stage: 1 } })
    │
    └── dispatch({ type: 'SET_STAGE', payload: { stage: 2 } })
    │
    ▼
State updated: currentStage = 2, completedStages.add(1)
    │
    ▼
Stage2Income component renders
```

## Data Flow for Results

```
Stage3Results receives budgetState
    │
    ▼
calculateBudgetSummary(state)
    │
    ├── totalExpenses = sum(expenses)
    ├── totalIncome = sum(income)
    ├── surplus = totalIncome - totalExpenses
    ├── savingsRate = (surplus / totalIncome) * 100
    └── points = surplus * 0.1
    │
    ▼
Display results with animations
```

## Reducer Actions

```typescript
// Expense Actions
ADD_EXPENSE    -> Add new expense with generated ID
UPDATE_EXPENSE -> Update existing expense by ID
REMOVE_EXPENSE -> Remove expense by ID

// Income Actions
ADD_INCOME     -> Add new income source with generated ID
UPDATE_INCOME  -> Update existing income by ID
REMOVE_INCOME  -> Remove income by ID

// Navigation Actions
SET_STAGE      -> Change current stage (1, 2, or 3)
COMPLETE_STAGE -> Mark a stage as completed

// Utility Actions
RESET          -> Reset to initial state
```

## Key Design Patterns

### 1. Container/Presentational Pattern
- **BudgetCalculator**: Container with state and logic
- **Stage components**: Presentational with props

### 2. Reducer Pattern
- Single source of truth for all budget data
- Predictable state updates
- Easy to test and debug

### 3. Compound Components
- WizardNav + Stages work together
- Shared state managed by parent

### 4. Progressive Disclosure
- Stages revealed sequentially
- Can't skip ahead
- Can return to completed stages

## Animation Timeline (Stage 3)

```
Page Load
  │
  ├─ 0.0s: Main container fade in
  │
  ├─ 0.1s: Income card scale + fade in
  │
  ├─ 0.2s: Expenses card scale + fade in
  │
  ├─ 0.3s: Summary card fade in
  │
  ├─ 0.5s: Surplus amount spring animation
  │
  ├─ 0.7s: Points card fade in (if surplus > 0)
  │
  ├─ 0.9s: Points number spring animation
  │
  ├─ 1.0s: Confetti particles animate
  │
  └─ 1.3s: All animations complete
```

## File Dependencies

```
BudgetCalculator.tsx
├── imports from lib/budget/reducer
│   ├── budgetReducer
│   └── initialBudgetState
│
├── imports from lib/budget/types
│   ├── BudgetState
│   ├── ExpenseCategory
│   └── IncomeSource
│
├── imports from ./WizardNav
├── imports from ./Stage1Spending
├── imports from ./Stage2Income
└── imports from ./Stage3Results
    └── imports from lib/budget/calculations
        ├── calculateBudgetSummary
        ├── formatCurrency
        └── formatPercentage
```

## Testing Strategy

```
Unit Tests (lib/budget/__tests__/)
├── reducer.test.ts
│   ├── Tests all 9 action types
│   ├── Tests state immutability
│   └── Tests edge cases
│
└── calculations.test.ts
    ├── Tests budget summary calculations
    ├── Tests formatting functions
    └── Tests edge cases (empty, negative)
```

## Performance Considerations

1. **Immutable Updates**: Reducer creates new state objects, React optimizes re-renders
2. **Conditional Rendering**: Only one stage component rendered at a time
3. **AnimatePresence**: Framer Motion handles exit animations efficiently
4. **Memoization**: Could add useMemo for calculations (currently not needed)
5. **ID Generation**: Simple timestamp-based IDs (sufficient for client-side)

## Future Enhancements

1. **Persistence**: Add localStorage or database sync
2. **Validation**: Add more robust form validation
3. **Accessibility**: Add ARIA labels and keyboard navigation
4. **Analytics**: Track user interactions with OpenTelemetry
5. **Export**: Generate PDF reports
6. **History**: Track budget changes over time
