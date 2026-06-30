'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BudgetSummary } from '@/lib/budget-types';

interface BudgetResultsProps {
  summary: BudgetSummary;
}

export default function BudgetResults({ summary }: BudgetResultsProps) {
  const { totalIncome, totalExpenses, netCashFlow, savingsRate } = summary;

  const chartData = [
    {
      name: 'Income',
      value: totalIncome,
    },
    {
      name: 'Expenses',
      value: totalExpenses,
    },
    {
      name: 'Net',
      value: Math.abs(netCashFlow),
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getCashFlowColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBarColor = (index: number) => {
    if (index === 0) return '#3b82f6'; // blue for income
    if (index === 1) return '#ef4444'; // red for expenses
    return netCashFlow >= 0 ? '#10b981' : '#ef4444'; // green/red for net
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Budget Summary</h2>

      {/* Summary cards */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Total Income</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(totalIncome)}
          </span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Total Expenses</span>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Net Cash Flow</span>
          <span className={`text-lg font-bold ${getCashFlowColor(netCashFlow)}`}>
            {netCashFlow >= 0 ? '+' : ''}
            {formatCurrency(netCashFlow)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Savings Rate</span>
          <span className="text-lg font-bold text-purple-600">
            {formatPercent(savingsRate)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Visual Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status message */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50">
        {netCashFlow > 0 ? (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-green-600">Great job!</span> You have
            a positive cash flow. Consider increasing your savings or investments.
          </p>
        ) : netCashFlow < 0 ? (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-red-600">Attention needed:</span> Your
            expenses exceed your income. Look for areas to reduce spending.
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-600">Balanced:</span> Your income
            and expenses are equal. Consider building an emergency fund.
          </p>
        )}
      </div>
    </div>
  );
}
