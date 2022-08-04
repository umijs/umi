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
  })) as Config.InitialOptions;
};
