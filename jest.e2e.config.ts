import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig(),
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: ['expect-playwright'],
  testMatch: ['**/*.e2e.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
    '<rootDir>/test/.+/fixtures',
  ],
  moduleNameMapper: {
    'test-utils': '<rootDir>/test/lib/testUtils.ts',
  },
} as Config.InitialOptions;
