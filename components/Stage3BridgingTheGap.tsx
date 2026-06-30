/**
 * Stage 3: Bridging the Gap
 * Shows the implied monthly income needed and visualizes the gap
 */

'use client';

import { useState } from 'react';
import { Stage3Data } from '@/lib/life-design-types';
import { calculateTargetIncome } from '@/lib/life-design-calculations';
import { Card } from './Card';

interface Stage3Props {
  monthlyLifeCosts: number;
  monthlySavingsNeeded: number;
  data?: Stage3Data;
  onUpdate: (data: Stage3Data) => void;
}

export function Stage3BridgingTheGap({
  monthlyLifeCosts,
  monthlySavingsNeeded,
  data,
  onUpdate,
}: Stage3Props) {
  const [currentIncome, setCurrentIncome] = useState(
    data?.currentIncome?.toString() || ''
  );

  const targetIncome = calculateTargetIncome(monthlyLifeCosts, monthlySavingsNeeded);
  const currentIncomeNum = Number(currentIncome) || 0;
  const incomeGap = Math.max(0, targetIncome - currentIncomeNum);
  const gapPercentage =
    currentIncomeNum > 0 ? (incomeGap / targetIncome) * 100 : 100;

  const handleUpdate = () => {
    const stage3Data: Stage3Data = {
      currentLifeMonthlyCost: monthlyLifeCosts,
      futureGoalsMonthlySavings: monthlySavingsNeeded,
      targetMonthlyIncome: targetIncome,
      currentIncome: currentIncomeNum,
      incomeGap,
    };
    onUpdate(stage3Data);
  };

  const handleIncomeChange = (value: string) => {
    setCurrentIncome(value);
    setTimeout(handleUpdate, 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Bridging the Gap</h2>
        <p className="text-gray-600">
          Here's what you need to earn to support your desired lifestyle and goals.
        </p>
      </div>

      {/* Income Breakdown */}
      <Card title="Your Income Target" className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-700">Monthly Life Costs</span>
            <span className="font-semibold text-gray-900">
              ${monthlyLifeCosts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-700">Monthly Savings Needed</span>
            <span className="font-semibold text-gray-900">
              ${monthlySavingsNeeded.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-700">Tax Estimate (25%)</span>
            <span className="font-semibold text-gray-900">
              ${Math.round((monthlyLifeCosts + monthlySavingsNeeded) * 0.33).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-400 pt-3">
            <span className="text-lg font-bold text-gray-900">
              Target Monthly Income (Pre-Tax)
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ${targetIncome.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Annual target: <span className="font-bold">${(targetIncome * 12).toLocaleString()}</span>
          </p>
        </div>
      </Card>

      {/* Current Income Input */}
      <Card title="Where Are You Now?" className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Your Current Monthly Income (before taxes)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={currentIncome}
              onChange={(e) => handleIncomeChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter 0 if you're not currently earning income
          </p>
        </div>

        {currentIncomeNum > 0 && (
          <div className="space-y-2">
            <div
              className={`rounded-lg p-4 ${
                incomeGap > 0 ? 'bg-yellow-50' : 'bg-green-50'
              }`}
            >
              {incomeGap > 0 ? (
                <>
                  <p className="text-sm font-medium text-yellow-800">Income Gap</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ${incomeGap.toLocaleString()}/month
                  </p>
                  <p className="mt-1 text-xs text-yellow-700">
                    You need to increase your income by {gapPercentage.toFixed(0)}% to
                    reach your target
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-green-800">Great News!</p>
                  <p className="text-lg font-bold text-green-900">
                    You're already earning enough to support your goals
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    Focus on saving and investing the difference
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Visual Gap Representation */}
      <Card title="Income Visualization" className="space-y-4">
        <div className="space-y-4">
          {/* Target Income Bar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Target Income</span>
              <span className="text-sm font-semibold text-blue-600">
                ${targetIncome.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-full rounded-lg bg-blue-600"></div>
          </div>

          {/* Current Income Bar */}
          {currentIncomeNum > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Current Income
                </span>
                <span className="text-sm font-semibold text-green-600">
                  ${currentIncomeNum.toLocaleString()}
                </span>
              </div>
              <div className="relative h-12 w-full rounded-lg bg-gray-200">
                <div
                  className={`h-full rounded-lg ${
                    incomeGap > 0 ? 'bg-green-500' : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min((currentIncomeNum / targetIncome) * 100, 100)}%`,
                  }}
                ></div>
                {incomeGap > 0 && (
                  <div
                    className="absolute right-0 top-0 flex h-full items-center justify-center bg-red-100 text-xs font-semibold text-red-700"
                    style={{
                      width: `${(incomeGap / targetIncome) * 100}%`,
                    }}
                  >
                    Gap: ${incomeGap.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-purple-400"></div>
                <span className="text-gray-700">Life Costs</span>
              </div>
              <span className="font-medium">
                {((monthlyLifeCosts / targetIncome) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-blue-400"></div>
                <span className="text-gray-700">Savings Goals</span>
              </div>
              <span className="font-medium">
                {((monthlySavingsNeeded / targetIncome) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-gray-400"></div>
                <span className="text-gray-700">Taxes</span>
              </div>
              <span className="font-medium">~25%</span>
            </div>
          </div>
        </div>
      </Card>

      {incomeGap > 0 && currentIncomeNum > 0 && (
        <Card className="border-2 border-yellow-400 bg-yellow-50">
          <div className="text-center">
            <p className="text-lg font-semibold text-yellow-900">Next Step</p>
            <p className="mt-2 text-sm text-yellow-800">
              Let's explore career paths that can help you bridge this ${incomeGap.toLocaleString()}/month gap
            </p>
          </div>
        </Card>
      )}

      {currentIncomeNum === 0 && (
        <Card className="border-2 border-blue-400 bg-blue-50">
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-900">Ready to Get Started?</p>
            <p className="mt-2 text-sm text-blue-800">
              In the next step, we'll explore career paths that can help you reach your ${targetIncome.toLocaleString()}/month target
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
