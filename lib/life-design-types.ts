/**
 * Type definitions for the Life Design Reverse Budget Calculator
 */

export type WizardStage = 1 | 2 | 3 | 4 | 5;

export interface HousingPreference {
  type: 'studio' | 'one-bedroom' | 'two-bedroom' | 'house' | 'luxury';
  location: 'urban' | 'suburban' | 'rural';
  estimatedMonthlyCost: number;
}

export interface LifestylePreference {
  diningOut: 'minimal' | 'moderate' | 'frequent' | 'luxury';
  entertainment: 'minimal' | 'moderate' | 'active' | 'premium';
  transportation: 'public' | 'used-car' | 'new-car' | 'premium';
  travel: 'none' | 'occasional' | 'regular' | 'frequent';
  estimatedMonthlyCost: number;
}

export interface FamilyPlans {
  hasPlans: boolean;
  numChildren?: number;
  timeframe?: 'soon' | 'mid-term' | 'long-term';
  estimatedMonthlyCost: number;
}

export interface RetirementComfort {
  lifestyle: 'basic' | 'comfortable' | 'affluent' | 'luxury';
  estimatedMonthlyNeeded: number;
}

export interface Stage1Data {
  housing: HousingPreference;
  lifestyle: LifestylePreference;
  familyPlans: FamilyPlans;
  retirementComfort: RetirementComfort;
}

export interface FinancialMilestone {
  retirementAge: number;
  retirementLifestyle: 'basic' | 'comfortable' | 'affluent' | 'luxury';
  emergencyFundMonths: number;
  majorPurchases: Array<{
    name: string;
    amount: number;
    yearsFromNow: number;
  }>;
}

export interface Stage2Data extends FinancialMilestone {
  monthlyRetirementSavingsNeeded: number;
  monthlyEmergencyFundSavings: number;
  monthlyMajorPurchaseSavings: number;
  totalMonthlySavingsNeeded: number;
}

export interface Stage3Data {
  currentLifeMonthlyCost: number;
  futureGoalsMonthlySavings: number;
  targetMonthlyIncome: number;
  currentIncome?: number;
  incomeGap: number;
}

export interface CareerPath {
  id: string;
  title: string;
  category: 'trades' | 'tech' | 'healthcare' | 'business' | 'education' | 'creative';
  typicalSalary: {
    min: number;
    max: number;
    median: number;
  };
  educationRequired: string;
  credentialsRequired: string[];
  timeToEntry: string;
  growthPotential: 'low' | 'moderate' | 'high' | 'very-high';
  description: string;
}

export interface Stage4Data {
  selectedCareerPaths: CareerPath[];
  preferredCategory?: CareerPath['category'];
}

export interface ActionStep {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  timeframe: string;
}

export interface Stage5Data {
  currentIncome: number;
  neededIncome: number;
  savingsRate: number;
  actionSteps: ActionStep[];
  summary: string;
}

export interface WizardState {
  currentStage: WizardStage;
  stage1?: Stage1Data;
  stage2?: Stage2Data;
  stage3?: Stage3Data;
  stage4?: Stage4Data;
  stage5?: Stage5Data;
  completedStages: WizardStage[];
}

export type WizardAction =
  | { type: 'NEXT_STAGE' }
  | { type: 'PREVIOUS_STAGE' }
  | { type: 'GO_TO_STAGE'; stage: WizardStage }
  | { type: 'UPDATE_STAGE_1'; data: Partial<Stage1Data> }
  | { type: 'UPDATE_STAGE_2'; data: Partial<Stage2Data> }
  | { type: 'UPDATE_STAGE_3'; data: Partial<Stage3Data> }
  | { type: 'UPDATE_STAGE_4'; data: Partial<Stage4Data> }
  | { type: 'UPDATE_STAGE_5'; data: Partial<Stage5Data> }
  | { type: 'COMPLETE_STAGE'; stage: WizardStage }
  | { type: 'RESET' };
