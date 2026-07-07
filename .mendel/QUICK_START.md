# Quick Start Guide - Budget Calculator Wizard

## Getting Started

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## How It Works

### User Flow

1. **Stage 1: What You're Spending**
   - Add expense categories (e.g., Rent, Groceries)
   - Edit or remove expenses
   - Click "Next" to proceed

2. **Stage 2: What You're Making**
   - Add income sources (e.g., Salary, Freelance)
   - Edit or remove income
   - Click "Next" to see results

3. **Stage 3: How You Get There**
   - View your budget summary
   - See surplus/deficit
   - Earn points (1 point per $10 surplus)
   - Watch celebratory animation if you have a surplus!

### Navigation

- Use the top navigation bar to jump between completed stages
- Click any completed stage number to return to it
- Edit expenses or income and see results update instantly

## Architecture

### State Management
All budget data is managed through a single `useReducer` hook:
- Expenses array
- Income array
- Current stage
- Completed stages

### Key Files
- `components/BudgetCalculator/BudgetCalculator.tsx` - Main component
- `lib/budget/reducer.ts` - State management logic
- `lib/budget/calculations.ts` - Budget calculations

### Animations
Framer Motion provides:
- Stage transition animations
- List add/remove animations
- Celebratory confetti for surplus budgets
- Point reveal with spring physics

## Customization

### Points Multiplier
Edit `lib/budget/calculations.ts`:
```typescript
const POINTS_MULTIPLIER = 0.1 // Change this value
```

### Stage Names
Edit `components/BudgetCalculator/WizardNav.tsx`:
```typescript
const stages = [
  { id: 1, title: "Your Custom Title" },
  // ...
]
```

## Testing

The implementation includes comprehensive tests:
- 15+ reducer tests (all CRUD operations)
- 11+ calculation tests (edge cases, formatting)

Run tests to verify everything works:
```bash
npm test
```

## Next Steps

- Add persistence (localStorage, database)
- Add categories with icons
- Export budget to PDF
- Compare budgets over time
- Set savings goals
