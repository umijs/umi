import { IApi } from './types';

export default (api: IApi) => {
  api.onStart(() => {});
  return {
    plugins: [
      require.resolve('./registerMethods'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/changelog'),
      require.resolve('./commands/precompile'),
      require.resolve('./commands/release'),
      require.resolve('./commands/version'),

      // features
      require.resolve('./features/configPlugins/configPlugins'),
    ],
  };
};
