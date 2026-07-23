import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  parseStoredState,
  loadState,
  saveState,
  clearState,
  STORAGE_KEY,
} from '../storage'
import { initialGuidedState } from '../reducer'
import { GuidedBudgetState } from '../types'

const validState: GuidedBudgetState = {
  income: [{ id: '1', name: 'Salary', amount: 5000 }],
  fixed: [{ id: '2', name: 'Rent', amount: 1500 }],
  variable: [],
  savings: [],
  stepIndex: 2,
  completedSteps: [0, 1],
  quickMode: true,
}

describe('parseStoredState', () => {
  it('returns null for null/empty input', () => {
    expect(parseStoredState(null)).toBeNull()
    expect(parseStoredState('')).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseStoredState('{not json')).toBeNull()
  })

  it('returns null for non-object JSON', () => {
    expect(parseStoredState('42')).toBeNull()
    expect(parseStoredState('"a string"')).toBeNull()
  })

  it('round-trips a valid state', () => {
    const parsed = parseStoredState(JSON.stringify(validState))
    expect(parsed).toEqual(validState)
  })

  it('fills defaults for missing fields', () => {
    const parsed = parseStoredState(JSON.stringify({ income: [] }))
    expect(parsed).toEqual(initialGuidedState)
  })

  it('rejects malformed line-item arrays', () => {
    const bad = JSON.stringify({ income: [{ id: 1, name: 'x' }] })
    expect(parseStoredState(bad)).toBeNull()
  })

  it('ignores a malformed completedSteps field', () => {
    const parsed = parseStoredState(
      JSON.stringify({ ...validState, completedSteps: ['a', 'b'] })
    )
    expect(parsed?.completedSteps).toEqual([])
  })
})

describe('localStorage helpers (jsdom)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and loads state', () => {
    saveState(validState)
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadState()).toEqual(validState)
  })

  it('loadState returns null when nothing is stored', () => {
    expect(loadState()).toBeNull()
  })

  it('clearState removes persisted state', () => {
    saveState(validState)
    clearState()
    expect(loadState()).toBeNull()
  })
})
