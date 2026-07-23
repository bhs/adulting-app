export interface ExpenseCategory {
  id: string
  name: string
  amount: number
}

export interface IncomeSource {
  id: string
  name: string
  amount: number
}

export interface BudgetState {
  expenses: ExpenseCategory[]
  income: IncomeSource[]
  currentStage: number
  completedStages: Set<number>
}

export type BudgetAction =
  | { type: 'ADD_EXPENSE'; payload: { name: string; amount: number } }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; name: string; amount: number } }
  | { type: 'REMOVE_EXPENSE'; payload: { id: string } }
  | { type: 'ADD_INCOME'; payload: { name: string; amount: number } }
  | { type: 'UPDATE_INCOME'; payload: { id: string; name: string; amount: number } }
  | { type: 'REMOVE_INCOME'; payload: { id: string } }
  | { type: 'SET_STAGE'; payload: { stage: number } }
  | { type: 'COMPLETE_STAGE'; payload: { stage: number } }
  | { type: 'RESET' }
