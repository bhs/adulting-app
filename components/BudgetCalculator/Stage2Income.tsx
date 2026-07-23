'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IncomeSource } from '@/lib/budget/types'
import { formatCurrency } from '@/lib/budget/calculations'
import { Button } from '@/components/Button'

interface Stage2IncomeProps {
  income: IncomeSource[]
  onAddIncome: (name: string, amount: number) => void
  onUpdateIncome: (id: string, name: string, amount: number) => void
  onRemoveIncome: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function Stage2Income({
  income,
  onAddIncome,
  onUpdateIncome,
  onRemoveIncome,
  onNext,
  onBack,
}: Stage2IncomeProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)

    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) {
      return
    }

    if (editingId) {
      onUpdateIncome(editingId, name.trim(), amountNum)
      setEditingId(null)
    } else {
      onAddIncome(name.trim(), amountNum)
    }

    setName('')
    setAmount('')
  }

  const handleEdit = (incomeSource: IncomeSource) => {
    setName(incomeSource.name)
    setAmount(incomeSource.amount.toString())
    setEditingId(incomeSource.id)
  }

  const handleCancelEdit = () => {
    setName('')
    setAmount('')
    setEditingId(null)
  }

  const totalIncome = income.reduce((sum, source) => sum + source.amount, 0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">What You&apos;re Making</h2>
        <p className="text-gray-600 mb-8">Add your monthly income sources to see what you bring in.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="income-name" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                id="income-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Salary, Freelance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="income-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                id="income-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              {editingId ? 'Update Income' : 'Add Income'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {income.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Income</h3>
            <AnimatePresence>
              {income.map((source) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(source.amount)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(source)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveIncome(source.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Income:</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="px-8">
            ← Back
          </Button>
          <Button
            onClick={onNext}
            variant="primary"
            disabled={income.length === 0}
            className="px-8"
          >
            Next: See Your Results →
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
