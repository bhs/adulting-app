const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // Source files whose coverage we track. Test files, type declarations and
  // barrel re-export files are excluded so the numbers reflect real logic.
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!components/**/index.ts',
  ],
  // Fail the run when coverage drops below these thresholds. The global gate
  // is 80%; business-critical financial logic in lib/budget is held to 90%+.
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    // Money math is the highest-risk code in the app — hold it to 100%.
    'lib/budget/calculations.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    // The budget reducer drives all financial state transitions — 90%+.
    'lib/budget/reducer.ts': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
}

module.exports = createJestConfig(customJestConfig)
