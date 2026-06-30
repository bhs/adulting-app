/**
 * Stage 5: Your Plan
 * Synthesizes all data into a personalized summary with action steps
 */

'use client';

import { useEffect } from 'react';
import { Stage5Data, ActionStep } from '@/lib/life-design-types';
import { generateActionSteps } from '@/lib/life-design-calculations';
import { Card } from './Card';

interface Stage5Props {
  currentIncome: number;
  targetIncome: number;
  monthlySavingsNeeded: number;
  monthlyLifeCosts: number;
  selectedCareerPaths: Array<{ title: string; typicalSalary: { median: number } }>;
  data?: Stage5Data;
  onUpdate: (data: Stage5Data) => void;
}

const PRIORITY_COLORS = {
  1: 'bg-red-100 text-red-800 border-red-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-blue-100 text-blue-800 border-blue-300',
};

const PRIORITY_LABELS = {
  1: 'High Priority',
  2: 'Medium Priority',
  3: 'Long-term',
};

export function Stage5YourPlan({
  currentIncome,
  targetIncome,
  monthlySavingsNeeded,
  monthlyLifeCosts,
  selectedCareerPaths,
  data,
  onUpdate,
}: Stage5Props) {
  const incomeGap = Math.max(0, targetIncome - currentIncome);
  const savingsRate =
    currentIncome > 0 ? (monthlySavingsNeeded / (currentIncome * 0.75)) * 100 : 0;

  const actionSteps =
    data?.actionSteps || generateActionSteps(incomeGap, currentIncome, targetIncome);

  // Generate summary on mount
  useEffect(() => {
    const summary = generateSummary();
    const stage5Data: Stage5Data = {
      currentIncome,
      neededIncome: targetIncome,
      savingsRate,
      actionSteps,
      summary,
    };
    onUpdate(stage5Data);
  }, []);

  const generateSummary = (): string => {
    if (incomeGap <= 0) {
      return `You're in a great position! You already earn enough to support your desired lifestyle and financial goals. Focus on automating your savings and staying disciplined with your ${monthlySavingsNeeded.toLocaleString()}/month savings target.`;
    }

    if (incomeGap > currentIncome) {
      return `You're at the beginning of an exciting journey. To reach your ideal life, you'll need to increase your income significantly. The career paths you've identified can help you get there—start by researching training programs and building the skills needed.`;
    }

    return `You're on the right track! By increasing your income by $${incomeGap.toLocaleString()}/month, you'll be able to fully fund your desired lifestyle and savings goals. The career paths you've selected offer realistic pathways to reach this target.`;
  };

  const summary = generateSummary();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Your Personalized Plan</h2>
        <p className="text-gray-600">
          Here's your roadmap to design the life you want.
        </p>
      </div>

      {/* Summary Card */}
      <Card
        title="Your Financial Snapshot"
        className="bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <p className="text-gray-800">{summary}</p>
      </Card>

      {/* Key Numbers */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center">
          <p className="text-sm font-medium text-gray-600">Current Income</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${currentIncome.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">per month</p>
        </Card>

        <Card className="border-2 border-blue-500 text-center">
          <p className="text-sm font-medium text-gray-600">Target Income</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            ${targetIncome.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">per month</p>
        </Card>

        <Card
          className={`text-center ${
            incomeGap > 0 ? 'border-2 border-yellow-500' : 'border-2 border-green-500'
          }`}
        >
          <p className="text-sm font-medium text-gray-600">Income Gap</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              incomeGap > 0 ? 'text-yellow-600' : 'text-green-600'
            }`}
          >
            {incomeGap > 0 ? `$${incomeGap.toLocaleString()}` : 'Met!'}
          </p>
          <p className="text-xs text-gray-500">
            {incomeGap > 0 ? 'to close' : 'Target achieved'}
          </p>
        </Card>
      </div>

      {/* Savings Breakdown */}
      <Card title="Your Monthly Budget Targets">
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-700">Life Costs</span>
            <span className="font-semibold">${monthlyLifeCosts.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-700">Savings Goals</span>
            <span className="font-semibold">
              ${monthlySavingsNeeded.toLocaleString()}
            </span>
          </div>
          {currentIncome > 0 && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-700">Required Savings Rate</span>
              <span className="font-semibold">{savingsRate.toFixed(1)}%</span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <span className="font-bold text-gray-900">After-Tax Need</span>
            <span className="font-bold text-blue-600">
              ${(monthlyLifeCosts + monthlySavingsNeeded).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Selected Career Paths */}
      {selectedCareerPaths.length > 0 && (
        <Card title="Your Career Path Options">
          <div className="space-y-2">
            {selectedCareerPaths.map((career, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <span className="font-medium text-gray-900">{career.title}</span>
                <span className="text-sm text-gray-600">
                  ~${Math.round(career.typicalSalary.median / 12).toLocaleString()}/mo
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Steps */}
      <Card title="Your Next Steps" className="border-2 border-indigo-500">
        <div className="space-y-4">
          {actionSteps.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-lg border-2 p-4 ${PRIORITY_COLORS[step.priority]}`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-base font-bold">{step.title}</h4>
                <span className="ml-2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-xs font-semibold">
                  {PRIORITY_LABELS[step.priority]}
                </span>
              </div>
              <p className="mb-2 text-sm">{step.description}</p>
              <p className="text-xs font-semibold opacity-75">
                ⏱ {step.timeframe}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Motivational Close */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 text-center">
        <div className="space-y-3">
          <p className="text-xl font-bold text-gray-900">You've Got This!</p>
          <p className="text-gray-700">
            Designing your ideal life takes time, planning, and persistence. Use this plan
            as your roadmap, but remember—it's okay to adjust as you grow and learn more
            about yourself.
          </p>
          <p className="text-sm text-gray-600">
            Review this plan quarterly and celebrate your progress along the way.
          </p>
        </div>
      </Card>

      {/* Print/Save Button */}
      <div className="flex justify-center">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save or Print Your Plan
        </button>
      </div>
    </div>
  );
}
