import { Config, configUmiAlias, createConfig } from 'umi/test';

const jestCofnig = createConfig({
  target: 'browser',
});
jestCofnig.transform!['^.+\\.tsx?$'] = ['esbuild-jest', { sourcemap: true }];

export default async () => {
  return (await configUmiAlias({
    ...jestCofnig,
  })) as Config.InitialOptions;
};
