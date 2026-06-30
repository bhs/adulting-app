'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  BudgetFormData,
  BudgetSummary,
  CategoryType,
  CATEGORY_LABELS,
} from '@/lib/budget-types';
import BudgetCategory from './BudgetCategory';
import BudgetResults from './BudgetResults';
import PresetLoader from './PresetLoader';
import {
  trackBudgetPresetLoaded,
  trackBudgetDashboardEvent,
} from '@/lib/analytics';

const DEFAULT_FORM_DATA: BudgetFormData = {
  income: [{ id: 'income-1', name: '', amount: 0 }],
  housing: [{ id: 'housing-1', name: '', amount: 0 }],
  food: [{ id: 'food-1', name: '', amount: 0 }],
  transportation: [{ id: 'transportation-1', name: '', amount: 0 }],
  lifestyle: [{ id: 'lifestyle-1', name: '', amount: 0 }],
  savings: [{ id: 'savings-1', name: '', amount: 0 }],
};

export default function BudgetDashboard() {
  const {
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    defaultValues: DEFAULT_FORM_DATA,
    mode: 'onChange',
  });

  // Field arrays for each category
  const incomeFields = useFieldArray({ control, name: 'income' });
  const housingFields = useFieldArray({ control, name: 'housing' });
  const foodFields = useFieldArray({ control, name: 'food' });
  const transportationFields = useFieldArray({ control, name: 'transportation' });
  const lifestyleFields = useFieldArray({ control, name: 'lifestyle' });
  const savingsFields = useFieldArray({ control, name: 'savings' });

  // Watch all form values for live updates
  const formValues = watch();

  // Calculate budget summary in real-time
  const summary: BudgetSummary = useMemo(() => {
    const calculateCategoryTotal = (items: Array<{ amount: number }>) => {
      return items.reduce((sum, item) => {
        const amount = Number(item.amount) || 0;
        return sum + amount;
      }, 0);
    };

    const totalIncome = calculateCategoryTotal(formValues.income || []);
    const totalExpenses =
      calculateCategoryTotal(formValues.housing || []) +
      calculateCategoryTotal(formValues.food || []) +
      calculateCategoryTotal(formValues.transportation || []) +
      calculateCategoryTotal(formValues.lifestyle || []);

    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
    };
  }, [formValues]);

  const handleLoadPreset = (data: BudgetFormData, presetId: string, presetName: string) => {
    reset(data);
    trackBudgetPresetLoaded({ presetId, presetName });
  };

  // Track calculation updates periodically (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (summary.totalIncome > 0 || summary.totalExpenses > 0) {
        trackBudgetDashboardEvent('calculation_updated', summary);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [summary]);

  const categories: Array<{
    key: CategoryType;
    fields: ReturnType<typeof useFieldArray>;
  }> = [
    { key: 'income', fields: incomeFields },
    { key: 'housing', fields: housingFields },
    { key: 'food', fields: foodFields },
    { key: 'transportation', fields: transportationFields },
    { key: 'lifestyle', fields: lifestyleFields },
    { key: 'savings', fields: savingsFields },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Budget Dashboard
          </h1>
          <p className="text-gray-600">
            Track your income and expenses in real-time. Add items to each category
            and watch your budget update automatically.
          </p>
        </div>

        {/* Preset Loader */}
        <PresetLoader onLoadPreset={handleLoadPreset} />

        {/* Main Layout - Form and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Form categories */}
          <div className="lg:col-span-2 space-y-6">
            <form className="space-y-6">
              {categories.map(({ key, fields }) => (
                <BudgetCategory
                  key={key}
                  title={CATEGORY_LABELS[key]}
                  categoryKey={key}
                  fields={fields.fields}
                  register={register}
                  errors={errors}
                  append={fields.append}
                  remove={fields.remove}
                />
              ))}
            </form>
          </div>

          {/* Right side - Results panel (sticky) */}
          <div className="lg:col-span-1">
            <BudgetResults summary={summary} />
          </div>
        </div>

        {/* Mobile results (bottom) */}
        <div className="lg:hidden mt-6">
          <BudgetResults summary={summary} />
        </div>
      </div>
    </div>
  );
}
