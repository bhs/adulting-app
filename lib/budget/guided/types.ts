/**
 * Types for the Guided Learning Budget Wizard.
 *
 * The guided wizard walks the user through four budget categories, one step at
 * a time (income -> fixed expenses -> variable expenses -> savings), pairing
 * each step with a short educational card. After all steps are complete the
 * user lands on a summary dashboard with a financial health score.
 */

/** The four budget categories, in the order the wizard presents them. */
export type CategoryKey = 'income' | 'fixed' | 'variable' | 'savings'

/** A single line item within a category (e.g. "Rent", "Salary"). */
export interface LineItem {
  id: string
  name: string
  amount: number
}

/**
 * The full guided wizard state.
 *
 * `stepIndex` refers to a position in the wizard flow. Steps 0-3 map to the
 * four categories (see {@link CATEGORY_ORDER}); the final index is the summary
 * dashboard.
 */
export interface GuidedBudgetState {
  income: LineItem[]
  fixed: LineItem[]
  variable: LineItem[]
  savings: LineItem[]
  /** Current position in the wizard flow (0..CATEGORY_ORDER.length). */
  stepIndex: number
  /** Step indices the user has completed at least once. */
  completedSteps: number[]
  /** When true, educational cards and mini-challenges are hidden. */
  quickMode: boolean
}

export type GuidedBudgetAction =
  | { type: 'ADD_ITEM'; payload: { category: CategoryKey; name: string; amount: number } }
  | {
      type: 'UPDATE_ITEM'
      payload: { category: CategoryKey; id: string; name: string; amount: number }
    }
  | { type: 'REMOVE_ITEM'; payload: { category: CategoryKey; id: string } }
  | { type: 'GO_TO_STEP'; payload: { stepIndex: number } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'COMPLETE_STEP'; payload: { stepIndex: number } }
  | { type: 'SET_QUICK_MODE'; payload: { enabled: boolean } }
  | { type: 'HYDRATE'; payload: GuidedBudgetState }
  | { type: 'RESET' }

/**
 * The category presented at each wizard step, in order. The summary dashboard
 * lives at index `CATEGORY_ORDER.length`.
 */
export const CATEGORY_ORDER: CategoryKey[] = ['income', 'fixed', 'variable', 'savings']

/** The wizard step index that renders the summary dashboard. */
export const SUMMARY_STEP_INDEX = CATEGORY_ORDER.length
