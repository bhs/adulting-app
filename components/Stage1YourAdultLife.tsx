/**
 * Stage 1: Your Adult Life
 * Prompts users to articulate needs vs. wants through structured prompt cards and sliders
 */

'use client';

import { Stage1Data } from '@/lib/life-design-types';
import {
  calculateHousingCost,
  calculateLifestyleCost,
  calculateFamilyCost,
  RETIREMENT_COSTS,
} from '@/lib/life-design-calculations';
import { Card } from './Card';
import { useState } from 'react';

interface Stage1Props {
  data?: Stage1Data;
  onUpdate: (data: Stage1Data) => void;
}

export function Stage1YourAdultLife({ data, onUpdate }: Stage1Props) {
  const [housingType, setHousingType] = useState<
    'studio' | 'one-bedroom' | 'two-bedroom' | 'house' | 'luxury'
  >(data?.housing.type || 'one-bedroom');

  const [location, setLocation] = useState<'urban' | 'suburban' | 'rural'>(
    data?.housing.location || 'urban'
  );

  const [diningOut, setDiningOut] = useState<
    'minimal' | 'moderate' | 'frequent' | 'luxury'
  >(data?.lifestyle.diningOut || 'moderate');

  const [entertainment, setEntertainment] = useState<
    'minimal' | 'moderate' | 'active' | 'premium'
  >(data?.lifestyle.entertainment || 'moderate');

  const [transportation, setTransportation] = useState<
    'public' | 'used-car' | 'new-car' | 'premium'
  >(data?.lifestyle.transportation || 'public');

  const [travel, setTravel] = useState<'none' | 'occasional' | 'regular' | 'frequent'>(
    data?.lifestyle.travel || 'occasional'
  );

  const [familyPlans, setFamilyPlans] = useState(data?.familyPlans.hasPlans || false);
  const [numChildren, setNumChildren] = useState(data?.familyPlans.numChildren || 0);

  const [retirementLifestyle, setRetirementLifestyle] = useState<
    'basic' | 'comfortable' | 'affluent' | 'luxury'
  >(data?.retirementComfort.lifestyle || 'comfortable');

  // Calculate costs in real-time
  const housingCost = calculateHousingCost(housingType, location);
  const lifestyleCost = calculateLifestyleCost({
    diningOut,
    entertainment,
    transportation,
    travel,
  });
  const familyCost = calculateFamilyCost(familyPlans, numChildren);
  const retirementCost = RETIREMENT_COSTS[retirementLifestyle];

  // Update parent whenever values change
  const handleUpdate = () => {
    const stage1Data: Stage1Data = {
      housing: {
        type: housingType,
        location,
        estimatedMonthlyCost: housingCost,
      },
      lifestyle: {
        diningOut,
        entertainment,
        transportation,
        travel,
        estimatedMonthlyCost: lifestyleCost,
      },
      familyPlans: {
        hasPlans: familyPlans,
        numChildren: familyPlans ? numChildren : undefined,
        estimatedMonthlyCost: familyCost,
      },
      retirementComfort: {
        lifestyle: retirementLifestyle,
        estimatedMonthlyNeeded: retirementCost,
      },
    };
    onUpdate(stage1Data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Your Adult Life</h2>
        <p className="text-gray-600">
          Let's build a picture of the life you want. Focus on your aspirations, not
          current reality.
        </p>
      </div>

      {/* Housing Section */}
      <Card title="Where Do You Want to Live?" className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Housing Type
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {(['studio', 'one-bedroom', 'two-bedroom', 'house', 'luxury'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => {
                    setHousingType(type);
                    setTimeout(handleUpdate, 0);
                  }}
                  className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                    housingType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type === 'one-bedroom'
                    ? '1BR'
                    : type === 'two-bedroom'
                      ? '2BR'
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
          <div className="grid grid-cols-3 gap-2">
            {(['urban', 'suburban', 'rural'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocation(loc);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  location === loc
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">
            Estimated: ${housingCost.toLocaleString()}/month
          </p>
        </div>
      </Card>

      {/* Lifestyle Section */}
      <Card title="What's Your Lifestyle?" className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Dining Out
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['minimal', 'moderate', 'frequent', 'luxury'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDiningOut(level);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  diningOut === level
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Entertainment
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['minimal', 'moderate', 'active', 'premium'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setEntertainment(level);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  entertainment === level
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Transportation
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['public', 'used-car', 'new-car', 'premium'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTransportation(type);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  transportation === type
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {type === 'used-car'
                  ? 'Used Car'
                  : type === 'new-car'
                    ? 'New Car'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Travel & Vacation
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['none', 'occasional', 'regular', 'frequent'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => {
                  setTravel(freq);
                  setTimeout(handleUpdate, 0);
                }}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  travel === freq
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">
            Estimated: ${lifestyleCost.toLocaleString()}/month
          </p>
        </div>
      </Card>

      {/* Family Plans Section */}
      <Card title="Family Plans?" className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setFamilyPlans(false);
              setTimeout(handleUpdate, 0);
            }}
            className={`flex-1 rounded-lg border-2 p-3 font-medium transition-colors ${
              !familyPlans
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            No children planned
          </button>
          <button
            onClick={() => {
              setFamilyPlans(true);
              setTimeout(handleUpdate, 0);
            }}
            className={`flex-1 rounded-lg border-2 p-3 font-medium transition-colors ${
              familyPlans
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            Planning for children
          </button>
        </div>

        {familyPlans && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Number of Children: {numChildren}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={numChildren}
              onChange={(e) => {
                setNumChildren(Number(e.target.value));
                setTimeout(handleUpdate, 0);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>5</span>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">
            Estimated: ${familyCost.toLocaleString()}/month
          </p>
        </div>
      </Card>

      {/* Retirement Section */}
      <Card title="Retirement Lifestyle" className="space-y-4">
        <p className="text-sm text-gray-600">
          What kind of lifestyle do you envision in retirement?
        </p>
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

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">
            You'll need: ${retirementCost.toLocaleString()}/month in retirement
          </p>
        </div>
      </Card>
    </div>
  );
}
