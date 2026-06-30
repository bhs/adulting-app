/**
 * Financial calculation utilities for the Life Design Wizard
 */

import { Stage1Data, Stage2Data, FinancialMilestone } from './life-design-types';

/**
 * Cost estimates for different housing types
 */
export const HOUSING_COSTS: Record<
  string,
  Record<'urban' | 'suburban' | 'rural', number>
> = {
  studio: { urban: 1200, suburban: 900, rural: 600 },
  'one-bedroom': { urban: 1800, suburban: 1300, rural: 850 },
  'two-bedroom': { urban: 2500, suburban: 1800, rural: 1200 },
  house: { urban: 3500, suburban: 2500, rural: 1500 },
  luxury: { urban: 5000, suburban: 3500, rural: 2000 },
};

/**
 * Monthly cost estimates for lifestyle preferences
 */
export const LIFESTYLE_COSTS = {
  diningOut: { minimal: 100, moderate: 300, frequent: 600, luxury: 1200 },
  entertainment: { minimal: 50, moderate: 150, active: 350, premium: 700 },
  transportation: {
    public: 100,
    'used-car': 400,
    'new-car': 600,
    premium: 1000,
  },
  travel: { none: 0, occasional: 100, regular: 300, frequent: 600 },
};

/**
 * Monthly retirement lifestyle costs (in today's dollars)
 */
export const RETIREMENT_COSTS = {
  basic: 2500,
  comfortable: 4000,
  affluent: 7000,
  luxury: 12000,
};

/**
 * Calculate estimated housing costs based on preferences
 */
export function calculateHousingCost(
  type: keyof typeof HOUSING_COSTS,
  location: 'urban' | 'suburban' | 'rural'
): number {
  return HOUSING_COSTS[type]?.[location] || 0;
}

/**
 * Calculate total lifestyle costs
 */
export function calculateLifestyleCost(lifestyle: {
  diningOut: keyof (typeof LIFESTYLE_COSTS)['diningOut'];
  entertainment: keyof (typeof LIFESTYLE_COSTS)['entertainment'];
  transportation: keyof (typeof LIFESTYLE_COSTS)['transportation'];
  travel: keyof (typeof LIFESTYLE_COSTS)['travel'];
}): number {
  return (
    LIFESTYLE_COSTS.diningOut[lifestyle.diningOut] +
    LIFESTYLE_COSTS.entertainment[lifestyle.entertainment] +
    LIFESTYLE_COSTS.transportation[lifestyle.transportation] +
    LIFESTYLE_COSTS.travel[lifestyle.travel]
  );
}

/**
 * Calculate estimated family costs
 */
export function calculateFamilyCost(
  hasPlans: boolean,
  numChildren: number = 0
): number {
  if (!hasPlans) return 0;
  // Average cost per child per month (childcare, food, activities, etc.)
  return numChildren * 1200;
}

/**
 * Calculate total monthly life costs from Stage 1 data
 */
export function calculateTotalLifeCosts(stage1: Stage1Data): number {
  return (
    stage1.housing.estimatedMonthlyCost +
    stage1.lifestyle.estimatedMonthlyCost +
    stage1.familyPlans.estimatedMonthlyCost +
    300 // Basic utilities, groceries, misc (baseline)
  );
}

/**
 * Calculate monthly retirement savings needed using simplified compound interest
 * Formula: FV = PV * (1 + r)^n
 * Solving for monthly payment: PMT = FV * r / [(1 + r)^n - 1]
 */
export function calculateRetirementSavings(
  retirementAge: number,
  currentAge: number,
  monthlyRetirementNeeded: number,
  yearsInRetirement: number = 25
): number {
  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const monthlyInterestRate = 0.07 / 12; // 7% annual return, compounded monthly

  // Total amount needed at retirement
  const totalNeeded = monthlyRetirementNeeded * yearsInRetirement * 12;

  // Calculate monthly savings using future value of annuity formula
  const monthlyPayment =
    (totalNeeded * monthlyInterestRate) /
    (Math.pow(1 + monthlyInterestRate, monthsToRetirement) - 1);

  return Math.round(monthlyPayment);
}

/**
 * Calculate emergency fund monthly savings
 * Assumes 12-month goal to build emergency fund
 */
export function calculateEmergencyFundSavings(
  monthsOfExpenses: number,
  monthlyExpenses: number
): number {
  const totalNeeded = monthsOfExpenses * monthlyExpenses;
  const monthsToSave = 12; // Build emergency fund in 1 year
  return Math.round(totalNeeded / monthsToSave);
}

/**
 * Calculate monthly savings for major purchases
 */
export function calculateMajorPurchaseSavings(
  purchases: Array<{ amount: number; yearsFromNow: number }>
): number {
  if (purchases.length === 0) return 0;

  const totalMonthlySavings = purchases.reduce((sum, purchase) => {
    const monthsToSave = purchase.yearsFromNow * 12;
    return sum + purchase.amount / monthsToSave;
  }, 0);

  return Math.round(totalMonthlySavings);
}

/**
 * Calculate all Stage 2 financial requirements
 */
export function calculateStage2Data(
  milestone: FinancialMilestone,
  currentAge: number,
  monthlyLifeCosts: number
): Stage2Data {
  const retirementMonthlyNeeded =
    RETIREMENT_COSTS[milestone.retirementLifestyle];

  const monthlyRetirementSavings = calculateRetirementSavings(
    milestone.retirementAge,
    currentAge,
    retirementMonthlyNeeded
  );

  const monthlyEmergencyFundSavings = calculateEmergencyFundSavings(
    milestone.emergencyFundMonths,
    monthlyLifeCosts
  );

  const monthlyMajorPurchaseSavings = calculateMajorPurchaseSavings(
    milestone.majorPurchases
  );

  const totalMonthlySavingsNeeded =
    monthlyRetirementSavings +
    monthlyEmergencyFundSavings +
    monthlyMajorPurchaseSavings;

  return {
    ...milestone,
    monthlyRetirementSavingsNeeded: monthlyRetirementSavings,
    monthlyEmergencyFundSavings: monthlyEmergencyFundSavings,
    monthlyMajorPurchaseSavings: monthlyMajorPurchaseSavings,
    totalMonthlySavingsNeeded,
  };
}

/**
 * Calculate target monthly income (pre-tax)
 * Assumes 25% effective tax rate for simplicity
 */
export function calculateTargetIncome(
  monthlyLifeCosts: number,
  monthlySavings: number
): number {
  const afterTaxNeeded = monthlyLifeCosts + monthlySavings;
  const effectiveTaxRate = 0.25;
  const preTaxIncome = afterTaxNeeded / (1 - effectiveTaxRate);

  return Math.round(preTaxIncome);
}

/**
 * Generate prioritized action steps based on income gap and user data
 */
export function generateActionSteps(
  incomeGap: number,
  currentIncome: number,
  targetIncome: number,
  stage4Data?: any
): Array<{ priority: 1 | 2 | 3; title: string; description: string; timeframe: string }> {
  const steps: Array<{ priority: 1 | 2 | 3; title: string; description: string; timeframe: string }> = [];

  if (incomeGap > 0) {
    // Priority 1: Immediate income actions
    if (incomeGap > currentIncome * 0.5) {
      steps.push({
        priority: 1,
        title: 'Explore Career Transition',
        description: `Research the career paths identified in Stage 4. Schedule informational interviews and explore certification or training programs.`,
        timeframe: 'Start this month',
      });
    } else {
      steps.push({
        priority: 1,
        title: 'Seek Income Increase',
        description: `Request a raise, apply for promotions, or explore job opportunities that align with your target income of $${Math.round(targetIncome).toLocaleString()}/month.`,
        timeframe: 'Next 3 months',
      });
    }

    // Priority 2: Bridge the gap
    steps.push({
      priority: 2,
      title: 'Develop Additional Income Streams',
      description: `Consider freelancing, part-time work, or passive income sources to bridge the $${Math.round(incomeGap).toLocaleString()}/month gap.`,
      timeframe: 'Next 6 months',
    });
  } else {
    // Already meeting income target
    steps.push({
      priority: 1,
      title: 'Automate Your Savings',
      description: `Set up automatic transfers to savings and investment accounts to ensure you hit your monthly savings goal.`,
      timeframe: 'This week',
    });
  }

  // Priority 3: Long-term planning
  steps.push({
    priority: 3,
    title: 'Review and Adjust Quarterly',
    description: `Revisit your life design plan every 3 months. Track progress, adjust goals, and celebrate milestones.`,
    timeframe: 'Ongoing',
  });

  return steps.slice(0, 3); // Return top 3 action steps
}
