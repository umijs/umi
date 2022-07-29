import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig(),
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transformIgnorePatterns: ['/node_modules/', '/compiled/'],
  collectCoverageFrom: [
    '**/src/**/*.{ts,tsx}',
    '!**/examples/**/*.{js,jsx,ts,tsx}',
    '!**/compiled/**/*.{js,jsx}',
    '!**/fixtures/**/*.*',
    '!**/src/types.ts',
    '!**/src/logger.ts',
  ],
} as Config.InitialOptions;
