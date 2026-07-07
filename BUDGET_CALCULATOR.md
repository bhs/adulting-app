# Budget Calculator - Accordion Single Page Variation

## Overview

This variation implements the budget calculator as a single, scrollable long-form page with three collapsible accordion sections. Users can see all their budget information in one place, with real-time updates and a sticky summary sidebar.

## Features

### Three-Stage Accordion Layout

1. **Step 1: Add Your Income**
   - Add multiple income sources
   - Specify amount and frequency (weekly, bi-weekly, monthly, yearly)
   - Real-time validation
   - Automatically converts all frequencies to monthly amounts

2. **Step 2: List Your Expenses**
   - 12 pre-defined expense categories (Housing, Transportation, Food, etc.)
   - Add multiple expenses per category
   - Specify amount and frequency
   - Real-time validation

3. **Step 3: Review Your Budget**
   - See total income, expenses, and surplus/deficit
   - Get personalized financial health messages
   - View detailed budget breakdown (expenses as % of income, savings rate)
   - Track your progress with points

### Sticky Summary Sidebar

- **Desktop**: Fixed sidebar on the right showing:
  - Total Income
  - Total Expenses
  - Monthly Surplus/Deficit
  - Points Earned

- **Mobile**: Bottom bar showing the same information in a compact grid layout

### Points System

Points are awarded based on monthly surplus:
- $0 or less: 0 points
- $1-$99: 10 points
- $100-$299: 25 points
- $300-$499: 50 points
- $500-$999: 100 points
- $1000+: 200 points

### Confetti Celebration

When a user's surplus goes from negative/zero to positive for the first time, a confetti animation is triggered to celebrate their achievement.

### Real-Time Form Management

- Built with React Hook Form for efficient form state management
- Real-time validation on all inputs
- Automatic calculation updates as users type
- No page refreshes required

## Technical Stack

- **React Hook Form**: Form state management and validation
- **Canvas Confetti**: Celebration animations
- **Tailwind CSS**: Responsive styling
- **Prisma**: Database ORM
- **OpenTelemetry**: Analytics tracking

## Components

### Core Components

- `Accordion.tsx`: Collapsible section component with step numbers and completion indicators
- `BudgetSummary.tsx`: Sticky sidebar/bottom bar with real-time totals
- `IncomeSection.tsx`: Income input form with dynamic fields
- `ExpensesSection.tsx`: Expense input form with category selection
- `SummarySection.tsx`: Final summary with health analysis and points

### Main Page

- `app/budget/page.tsx`: Main budget calculator page orchestrating all components

### API Routes

- `app/api/budget/route.ts`: POST and GET endpoints for saving and retrieving budget calculations

## Database Schema

Three new models added to Prisma schema:

1. **BudgetCalculation**: Stores the overall budget summary
2. **IncomeItem**: Individual income sources
3. **ExpenseItem**: Individual expense items

## Analytics Integration

The budget calculator tracks:
- Budget calculation updates (when users change values)
- Positive surplus achievements (when users first go positive)
- All events use OpenTelemetry for vendor-portable analytics

## Usage

1. Navigate to `/budget`
2. Expand Step 1 and add your income sources
3. Expand Step 2 and list your expenses
4. Expand Step 3 to review your budget summary
5. Watch the sticky sidebar update in real-time
6. Achieve a positive surplus to trigger confetti and earn points

## Key Features

- Single-page experience with no navigation required
- All sections visible and accessible at once via accordions
- Real-time calculations as users type
- Responsive design (desktop sidebar, mobile bottom bar)
- Gamification with points system
- Visual celebration with confetti
- Persistent storage via API

## Development

Install dependencies:
```bash
npm install
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start development server:
```bash
npm run dev
```

Visit http://localhost:3000/budget to see the calculator in action.
