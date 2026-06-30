'use client';

import React from 'react';
import {
  UseFormRegister,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { BudgetFormData, BudgetLineItem } from '@/lib/budget-types';
import BudgetLineItemComponent from './BudgetLineItem';

interface BudgetCategoryProps {
  title: string;
  categoryKey: keyof BudgetFormData;
  fields: Array<BudgetLineItem & { id: string }>;
  register: UseFormRegister<BudgetFormData>;
  errors: FieldErrors<BudgetFormData>;
  append: UseFieldArrayAppend<BudgetFormData, any>;
  remove: UseFieldArrayRemove;
}

export default function BudgetCategory({
  title,
  categoryKey,
  fields,
  register,
  errors,
  append,
  remove,
}: BudgetCategoryProps) {
  const handleAddItem = () => {
    append({
      id: `${categoryKey}-${Date.now()}`,
      name: '',
      amount: 0,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-2">
            No items yet. Click "Add Item" to get started.
          </p>
        ) : (
          fields.map((field, index) => (
            <BudgetLineItemComponent
              key={field.id}
              categoryKey={categoryKey}
              index={index}
              onRemove={() => remove(index)}
              register={register}
              errors={errors}
              showRemove={fields.length > 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
