import { Config, configUmiAlias, createConfig } from 'umi/test';

const jestConfig = createConfig({
  target: 'browser',
});
jestConfig.transform!['^.+\\.tsx?$'] = ['esbuild-jest', { sourcemap: true }];

export default async () => {
  return (await configUmiAlias({
    ...jestConfig,
  })) as Config.InitialOptions;
};
