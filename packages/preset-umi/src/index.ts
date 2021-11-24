export type { IApi } from './types';
export default () => {
  return {
    plugins: [
      // registerMethods
      require.resolve('./registerMethods'),

      // features
      require.resolve('./features/appData/appData'),
      require.resolve('./features/check/check'),
      require.resolve('./features/configPlugins/configPlugins'),
      require.resolve('./features/favicon/favicon'),
      require.resolve('./features/mock/mock'),
      require.resolve('./features/tmpFiles/tmpFiles'),
      require.resolve('./features/transform/transform'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/config/config'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/setup'),
      require.resolve('./commands/version'),
      require.resolve('./commands/generate/page'),
      require.resolve('./commands/generate/prettier'),
      require.resolve('./commands/plugin'),
    ],
  };
};
