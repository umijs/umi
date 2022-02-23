import { Config, createConfig, JSTransformer } from 'umi/test';

export default {
  ...createConfig({
    jsTransformer: JSTransformer.esbuild,
  }),
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
} as Config.InitialOptions;
