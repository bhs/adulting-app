'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineItem } from '@/lib/budget/guided/types'
import { formatCurrency } from '@/lib/budget/guided/calculations'
import { Button } from '@/components/Button'

interface LineItemEditorProps {
  items: LineItem[]
  /** Label for the add/edit form's name field (e.g. "Income source"). */
  nameLabel: string
  /** Placeholder examples for the name field. */
  namePlaceholder: string
  /** Heading shown above the list of entered items. */
  listTitle: string
  /** Accent color for the running total. */
  totalTone: 'green' | 'red'
  onAdd: (name: string, amount: number) => void
  onUpdate: (id: string, name: string, amount: number) => void
  onRemove: (id: string) => void
}

/**
 * Reusable add / edit / remove editor for a single budget category. Every
 * wizard step reuses this so category behavior stays consistent.
 */
export function LineItemEditor({
  items,
  nameLabel,
  namePlaceholder,
  listTitle,
  totalTone,
  onAdd,
  onUpdate,
  onRemove,
}: LineItemEditorProps) {
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
      onUpdate(editingId, name.trim(), amountNum)
      setEditingId(null)
    } else {
      onAdd(name.trim(), amountNum)
    }

    setName('')
    setAmount('')
  }

  const handleEdit = (item: LineItem) => {
    setName(item.name)
    setAmount(item.amount.toString())
    setEditingId(item.id)
  }

  const handleCancelEdit = () => {
    setName('')
    setAmount('')
    setEditingId(null)
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const totalColor = totalTone === 'green' ? 'text-green-600' : 'text-red-600'

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
              {nameLabel}
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="item-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly amount
            </label>
            <input
              id="item-amount"
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
            {editingId ? 'Update' : 'Add'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{listTitle}</h3>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(item.amount)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Monthly total:</span>
            <span className={`text-2xl font-bold ${totalColor}`}>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
