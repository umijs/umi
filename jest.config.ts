import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig(),
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
} as Config.InitialOptions;
