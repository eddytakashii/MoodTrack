module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json'],
  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        module: 'commonjs',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
};
