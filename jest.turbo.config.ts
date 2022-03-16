import { Config, createConfig } from 'umi/test';

const cwd = process.cwd();

export default {
  ...createConfig(),
  rootDir: cwd,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/compiled',
    '<rootDir>/fixtures',
    '<rootDir>/bundles',
  ],
  cacheDirectory: `${cwd}/.jest-cache`,
} as Config.InitialOptions;
