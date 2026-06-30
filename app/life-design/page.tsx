/**
 * Life Design Reverse Budget Calculator Page
 */

import { LifeDesignWizard } from '@/components/LifeDesignWizard';

export default function LifeDesignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Life Design Calculator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Design your ideal life first, then discover what it takes to get there.
            A goal-first approach to financial planning for young adults.
          </p>
        </div>

        {/* Wizard Component */}
        <LifeDesignWizard />

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>
            This calculator provides general guidance only. Consult with financial
            professionals for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}
