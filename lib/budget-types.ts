/**
 * Type definitions for the budget calculator
 */

export interface BudgetLineItem {
  id: string;
  name: string;
  amount: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  items: BudgetLineItem[];
}

export type CategoryType =
  | 'income'
  | 'housing'
  | 'food'
  | 'transportation'
  | 'lifestyle'
  | 'savings';

export interface BudgetFormData {
  income: BudgetLineItem[];
  housing: BudgetLineItem[];
  food: BudgetLineItem[];
  transportation: BudgetLineItem[];
  lifestyle: BudgetLineItem[];
  savings: BudgetLineItem[];
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
}

export interface BudgetPreset {
  id: string;
  name: string;
  description: string;
  data: BudgetFormData;
}

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: 'college-student',
    name: "I'm a college student",
    description: 'Typical budget for a college student',
    data: {
      income: [
        { id: 'income-1', name: 'Part-time job', amount: 800 },
        { id: 'income-2', name: 'Financial aid stipend', amount: 500 },
      ],
      housing: [
        { id: 'housing-1', name: 'Rent (shared)', amount: 500 },
        { id: 'housing-2', name: 'Utilities', amount: 50 },
      ],
      food: [
        { id: 'food-1', name: 'Groceries', amount: 200 },
        { id: 'food-2', name: 'Dining out', amount: 100 },
      ],
      transportation: [
        { id: 'transport-1', name: 'Bus pass', amount: 50 },
        { id: 'transport-2', name: 'Rideshare', amount: 40 },
      ],
      lifestyle: [
        { id: 'lifestyle-1', name: 'Phone bill', amount: 50 },
        { id: 'lifestyle-2', name: 'Subscriptions', amount: 30 },
        { id: 'lifestyle-3', name: 'Entertainment', amount: 80 },
      ],
      savings: [{ id: 'savings-1', name: 'Emergency fund', amount: 100 }],
    },
  },
  {
    id: 'entry-level',
    name: 'Entry-level job',
    description: 'Typical budget for someone starting their career',
    data: {
      income: [
        { id: 'income-1', name: 'Salary (after tax)', amount: 3200 },
        { id: 'income-2', name: 'Side hustle', amount: 300 },
      ],
      housing: [
        { id: 'housing-1', name: 'Rent', amount: 1200 },
        { id: 'housing-2', name: 'Utilities', amount: 150 },
        { id: 'housing-3', name: 'Renter insurance', amount: 25 },
      ],
      food: [
        { id: 'food-1', name: 'Groceries', amount: 400 },
        { id: 'food-2', name: 'Dining out', amount: 250 },
      ],
      transportation: [
        { id: 'transport-1', name: 'Car payment', amount: 300 },
        { id: 'transport-2', name: 'Gas', amount: 150 },
        { id: 'transport-3', name: 'Insurance', amount: 120 },
      ],
      lifestyle: [
        { id: 'lifestyle-1', name: 'Phone bill', amount: 80 },
        { id: 'lifestyle-2', name: 'Streaming services', amount: 40 },
        { id: 'lifestyle-3', name: 'Gym membership', amount: 50 },
        { id: 'lifestyle-4', name: 'Entertainment', amount: 150 },
      ],
      savings: [
        { id: 'savings-1', name: 'Emergency fund', amount: 300 },
        { id: 'savings-2', name: '401k contribution', amount: 200 },
      ],
    },
  },
];

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  income: 'Income',
  housing: 'Housing',
  food: 'Food',
  transportation: 'Transportation',
  lifestyle: 'Lifestyle',
  savings: 'Savings Goals',
};
