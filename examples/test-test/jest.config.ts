import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
    }),
  })) as Config.InitialOptions;
};
