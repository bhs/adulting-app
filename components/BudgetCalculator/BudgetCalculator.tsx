'use client'

import { useReducer } from 'react'
import { budgetReducer, initialBudgetState } from '@/lib/budget/reducer'
import { WizardNav } from './WizardNav'
import { Stage1Spending } from './Stage1Spending'
import { Stage2Income } from './Stage2Income'
import { Stage3Results } from './Stage3Results'

export function BudgetCalculator() {
  const [state, dispatch] = useReducer(budgetReducer, initialBudgetState)

  const handleStageChange = (stage: number) => {
    dispatch({ type: 'SET_STAGE', payload: { stage } })
  }

  const handleNextStage = (currentStage: number) => {
    dispatch({ type: 'COMPLETE_STAGE', payload: { stage: currentStage } })
    dispatch({ type: 'SET_STAGE', payload: { stage: currentStage + 1 } })
  }

  const handleBackStage = (currentStage: number) => {
    dispatch({ type: 'SET_STAGE', payload: { stage: currentStage - 1 } })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardNav
        currentStage={state.currentStage}
        completedStages={state.completedStages}
        onStageClick={handleStageChange}
      />

      <div className="py-8">
        {state.currentStage === 1 && (
          <Stage1Spending
            expenses={state.expenses}
            onAddExpense={(name, amount) =>
              dispatch({ type: 'ADD_EXPENSE', payload: { name, amount } })
            }
            onUpdateExpense={(id, name, amount) =>
              dispatch({ type: 'UPDATE_EXPENSE', payload: { id, name, amount } })
            }
            onRemoveExpense={(id) => dispatch({ type: 'REMOVE_EXPENSE', payload: { id } })}
            onNext={() => handleNextStage(1)}
          />
        )}

        {state.currentStage === 2 && (
          <Stage2Income
            income={state.income}
            onAddIncome={(name, amount) =>
              dispatch({ type: 'ADD_INCOME', payload: { name, amount } })
            }
            onUpdateIncome={(id, name, amount) =>
              dispatch({ type: 'UPDATE_INCOME', payload: { id, name, amount } })
            }
            onRemoveIncome={(id) => dispatch({ type: 'REMOVE_INCOME', payload: { id } })}
            onNext={() => handleNextStage(2)}
            onBack={() => handleBackStage(2)}
          />
        )}

        {state.currentStage === 3 && (
          <Stage3Results
            budgetState={state}
            onBack={() => handleBackStage(3)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
