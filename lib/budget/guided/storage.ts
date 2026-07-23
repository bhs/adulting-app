import { GuidedBudgetState, LineItem, CategoryKey } from './types'
import { initialGuidedState } from './reducer'

/**
 * localStorage persistence for the guided budget wizard.
 *
 * The state is plain JSON (no Sets), so serialization is straightforward. We
 * still validate on load so that a corrupt or stale payload never crashes the
 * app — anything unexpected falls back to the initial state.
 */
export const STORAGE_KEY = 'guided-budget-v1'

function isLineItemArray(value: unknown): value is LineItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as LineItem).id === 'string' &&
        typeof (item as LineItem).name === 'string' &&
        typeof (item as LineItem).amount === 'number'
    )
  )
}

/**
 * Parses a raw JSON string into a valid {@link GuidedBudgetState}, filling in
 * defaults for any missing fields and rejecting malformed data.
 */
export function parseStoredState(raw: string | null): GuidedBudgetState | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (parsed === null || typeof parsed !== 'object') return null
  const data = parsed as Partial<GuidedBudgetState>

  const categories: CategoryKey[] = ['income', 'fixed', 'variable', 'savings']
  const restored: GuidedBudgetState = { ...initialGuidedState }

  for (const category of categories) {
    const value = data[category]
    if (value !== undefined && !isLineItemArray(value)) {
      // A category exists but is malformed — treat the whole payload as invalid.
      return null
    }
    restored[category] = isLineItemArray(value) ? value : []
  }

  restored.stepIndex = typeof data.stepIndex === 'number' ? data.stepIndex : 0
  restored.completedSteps =
    Array.isArray(data.completedSteps) && data.completedSteps.every((n) => typeof n === 'number')
      ? data.completedSteps
      : []
  restored.quickMode = typeof data.quickMode === 'boolean' ? data.quickMode : false

  return restored
}

/** Loads persisted state from localStorage, or null if unavailable/invalid. */
export function loadState(): GuidedBudgetState | null {
  if (typeof window === 'undefined') return null
  try {
    return parseStoredState(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    // Access to localStorage can throw (e.g. private mode, disabled storage).
    return null
  }
}

/** Persists state to localStorage. Silently no-ops if storage is unavailable. */
export function saveState(state: GuidedBudgetState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota errors / disabled storage should not break the app.
  }
}

/** Removes any persisted state. */
export function clearState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore.
  }
}
