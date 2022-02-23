import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig({
    target: 'browser',
  }),
} as Config.InitialOptions;
