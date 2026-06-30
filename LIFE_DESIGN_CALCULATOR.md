# Life Design Reverse Budget Calculator

A goal-first life design wizard that helps young adults articulate their ideal lifestyle, then works backward to determine the income needed to achieve it.

## Overview

The Life Design Calculator is a multi-stage interactive wizard that guides users through five phases of life and financial planning:

1. **Your Adult Life** - Define housing, lifestyle, family plans, and retirement comfort
2. **Your Future Self** - Set financial milestones and calculate savings requirements
3. **Bridging the Gap** - Discover the income needed to support goals and visualize the gap
4. **Getting There** - Explore career paths that can help reach income targets
5. **Your Plan** - Receive a personalized action plan with prioritized next steps

## Features

### Multi-Stage Wizard Flow
- **5-stage progression** with visual progress indicator
- **Interactive navigation** - jump to any completed stage
- **State management** via useReducer for complex form state
- **Smooth transitions** with scroll-to-top on stage changes

### Stage 1: Your Adult Life
- **Structured prompt cards** for housing type and location
- **Lifestyle sliders** for dining, entertainment, transportation, and travel
- **Family planning** inputs with dynamic child count
- **Retirement lifestyle** selection with real-time cost estimates
- **Real-time cost calculations** displayed for each category

### Stage 2: Your Future Self
- **Retirement planning** with age slider (55-75) and lifestyle options
- **Compound interest calculations** for retirement savings (7% annual return)
- **Emergency fund builder** with adjustable months of coverage (3-12)
- **Major purchases** tracker with custom items, amounts, and timelines
- **Savings breakdown** showing monthly requirements for each goal

### Stage 3: Bridging the Gap
- **Income target calculation** including life costs + savings + taxes (25% rate)
- **Current income input** to determine the gap
- **Visual gap representation** with progress bars
- **Percentage breakdown** of life costs, savings, and taxes
- **Dynamic messaging** based on whether user meets target

### Stage 4: Getting There
- **Curated career dataset** with 25+ careers across 6 categories:
  - Skilled Trades (electrician, plumber, HVAC, welder)
  - Technology (web dev, software engineer, IT support, data analyst, cybersecurity)
  - Healthcare (RN, dental hygienist, medical assistant, physical therapist, radiologic tech)
  - Business (accountant, project manager, sales rep, HR specialist, financial advisor)
  - Education (teacher, corporate trainer)
  - Creative (graphic designer, UX/UI designer, video editor, content writer)
- **Recommended careers** based on income target and growth potential
- **Browse by category** with icon-based navigation
- **Detailed career cards** showing:
  - Salary ranges (min, max, median) and monthly estimates
  - Education requirements
  - Credentials needed
  - Time to entry
  - Growth potential badges
- **Multi-select** career paths for comparison

### Stage 5: Your Plan
- **Personalized summary** based on income gap and selections
- **Key metrics dashboard** - current income, target, and gap
- **Monthly budget targets** breakdown
- **Selected career paths** list with salary info
- **Prioritized action steps** (high, medium, long-term):
  - Career transition guidance
  - Income increase strategies
  - Side income suggestions
  - Savings automation
  - Quarterly review reminders
- **Print/save functionality** for plan reference

### Analytics Integration
- **Automatic tracking** of stage views and completions
- **Custom events** for:
  - `life_design_stage_view` - Fired on each stage entry
  - `life_design_stage_complete` - Fired when advancing stages
  - `life_design_complete` - Fired at plan completion with summary data
- **OpenTelemetry integration** via existing Honeycomb setup

## Technical Architecture

### File Structure

```
/app
  /life-design
    page.tsx                       # Main page route

/components
  LifeDesignWizard.tsx            # Main wizard orchestrator
  Stage1YourAdultLife.tsx         # Stage 1 component
  Stage2YourFutureSelf.tsx        # Stage 2 component
  Stage3BridgingTheGap.tsx        # Stage 3 component
  Stage4GettingThere.tsx          # Stage 4 component
  Stage5YourPlan.tsx              # Stage 5 component

/lib
  life-design-types.ts            # TypeScript type definitions
  life-design-reducer.ts          # useReducer state management
  life-design-calculations.ts     # Financial calculation utilities
  career-data.ts                  # Career paths dataset
```

### State Management

**Pattern**: React useReducer for centralized state management

**State Structure**:
```typescript
interface WizardState {
  currentStage: 1 | 2 | 3 | 4 | 5;
  stage1?: Stage1Data;
  stage2?: Stage2Data;
  stage3?: Stage3Data;
  stage4?: Stage4Data;
  stage5?: Stage5Data;
  completedStages: WizardStage[];
}
```

**Actions**:
- `NEXT_STAGE` / `PREVIOUS_STAGE` - Navigation
- `GO_TO_STAGE` - Direct stage access
- `UPDATE_STAGE_X` - Update specific stage data
- `COMPLETE_STAGE` - Mark stage as completed
- `RESET` - Clear wizard state

### Financial Calculations

**Cost Estimates**:
- Housing: $600-$5,000/month depending on type and location
- Lifestyle: $250-$2,500/month for dining, entertainment, transportation, travel
- Family: $1,200/month per child
- Retirement: $2,500-$12,000/month depending on lifestyle

**Retirement Savings Formula**:
```
Monthly Payment = (Total Needed × r) / ((1 + r)^n - 1)
where:
  r = 0.07/12 (monthly interest rate, 7% annual)
  n = months to retirement
  Total Needed = Monthly retirement need × 25 years × 12
```

**Income Target Calculation**:
```
Target Income = (Life Costs + Savings) / (1 - Tax Rate)
where Tax Rate = 0.25 (25% effective rate)
```

### Career Dataset

**25+ careers** with complete data:
- Salary ranges (realistic 2024 figures)
- Education paths (high school to doctoral)
- Required credentials and certifications
- Time to entry (3 months to 7 years)
- Growth potential ratings

**Filtering Functions**:
- `getCareerPathsByCategory()` - Filter by career type
- `getCareerPathsByIncome()` - Match income targets
- `getRecommendedCareers()` - Top 3 based on income + growth

## Installation & Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- Next.js 14

### Required Dependencies

The calculator requires one additional dependency:

```bash
npm install recharts
```

Note: The current implementation uses custom CSS-based visualizations for the income gap chart instead of Recharts. This reduces bundle size while maintaining full functionality. Recharts can be integrated later for more advanced charts if needed.

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access the calculator
# Navigate to http://localhost:3000/life-design
```

## Usage Guide

### For Users

1. **Start the wizard** at `/life-design`
2. **Complete Stage 1**: Select housing type, location, lifestyle preferences, family plans, and retirement comfort
3. **Set milestones in Stage 2**: Choose retirement age, emergency fund size, and add major purchases
4. **Enter current income in Stage 3**: See your income gap and target
5. **Explore careers in Stage 4**: Browse recommended paths or filter by category
6. **Review your plan in Stage 5**: Get prioritized action steps and save/print your plan

### For Developers

**Extending the Career Dataset**:
```typescript
// Add new career to lib/career-data.ts
const newCareer: CareerPath = {
  id: 'unique-id',
  title: 'Job Title',
  category: 'tech', // trades | tech | healthcare | business | education | creative
  typicalSalary: { min: 40000, max: 80000, median: 60000 },
  educationRequired: 'Bachelor\'s degree',
  credentialsRequired: ['Certification name'],
  timeToEntry: '2-4 years',
  growthPotential: 'high', // low | moderate | high | very-high
  description: 'Brief description of the role',
};
```

**Modifying Cost Estimates**:
```typescript
// Update constants in lib/life-design-calculations.ts
export const HOUSING_COSTS = {
  studio: { urban: 1200, suburban: 900, rural: 600 },
  // ... adjust values as needed
};
```

**Adding New Action Steps**:
```typescript
// Modify generateActionSteps() in lib/life-design-calculations.ts
steps.push({
  priority: 1, // 1 (high) | 2 (medium) | 3 (long-term)
  title: 'Action title',
  description: 'Detailed description of what to do',
  timeframe: 'When to do it',
});
```

## Design Decisions

### Why useReducer instead of Context or state management libraries?
- **Appropriate complexity**: Multi-stage wizard has clear state transitions
- **No global state needed**: State is scoped to the wizard component
- **Better debugging**: Actions are explicit and traceable
- **Performance**: No unnecessary re-renders from context changes

### Why custom visualizations instead of Recharts?
- **Bundle size**: Recharts adds ~60KB minified
- **Simplicity**: The gap visualization is a simple progress bar
- **Flexibility**: CSS-based bars are easier to customize with Tailwind
- **Future-ready**: Recharts can be added later for more complex charts if needed

### Why a static career dataset instead of an API?
- **Speed**: No API latency for career browsing
- **Reliability**: No external dependencies or API failures
- **Curation**: Hand-picked careers relevant to young adults
- **Extensibility**: Easy to add more careers or pull from API in future

### Why 25% tax rate assumption?
- **Simplification**: Actual tax calculation requires state, filing status, deductions
- **Conservative**: 25% effective rate is reasonable for target income ranges
- **Educational**: Focus is on goal-setting, not precise tax planning
- **Adjustable**: Users can mentally adjust based on their situation

## Analytics Events

The wizard tracks the following events:

```typescript
// Stage view (fired on each stage load)
trackCustomEvent('life_design_stage_view', {
  stage: 1,
  stage_name: 'Your Adult Life'
});

// Stage completion (fired when clicking Next)
trackCustomEvent('life_design_stage_complete', {
  stage: 1,
  stage_name: 'Your Adult Life'
});

// Wizard completion (fired at end)
trackCustomEvent('life_design_complete', {
  target_income: 8500,
  current_income: 5000,
  income_gap: 3500,
  careers_selected: 2
});
```

## Future Enhancements

Potential improvements for future iterations:

1. **State Persistence**:
   - Save progress to localStorage
   - Resume wizard on return visit
   - Export/import plan data

2. **Enhanced Visualizations**:
   - Recharts integration for budget breakdown pie charts
   - Timeline visualization for savings goals
   - Career salary comparison charts

3. **Location-Based Adjustments**:
   - Zip code input for localized cost of living
   - Career salary adjustments by region
   - State tax rate customization

4. **Database Integration**:
   - Save completed plans to Prisma database
   - User accounts for multiple plans
   - Plan revision history

5. **Social Features**:
   - Share plans with mentors or advisors
   - Compare anonymized plans with peer groups
   - Success story testimonials

6. **Advanced Calculations**:
   - Inflation adjustments for future costs
   - Investment portfolio recommendations
   - Debt repayment integration
   - Student loan payoff strategies

7. **Career Expansion**:
   - 100+ careers across more categories
   - Links to training programs and certifications
   - Job market demand indicators
   - Remote work availability flags

8. **Accessibility**:
   - Screen reader optimization
   - Keyboard navigation improvements
   - Mobile-responsive enhancements
   - Multi-language support

## Testing

Currently, no tests are included. Recommended test coverage:

```typescript
// Unit tests for calculations
describe('calculateRetirementSavings', () => {
  it('should calculate correct monthly savings for retirement', () => {
    // Test compound interest formula
  });
});

// Integration tests for wizard flow
describe('LifeDesignWizard', () => {
  it('should progress through all 5 stages', () => {
    // Test navigation and state updates
  });
});

// E2E tests
describe('Complete user flow', () => {
  it('should complete wizard and generate plan', () => {
    // Test full user journey
  });
});
```

## License & Attribution

This implementation is part of the adulting-app project and follows the project's license terms.

## Support

For issues or questions:
1. Check this documentation
2. Review inline code comments
3. Open an issue in the project repository
