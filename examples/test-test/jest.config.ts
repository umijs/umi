import { Config, configUmiAlias, createConfig } from 'umi/test';

const jestConfig = createConfig({
  target: 'browser',
  jsTransformer: 'esbuild',
  jsTransformerOpts: { jsx: 'automatic' },
});

export default async () => {
  return (await configUmiAlias({
    ...jestConfig,
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    collectCoverageFrom: [
      '**/*.{ts,tsx,js,jsx}',
      '!.umi/**',
      '!.umi-test/**',
      '!coverage/**',
      '!.umirc.{js,ts}',
      '!.umirc.*.{js,ts}',
    ],
    coverageThreshold: {
      global: {
        lines: 1,
      },
    },
  })) as Config.InitialOptions;
};
