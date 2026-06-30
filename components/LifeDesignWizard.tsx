/**
 * Life Design Wizard - Main Component
 * Multi-stage wizard with progress tracking and navigation
 */

'use client';

import { useReducer, useEffect } from 'react';
import { wizardReducer, initialWizardState } from '@/lib/life-design-reducer';
import { WizardStage } from '@/lib/life-design-types';
import { calculateTotalLifeCosts } from '@/lib/life-design-calculations';
import { trackCustomEvent } from '@/lib/analytics';

import { Stage1YourAdultLife } from './Stage1YourAdultLife';
import { Stage2YourFutureSelf } from './Stage2YourFutureSelf';
import { Stage3BridgingTheGap } from './Stage3BridgingTheGap';
import { Stage4GettingThere } from './Stage4GettingThere';
import { Stage5YourPlan } from './Stage5YourPlan';
import { Button } from './Button';

const STAGE_TITLES = {
  1: 'Your Adult Life',
  2: 'Your Future Self',
  3: 'Bridging the Gap',
  4: 'Getting There',
  5: 'Your Plan',
};

export function LifeDesignWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  // Track stage changes
  useEffect(() => {
    trackCustomEvent('life_design_stage_view', {
      stage: state.currentStage,
      stage_name: STAGE_TITLES[state.currentStage],
    });
  }, [state.currentStage]);

  const handleNext = () => {
    trackCustomEvent('life_design_stage_complete', {
      stage: state.currentStage,
      stage_name: STAGE_TITLES[state.currentStage],
    });
    dispatch({ type: 'NEXT_STAGE' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    dispatch({ type: 'PREVIOUS_STAGE' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStageClick = (stage: WizardStage) => {
    if (state.completedStages.includes(stage) || stage <= state.currentStage) {
      dispatch({ type: 'GO_TO_STAGE', stage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canProceed = () => {
    switch (state.currentStage) {
      case 1:
        return !!state.stage1;
      case 2:
        return !!state.stage2;
      case 3:
        return !!state.stage3;
      case 4:
        return (
          !!state.stage4 && state.stage4.selectedCareerPaths.length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Calculate values for stages
  const monthlyLifeCosts = state.stage1
    ? calculateTotalLifeCosts(state.stage1)
    : 0;
  const monthlySavingsNeeded = state.stage2?.totalMonthlySavingsNeeded || 0;
  const targetIncome = state.stage3?.targetMonthlyIncome || 0;
  const currentIncome = state.stage3?.currentIncome || 0;

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {([1, 2, 3, 4, 5] as WizardStage[]).map((stage, idx) => (
            <div key={stage} className="flex flex-1 items-center">
              <button
                onClick={() => handleStageClick(stage)}
                disabled={
                  stage > state.currentStage &&
                  !state.completedStages.includes(stage)
                }
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-bold transition-all ${
                  state.currentStage === stage
                    ? 'border-blue-600 bg-blue-600 text-white scale-110'
                    : state.completedStages.includes(stage)
                      ? 'border-green-600 bg-green-600 text-white cursor-pointer hover:scale-105'
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {state.completedStages.includes(stage) ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  stage
                )}
              </button>

              {idx < 4 && (
                <div
                  className={`mx-2 h-1 flex-1 rounded-full transition-colors ${
                    state.completedStages.includes(stage)
                      ? 'bg-green-600'
                      : state.currentStage > stage
                        ? 'bg-blue-400'
                        : 'bg-gray-300'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Stage Labels */}
        <div className="flex justify-between">
          {([1, 2, 3, 4, 5] as WizardStage[]).map((stage) => (
            <div key={stage} className="flex-1 text-center">
              <p
                className={`text-xs font-medium ${
                  state.currentStage === stage
                    ? 'text-blue-600'
                    : state.completedStages.includes(stage)
                      ? 'text-green-600'
                      : 'text-gray-500'
                }`}
              >
                {STAGE_TITLES[stage]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="mb-8">
        {state.currentStage === 1 && (
          <Stage1YourAdultLife
            data={state.stage1}
            onUpdate={(data) => dispatch({ type: 'UPDATE_STAGE_1', data })}
          />
        )}

        {state.currentStage === 2 && (
          <Stage2YourFutureSelf
            data={state.stage2}
            monthlyLifeCosts={monthlyLifeCosts}
            onUpdate={(data) => dispatch({ type: 'UPDATE_STAGE_2', data })}
          />
        )}

        {state.currentStage === 3 && (
          <Stage3BridgingTheGap
            monthlyLifeCosts={monthlyLifeCosts}
            monthlySavingsNeeded={monthlySavingsNeeded}
            data={state.stage3}
            onUpdate={(data) => dispatch({ type: 'UPDATE_STAGE_3', data })}
          />
        )}

        {state.currentStage === 4 && (
          <Stage4GettingThere
            targetMonthlyIncome={targetIncome}
            data={state.stage4}
            onUpdate={(data) => dispatch({ type: 'UPDATE_STAGE_4', data })}
          />
        )}

        {state.currentStage === 5 && (
          <Stage5YourPlan
            currentIncome={currentIncome}
            targetIncome={targetIncome}
            monthlySavingsNeeded={monthlySavingsNeeded}
            monthlyLifeCosts={monthlyLifeCosts}
            selectedCareerPaths={state.stage4?.selectedCareerPaths || []}
            data={state.stage5}
            onUpdate={(data) => dispatch({ type: 'UPDATE_STAGE_5', data })}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={state.currentStage === 1}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </Button>

        {state.currentStage < 5 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              trackCustomEvent('life_design_complete', {
                target_income: targetIncome,
                current_income: currentIncome,
                income_gap: targetIncome - currentIncome,
                careers_selected: state.stage4?.selectedCareerPaths.length || 0,
              });
              alert(
                'Plan complete! You can save or print this page for future reference.'
              );
            }}
          >
            Complete
          </Button>
        )}
      </div>

      {/* Help Text */}
      {!canProceed() && state.currentStage < 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {state.currentStage === 1 &&
              'Make selections above to continue'}
            {state.currentStage === 4 &&
              'Select at least one career path to continue'}
            {state.currentStage !== 1 &&
              state.currentStage !== 4 &&
              'Complete the form above to continue'}
          </p>
        </div>
      )}
    </div>
  );
}
