# Budget Dashboard - Live Dashboard Variation

An interactive, single-page budget calculator with real-time updates and visual feedback.

## Features

### Core Functionality
- **Real-time calculations**: All totals update instantly as you type, no submit button needed
- **Dynamic line items**: Add/remove rows in any category
- **Categorized inputs**: Income, Housing, Food, Transportation, Lifestyle, and Savings Goals
- **Live visual feedback**: Bar chart showing income vs expenses vs net cash flow
- **Responsive design**: Works on desktop and mobile with sticky/bottom results panel

### User Experience
- **Preset loader**: Quick-start with sample budgets:
  - "I'm a college student" - typical student budget
  - "Entry-level job" - early-career professional budget
- **Smart validation**: Real-time form validation with helpful error messages
- **Status messages**: Contextual feedback based on your cash flow situation
- **Savings rate**: Automatic calculation of savings percentage

## Technical Implementation

### Components
- **BudgetDashboard** (`/components/BudgetDashboard.tsx`): Main container with form state management
- **BudgetCategory** (`/components/BudgetCategory.tsx`): Reusable category section with add/remove functionality
- **BudgetLineItem** (`/components/BudgetLineItem.tsx`): Individual input row with validation
- **BudgetResults** (`/components/BudgetResults.tsx`): Live results panel with chart and summary
- **PresetLoader** (`/components/PresetLoader.tsx`): Sample data loader for quick start

### Technologies
- **React Hook Form**: Form state management and validation
- **Recharts**: Interactive bar chart visualization
- **Tailwind CSS**: Responsive utility-first styling
- **TypeScript**: Full type safety

### Data Flow
1. User types in any input field
2. React Hook Form's `watch()` detects the change
3. `useMemo` recalculates totals instantly
4. Results component re-renders with new values
5. Chart updates automatically

## Usage

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Visit `http://localhost:3000/budget` to see the dashboard.

### Project Structure
```
app/budget/
  └── page.tsx              # Route handler
components/
  ├── BudgetDashboard.tsx   # Main component
  ├── BudgetCategory.tsx    # Category section
  ├── BudgetLineItem.tsx    # Input row
  ├── BudgetResults.tsx     # Results panel
  └── PresetLoader.tsx      # Sample data loader
lib/
  └── budget-types.ts       # TypeScript types and presets
```

## Customization

### Adding New Presets
Edit `/lib/budget-types.ts` and add entries to the `BUDGET_PRESETS` array:

```typescript
{
  id: 'my-preset',
  name: 'My Custom Preset',
  description: 'Description here',
  data: {
    income: [{ id: 'i1', name: 'Salary', amount: 5000 }],
    // ... other categories
  }
}
```

### Modifying Categories
To add/remove categories, update:
1. `CategoryType` in `/lib/budget-types.ts`
2. `BudgetFormData` interface
3. `CATEGORY_LABELS` mapping
4. Category array in `BudgetDashboard.tsx`

## Key Design Decisions

1. **No Submit Button**: Live updates provide instant feedback, better UX
2. **Derived State**: All calculations use `useMemo` for optimal performance
3. **React Hook Form**: Provides validation, error handling, and efficient re-renders
4. **Sticky Results**: Always visible on desktop for context while scrolling
5. **Minimal Initial State**: Start with one item per category to reduce overwhelm
