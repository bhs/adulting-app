'use client';

import React from 'react';
import { BUDGET_PRESETS, BudgetFormData } from '@/lib/budget-types';

interface PresetLoaderProps {
  onLoadPreset: (data: BudgetFormData, presetId: string, presetName: string) => void;
}

export default function PresetLoader({ onLoadPreset }: PresetLoaderProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('');

  const handleLoadPreset = () => {
    const preset = BUDGET_PRESETS.find((p) => p.id === selectedPreset);
    if (preset) {
      onLoadPreset(preset.data, preset.id, preset.name);
      setSelectedPreset('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Quick Start with a Preset
          </h3>
          <p className="text-xs text-gray-600">
            Load a sample budget to get started quickly
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="flex-1 sm:w-48 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Choose a preset...</option>
            {BUDGET_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleLoadPreset}
            disabled={!selectedPreset}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Load
          </button>
        </div>
      </div>
      {selectedPreset && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            {BUDGET_PRESETS.find((p) => p.id === selectedPreset)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
