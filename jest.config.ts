import type { Config } from '@jest/types';

export default {
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  testTimeout: 30000,
} as Config.InitialOptions;
