# Budget Calculator - Wizard Reducer Variation

A three-stage interactive budget wizard that uses React's `useReducer` hook for state management and Framer Motion for animations.

## Features

### Three-Stage Wizard

1. **Stage 1: What You're Spending**
   - Add, edit, and remove expense categories
   - Real-time expense total calculation
   - Input validation

2. **Stage 2: What You're Making**
   - Add, edit, and remove income sources
   - Real-time income total calculation
   - Navigate back to previous stage

3. **Stage 3: How You Get There**
   - Gap analysis showing surplus or deficit
   - Savings rate calculation
   - Points system with celebratory animation (1 point per $10 surplus)
   - Complete budget breakdown
   - Animated confetti effect for surplus budgets

### Key Implementation Details

- **State Management**: All budget data is managed via `useReducer` hook, ensuring predictable state updates and instant recalculation when navigating between stages
- **Navigation**: Persistent top navigation bar allows jumping back to any completed stage
- **Animations**: Framer Motion provides smooth transitions between stages and celebratory effects
- **Responsive**: Mobile-friendly design with Tailwind CSS
- **Type Safe**: Full TypeScript implementation

## Architecture

### Components

```
components/BudgetCalculator/
├── BudgetCalculator.tsx       # Main wizard component with reducer
├── WizardNav.tsx              # Top navigation bar
├── Stage1Spending.tsx         # Expense management stage
├── Stage2Income.tsx           # Income management stage
└── Stage3Results.tsx          # Results and analytics stage
```

### State Management

```
lib/budget/
├── types.ts                   # TypeScript interfaces and action types
├── reducer.ts                 # Budget reducer logic
└── calculations.ts            # Budget calculation utilities
```

### Tests

```
lib/budget/__tests__/
├── reducer.test.ts            # Reducer logic tests
└── calculations.test.ts       # Calculation utility tests
```

## State Structure

```typescript
interface BudgetState {
  expenses: ExpenseCategory[]
  income: IncomeSource[]
  currentStage: number
  completedStages: Set<number>
}
```

## Reducer Actions

- `ADD_EXPENSE` / `UPDATE_EXPENSE` / `REMOVE_EXPENSE`
- `ADD_INCOME` / `UPDATE_INCOME` / `REMOVE_INCOME`
- `SET_STAGE` / `COMPLETE_STAGE`
- `RESET`

## Calculations

- **Total Income**: Sum of all income sources
- **Total Expenses**: Sum of all expense categories
- **Surplus/Deficit**: Income - Expenses
- **Savings Rate**: (Surplus / Income) × 100
- **Points**: Surplus × 0.1 (1 point per $10)

## Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

## Usage

The budget calculator is displayed on the home page. Users:

1. Add their monthly expenses in Stage 1
2. Add their monthly income in Stage 2
3. View results, savings rate, and earned points in Stage 3
4. Can navigate back to edit expenses or income
5. Can start over with the "Start Over" button

## Points System

Users earn points based on their monthly surplus:
- 1 point per $10 of surplus
- Displayed with an animated celebration
- Confetti animation for visual feedback

Example: $4,100 surplus = 410 points
