import type { Config } from '@jest/types';

export default {
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  transform: {
    // alternatives:
    // 1. @swc-node/jest
    // 2. ts-jest
    '^.+\\.ts$': 'esbuild-jest',
  },
  testTimeout: 30000,
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
} as Config.InitialOptions;
