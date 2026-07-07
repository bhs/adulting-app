export interface IncomeItem {
  source: string
  amount: number
  frequency: string
}

export interface ExpenseItem {
  category: string
  amount: number
  frequency: string
}

export interface BudgetFormData {
  incomeItems: IncomeItem[]
  expenseItems: ExpenseItem[]
}

export interface BudgetCalculation {
  id: string
  userId?: string
  totalIncome: number
  totalExpenses: number
  surplus: number
  pointsEarned: number
  createdAt: Date
  updatedAt: Date
  incomeItems: IncomeItem[]
  expenseItems: ExpenseItem[]
}
