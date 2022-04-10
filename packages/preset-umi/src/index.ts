export type { UmiApiRequest, UmiApiResponse } from './features/apiRoute';
export type { IApi, IConfig, webpack } from './types';
export default () => {
  return {
    plugins: [
      // registerMethods
      require.resolve('./registerMethods'),

      // features
      require.resolve('./features/appData/appData'),
      require.resolve('./features/check/check'),
      require.resolve('./features/configPlugins/configPlugins'),
      require.resolve('./features/crossorigin/crossorigin'),
      require.resolve('./features/depsOnDemand/depsOnDemand'),
      require.resolve('./features/devTool/devTool'),
      require.resolve('./features/esmi/esmi'),
      require.resolve('./features/favicon/favicon'),
      require.resolve('./features/mock/mock'),
      require.resolve('./features/polyfill/polyfill'),
      require.resolve('./features/polyfill/publicPathPolyfill'),
      require.resolve('./features/terminal/terminal'),
      require.resolve('./features/tmpFiles/tmpFiles'),
      require.resolve('./features/tmpFiles/configTypes'),
      require.resolve('./features/transform/transform'),
      require.resolve('./features/lowImport/lowImport'),
      require.resolve('./features/vite/vite'),
      require.resolve('./features/apiRoute/apiRoute'),
      require.resolve('./features/monorepo/redirect'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/config/config'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/lint'),
      require.resolve('./commands/setup'),
      require.resolve('./commands/version'),
      require.resolve('./commands/generators/page'),
      require.resolve('./commands/generators/prettier'),
      require.resolve('./commands/generators/tsconfig'),
      require.resolve('./commands/generators/jest'),
      require.resolve('./commands/generators/tailwindcss'),
      require.resolve('./commands/generators/dva'),
      require.resolve('./commands/generators/component'),
      require.resolve('./commands/generators/mock'),
      require.resolve('./commands/generators/api'),
      require.resolve('./commands/plugin'),
      require.resolve('./commands/verify-commit'),
    ],
  };
};
