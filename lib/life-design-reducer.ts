/**
 * Reducer for managing the Life Design Wizard state
 */

import { WizardState, WizardAction, WizardStage } from './life-design-types';

export const initialWizardState: WizardState = {
  currentStage: 1,
  completedStages: [],
};

export function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case 'NEXT_STAGE':
      if (state.currentStage < 5) {
        const nextStage = (state.currentStage + 1) as WizardStage;
        return {
          ...state,
          currentStage: nextStage,
          completedStages: state.completedStages.includes(state.currentStage)
            ? state.completedStages
            : [...state.completedStages, state.currentStage],
        };
      }
      return state;

    case 'PREVIOUS_STAGE':
      if (state.currentStage > 1) {
        return {
          ...state,
          currentStage: (state.currentStage - 1) as WizardStage,
        };
      }
      return state;

    case 'GO_TO_STAGE':
      return {
        ...state,
        currentStage: action.stage,
      };

    case 'UPDATE_STAGE_1':
      return {
        ...state,
        stage1: {
          ...state.stage1,
          ...action.data,
        } as any,
      };

    case 'UPDATE_STAGE_2':
      return {
        ...state,
        stage2: {
          ...state.stage2,
          ...action.data,
        } as any,
      };

    case 'UPDATE_STAGE_3':
      return {
        ...state,
        stage3: {
          ...state.stage3,
          ...action.data,
        } as any,
      };

    case 'UPDATE_STAGE_4':
      return {
        ...state,
        stage4: {
          ...state.stage4,
          ...action.data,
        } as any,
      };

    case 'UPDATE_STAGE_5':
      return {
        ...state,
        stage5: {
          ...state.stage5,
          ...action.data,
        } as any,
      };

    case 'COMPLETE_STAGE':
      return {
        ...state,
        completedStages: state.completedStages.includes(action.stage)
          ? state.completedStages
          : [...state.completedStages, action.stage],
      };

    case 'RESET':
      return initialWizardState;

    default:
      return state;
  }
}
