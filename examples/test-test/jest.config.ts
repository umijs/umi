import { Config, configUmiAlias, createConfig } from 'umi/test';

const jestConfig = createConfig({
  target: 'browser',
});

export default async () => {
  return (await configUmiAlias({
    ...jestConfig,
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  })) as Config.InitialOptions;
};
