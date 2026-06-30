/**
 * Stage 2: Your Future Self
 * Forward-looking financial milestones with compound interest calculations
 */

'use client';

import { useState } from 'react';
import { Stage2Data, FinancialMilestone } from '@/lib/life-design-types';
import { calculateStage2Data } from '@/lib/life-design-calculations';
import { Card } from './Card';

interface Stage2Props {
  data?: Stage2Data;
  monthlyLifeCosts: number;
  onUpdate: (data: Stage2Data) => void;
}

export function Stage2YourFutureSelf({
  data,
  monthlyLifeCosts,
  onUpdate,
}: Stage2Props) {
  const [retirementAge, setRetirementAge] = useState(data?.retirementAge || 65);
  const [retirementLifestyle, setRetirementLifestyle] = useState<
    'basic' | 'comfortable' | 'affluent' | 'luxury'
  >(data?.retirementLifestyle || 'comfortable');
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(
    data?.emergencyFundMonths || 6
  );
  const [majorPurchases, setMajorPurchases] = useState<
    Array<{ name: string; amount: number; yearsFromNow: number }>
  >(data?.majorPurchases || []);

  const [newPurchaseName, setNewPurchaseName] = useState('');
  const [newPurchaseAmount, setNewPurchaseAmount] = useState('');
  const [newPurchaseYears, setNewPurchaseYears] = useState('');

  const currentAge = 25; // Default assumption for young adults

  const handleUpdate = () => {
    const milestone: FinancialMilestone = {
      retirementAge,
      retirementLifestyle,
      emergencyFundMonths,
      majorPurchases,
    };

    const stage2Data = calculateStage2Data(milestone, currentAge, monthlyLifeCosts);
    onUpdate(stage2Data);
  };

  const addMajorPurchase = () => {
    if (newPurchaseName && newPurchaseAmount && newPurchaseYears) {
      setMajorPurchases([
        ...majorPurchases,
        {
          name: newPurchaseName,
          amount: Number(newPurchaseAmount),
          yearsFromNow: Number(newPurchaseYears),
        },
      ]);
      setNewPurchaseName('');
      setNewPurchaseAmount('');
      setNewPurchaseYears('');
      setTimeout(handleUpdate, 0);
    }
  };

  const removeMajorPurchase = (index: number) => {
    setMajorPurchases(majorPurchases.filter((_, i) => i !== index));
    setTimeout(handleUpdate, 0);
  };

  // Calculate savings requirements
  const milestone: FinancialMilestone = {
    retirementAge,
    retirementLifestyle,
    emergencyFundMonths,
    majorPurchases,
  };
  const calculations = calculateStage2Data(milestone, currentAge, monthlyLifeCosts);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Your Future Self</h2>
        <p className="text-gray-600">
          Let's plan for your financial milestones and calculate what you need to save.
        </p>
      </div>

      {/* Retirement Planning */}
      <Card title="Retirement Planning" className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Retirement Age: {retirementAge}
          </label>
          <input
            type="range"
            min="55"
            max="75"
            value={retirementAge}
            onChange={(e) => {
              setRetirementAge(Number(e.target.value));
              setTimeout(handleUpdate, 0);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>55</span>
            <span>75</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Retirement Lifestyle
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['basic', 'comfortable', 'affluent', 'luxury'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setRetirementLifestyle(level);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  retirementLifestyle === level
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Monthly Savings Needed for Retirement:
          </p>
          <p className="text-2xl font-bold text-green-900">
            ${calculations.monthlyRetirementSavingsNeeded.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-green-700">
            Based on retiring at {retirementAge} (in {retirementAge - currentAge} years)
            with a {retirementLifestyle} lifestyle
          </p>
        </div>
      </Card>

      {/* Emergency Fund */}
      <Card title="Emergency Fund" className="space-y-4">
        <p className="text-sm text-gray-600">
          How many months of expenses should your emergency fund cover?
        </p>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Months of Coverage: {emergencyFundMonths}
          </label>
          <input
            type="range"
            min="3"
            max="12"
            value={emergencyFundMonths}
            onChange={(e) => {
              setEmergencyFundMonths(Number(e.target.value));
              setTimeout(handleUpdate, 0);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>3 months</span>
            <span>12 months</span>
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Monthly Savings Needed (for 1 year):
          </p>
          <p className="text-2xl font-bold text-green-900">
            ${calculations.monthlyEmergencyFundSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-green-700">
            Total emergency fund:{' '}
            ${(emergencyFundMonths * monthlyLifeCosts).toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Major Purchases */}
      <Card title="Major Purchases" className="space-y-4">
        <p className="text-sm text-gray-600">
          Planning for a car, house down payment, wedding, or other big expenses?
        </p>

        {majorPurchases.length > 0 && (
          <div className="space-y-2">
            {majorPurchases.map((purchase, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{purchase.name}</p>
                  <p className="text-sm text-gray-600">
                    ${purchase.amount.toLocaleString()} in {purchase.yearsFromNow}{' '}
                    years
                  </p>
                </div>
                <button
                  onClick={() => removeMajorPurchase(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Purchase name (e.g., Car, House down payment)"
            value={newPurchaseName}
            onChange={(e) => setNewPurchaseName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Amount ($)"
              value={newPurchaseAmount}
              onChange={(e) => setNewPurchaseAmount(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Years from now"
              value={newPurchaseYears}
              onChange={(e) => setNewPurchaseYears(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addMajorPurchase}
            disabled={!newPurchaseName || !newPurchaseAmount || !newPurchaseYears}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Purchase
          </button>
        </div>

        {calculations.monthlyMajorPurchaseSavings > 0 && (
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Monthly Savings Needed for Purchases:
            </p>
            <p className="text-2xl font-bold text-green-900">
              ${calculations.monthlyMajorPurchaseSavings.toLocaleString()}
            </p>
          </div>
        )}
      </Card>

      {/* Total Savings Summary */}
      <Card title="Total Monthly Savings Required" className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Retirement</span>
            <span className="font-medium">
              ${calculations.monthlyRetirementSavingsNeeded.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Emergency Fund</span>
            <span className="font-medium">
              ${calculations.monthlyEmergencyFundSavings.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Major Purchases</span>
            <span className="font-medium">
              ${calculations.monthlyMajorPurchaseSavings.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">
                Total Savings Needed
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${calculations.totalMonthlySavingsNeeded.toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
