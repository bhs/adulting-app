import { BudgetState, BudgetAction, ExpenseCategory, IncomeSource } from './types'

export const initialBudgetState: BudgetState = {
  expenses: [],
  income: [],
  currentStage: 1,
  completedStages: new Set<number>(),
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const newExpense: ExpenseCategory = {
        id: generateId(),
        name: action.payload.name,
        amount: action.payload.amount,
      }
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
      }
    }

    case 'UPDATE_EXPENSE': {
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id
            ? { ...expense, name: action.payload.name, amount: action.payload.amount }
            : expense
        ),
      }
    }

    case 'REMOVE_EXPENSE': {
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload.id),
      }
    }

    case 'ADD_INCOME': {
      const newIncome: IncomeSource = {
        id: generateId(),
        name: action.payload.name,
        amount: action.payload.amount,
      }
      return {
        ...state,
        income: [...state.income, newIncome],
      }
    }

    case 'UPDATE_INCOME': {
      return {
        ...state,
        income: state.income.map((income) =>
          income.id === action.payload.id
            ? { ...income, name: action.payload.name, amount: action.payload.amount }
            : income
        ),
      }
    }

    case 'REMOVE_INCOME': {
      return {
        ...state,
        income: state.income.filter((income) => income.id !== action.payload.id),
      }
    }

    case 'SET_STAGE': {
      return {
        ...state,
        currentStage: action.payload.stage,
      }
    }

    case 'COMPLETE_STAGE': {
      const newCompletedStages = new Set(state.completedStages)
      newCompletedStages.add(action.payload.stage)
      return {
        ...state,
        completedStages: newCompletedStages,
      }
    }

    case 'RESET': {
      return initialBudgetState
    }

    default:
      return state
  }
}
