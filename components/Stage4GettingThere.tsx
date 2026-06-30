/**
 * Stage 4: Getting There
 * Maps income target to real career paths with education requirements
 */

'use client';

import { useState } from 'react';
import { Stage4Data, CareerPath } from '@/lib/life-design-types';
import { CAREER_PATHS, getCareerPathsByCategory, getRecommendedCareers } from '@/lib/career-data';
import { Card } from './Card';

interface Stage4Props {
  targetMonthlyIncome: number;
  data?: Stage4Data;
  onUpdate: (data: Stage4Data) => void;
}

const CATEGORIES = [
  { value: 'trades', label: 'Skilled Trades', icon: '🔧' },
  { value: 'tech', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '⚕️' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
] as const;

const GROWTH_COLORS = {
  'very-high': 'bg-green-100 text-green-800',
  high: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

export function Stage4GettingThere({
  targetMonthlyIncome,
  data,
  onUpdate,
}: Stage4Props) {
  const [selectedCategory, setSelectedCategory] = useState<CareerPath['category'] | null>(
    data?.preferredCategory || null
  );
  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>(
    data?.selectedCareerPaths.map((c) => c.id) || []
  );
  const [showRecommended, setShowRecommended] = useState(true);

  const recommendedCareers = getRecommendedCareers(targetMonthlyIncome);
  const categoryCareers = selectedCategory
    ? getCareerPathsByCategory(selectedCategory)
    : [];

  const displayCareers = showRecommended ? recommendedCareers : categoryCareers;

  const toggleCareerSelection = (careerId: string) => {
    const newSelection = selectedCareerIds.includes(careerId)
      ? selectedCareerIds.filter((id) => id !== careerId)
      : [...selectedCareerIds, careerId];

    setSelectedCareerIds(newSelection);

    const selectedPaths = CAREER_PATHS.filter((c) => newSelection.includes(c.id));
    const stage4Data: Stage4Data = {
      selectedCareerPaths: selectedPaths,
      preferredCategory: selectedCategory || undefined,
    };
    onUpdate(stage4Data);
  };

  const handleCategorySelect = (category: CareerPath['category']) => {
    setSelectedCategory(category);
    setShowRecommended(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Getting There</h2>
        <p className="text-gray-600">
          Explore career paths that can help you reach your income target of{' '}
          <span className="font-semibold text-blue-600">
            ${targetMonthlyIncome.toLocaleString()}/month
          </span>
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowRecommended(true)}
          className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-colors ${
            showRecommended
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          Recommended for You
        </button>
        <button
          onClick={() => setShowRecommended(false)}
          className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-colors ${
            !showRecommended
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          Browse by Category
        </button>
      </div>

      {/* Category Selection */}
      {!showRecommended && (
        <Card title="Choose a Career Category">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategorySelect(category.value)}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm">{category.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Career Paths */}
      {displayCareers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {showRecommended ? 'Top Recommendations' : 'Career Options'}
          </h3>

          <div className="space-y-4">
            {displayCareers.map((career) => {
              const isSelected = selectedCareerIds.includes(career.id);
              const meetsTarget =
                career.typicalSalary.median / 12 >= targetMonthlyIncome;

              return (
                <Card
                  key={career.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                  title=""
                >
                  <div
                    onClick={() => toggleCareerSelection(career.id)}
                    className="space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-gray-900">
                            {career.title}
                          </h4>
                          {meetsTarget && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                              Meets Target
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {career.description}
                        </p>
                      </div>
                      <div
                        className={`ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Salary Info */}
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">
                          Typical Salary Range
                        </span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${(career.typicalSalary.median / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">
                            ${(career.typicalSalary.min / 1000).toFixed(0)}K - $
                            {(career.typicalSalary.max / 1000).toFixed(0)}K
                          </p>
                          <p className="mt-1 text-xs font-medium text-blue-600">
                            ~${Math.round(career.typicalSalary.median / 12).toLocaleString()}/month
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                          Education
                        </p>
                        <p className="text-sm text-gray-900">
                          {career.educationRequired}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                          Time to Entry
                        </p>
                        <p className="text-sm text-gray-900">{career.timeToEntry}</p>
                      </div>
                    </div>

                    {/* Credentials */}
                    {career.credentialsRequired.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                          Credentials
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {career.credentialsRequired.map((cred, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                            >
                              {cred}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growth Potential */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-gray-500">
                        Growth Potential
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          GROWTH_COLORS[career.growthPotential]
                        }`}
                      >
                        {career.growthPotential.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Careers Summary */}
      {selectedCareerIds.length > 0 && (
        <Card
          title={`You've Selected ${selectedCareerIds.length} Career Path${selectedCareerIds.length > 1 ? 's' : ''}`}
          className="border-2 border-green-500 bg-green-50"
        >
          <p className="text-sm text-green-800">
            Great choices! In the next step, we'll create your personalized action plan.
          </p>
        </Card>
      )}

      {displayCareers.length === 0 && !showRecommended && (
        <Card className="text-center">
          <p className="text-gray-600">
            Select a category above to view career options
          </p>
        </Card>
      )}
    </div>
  );
}
