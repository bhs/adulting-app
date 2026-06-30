'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { BudgetFormData } from '@/lib/budget-types';

interface BudgetLineItemProps {
  categoryKey: keyof BudgetFormData;
  index: number;
  onRemove: () => void;
  register: UseFormRegister<BudgetFormData>;
  errors: FieldErrors<BudgetFormData>;
  showRemove: boolean;
}

export default function BudgetLineItem({
  categoryKey,
  index,
  onRemove,
  register,
  errors,
  showRemove,
}: BudgetLineItemProps) {
  const nameFieldName = `${categoryKey}.${index}.name` as const;
  const amountFieldName = `${categoryKey}.${index}.amount` as const;

  // Type-safe error access
  const categoryErrors = errors[categoryKey];
  const itemErrors = Array.isArray(categoryErrors) ? categoryErrors[index] : undefined;

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Item name"
          {...register(nameFieldName, {
            required: 'Name is required',
          })}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {itemErrors?.name && (
          <p className="text-xs text-red-500 mt-1">{itemErrors.name.message}</p>
        )}
      </div>
      <div className="w-32">
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register(amountFieldName, {
            required: 'Amount is required',
            min: { value: 0, message: 'Must be positive' },
            valueAsNumber: true,
          })}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-right focus:border-blue-500 focus:outline-none"
        />
        {itemErrors?.amount && (
          <p className="text-xs text-red-500 mt-1">{itemErrors.amount.message}</p>
        )}
      </div>
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          aria-label="Remove item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
