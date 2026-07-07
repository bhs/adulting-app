'use client'

import { useFieldArray, UseFormRegister, Control } from 'react-hook-form'
import { BudgetFormData } from '@/types/budget'

interface ExpensesSectionProps {
  register: UseFormRegister<BudgetFormData>
  control: Control<BudgetFormData>
  errors: any
}

const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food & Groceries',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Debt Payments',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'Savings',
  'Other',
]

export default function ExpensesSection({
  register,
  control,
  errors,
}: ExpensesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expenseItems',
  })

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        List all your monthly expenses. Be as detailed as possible to get an
        accurate picture of your spending.
      </p>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register(`expenseItems.${index}.category`, {
                  required: 'Category is required',
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.expenseItems?.[index]?.category && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.expenseItems[index].category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                {...register(`expenseItems.${index}.amount`, {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.expenseItems?.[index]?.amount && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.expenseItems[index].amount.message}
                </p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  {...register(`expenseItems.${index}.frequency`, {
                    required: 'Frequency is required',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({ category: '', amount: 0, frequency: 'monthly' })
        }
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        + Add Expense
      </button>
    </div>
  )
}
