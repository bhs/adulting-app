import {
  GuidedBudgetState,
  GuidedBudgetAction,
  LineItem,
  CategoryKey,
  CATEGORY_ORDER,
  SUMMARY_STEP_INDEX,
} from './types'

export const initialGuidedState: GuidedBudgetState = {
  income: [],
  fixed: [],
  variable: [],
  savings: [],
  stepIndex: 0,
  completedSteps: [],
  quickMode: false,
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** Clamp a step index into the valid wizard range (0..SUMMARY_STEP_INDEX). */
function clampStep(stepIndex: number): number {
  if (stepIndex < 0) return 0
  if (stepIndex > SUMMARY_STEP_INDEX) return SUMMARY_STEP_INDEX
  return stepIndex
}

/** Immutably add a step index to the completed list without duplicates. */
function withCompletedStep(completed: number[], stepIndex: number): number[] {
  if (completed.includes(stepIndex)) return completed
  return [...completed, stepIndex].sort((a, b) => a - b)
}

/**
 * Reducer for the guided budget wizard. All four categories share the same
 * add/update/remove logic, keyed by `category`, keeping the reducer compact and
 * easy to reason about.
 */
export function guidedBudgetReducer(
  state: GuidedBudgetState,
  action: GuidedBudgetAction
): GuidedBudgetState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { category, name, amount } = action.payload
      const newItem: LineItem = { id: generateId(), name, amount }
      return {
        ...state,
        [category]: [...state[category], newItem],
      }
    }

    case 'UPDATE_ITEM': {
      const { category, id, name, amount } = action.payload
      return {
        ...state,
        [category]: state[category].map((item: LineItem) =>
          item.id === id ? { ...item, name, amount } : item
        ),
      }
    }

    case 'REMOVE_ITEM': {
      const { category, id } = action.payload
      return {
        ...state,
        [category]: state[category].filter((item: LineItem) => item.id !== id),
      }
    }

    case 'GO_TO_STEP': {
      return { ...state, stepIndex: clampStep(action.payload.stepIndex) }
    }

    case 'NEXT_STEP': {
      const nextIndex = clampStep(state.stepIndex + 1)
      return {
        ...state,
        stepIndex: nextIndex,
        // Advancing marks the step we're leaving as complete.
        completedSteps: withCompletedStep(state.completedSteps, state.stepIndex),
      }
    }

    case 'PREV_STEP': {
      return { ...state, stepIndex: clampStep(state.stepIndex - 1) }
    }

    case 'COMPLETE_STEP': {
      return {
        ...state,
        completedSteps: withCompletedStep(state.completedSteps, action.payload.stepIndex),
      }
    }

    case 'SET_QUICK_MODE': {
      return { ...state, quickMode: action.payload.enabled }
    }

    case 'HYDRATE': {
      return action.payload
    }

    case 'RESET': {
      // Preserve the user's quick-mode preference across a reset.
      return { ...initialGuidedState, quickMode: state.quickMode }
    }

    default:
      return state
  }
}

/**
 * Returns the category key for a given wizard step, or `null` for the summary
 * step (which is not tied to a single category).
 */
export function categoryForStep(stepIndex: number): CategoryKey | null {
  return CATEGORY_ORDER[stepIndex] ?? null
}
