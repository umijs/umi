import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig(),
  testMatch: ['<rootDir>/packages/*/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
  transformIgnorePatterns: ['/node_modules/', '/compiled/'],
  collectCoverageFrom: [
    '**/src/**/*.{ts,tsx}',
    '!**/examples/**/*.{js,jsx,ts,tsx}',
    '!**/compiled/**/*.{js,jsx}',
    '!**/fixtures/**/*.*',
    '!packages/create-umi/templates/**/*.*',
  ],
} as Config.InitialOptions;
