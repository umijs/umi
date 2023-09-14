export type { UmiApiRequest, UmiApiResponse } from './features/apiRoute';
export type { IApi, IConfig, IRoute, webpack } from './types';
export default () => {
  return {
    plugins: [
      // registerMethods
      require.resolve('./registerMethods'),

      // features
      process.env.DID_YOU_KNOW !== 'none' &&
        require.resolve('@umijs/did-you-know/dist/plugin'),
      require.resolve('./features/404/404'),
      require.resolve('./features/appData/appData'),
      require.resolve('./features/appData/umiInfo'),
      require.resolve('./features/check/check'),
      require.resolve('./features/check/babel722'),
      require.resolve('./features/codeSplitting/codeSplitting'),
      require.resolve('./features/configPlugins/configPlugins'),
      require.resolve('./features/crossorigin/crossorigin'),
      require.resolve('./features/depsOnDemand/depsOnDemand'),
      require.resolve('./features/devTool/devTool'),
      require.resolve('./features/esbuildHelperChecker/esbuildHelperChecker'),
      require.resolve('./features/esmi/esmi'),
      require.resolve('./features/exportStatic/exportStatic'),
      require.resolve('./features/favicons/favicons'),
      require.resolve('./features/helmet/helmet'),
      require.resolve('./features/icons/icons'),
      require.resolve('./features/mock/mock'),
      require.resolve('./features/mpa/mpa'),
      require.resolve('./features/okam/okam'),
      require.resolve('./features/overrides/overrides'),
      require.resolve('./features/phantomDependency/phantomDependency'),
      require.resolve('./features/polyfill/polyfill'),
      require.resolve('./features/polyfill/publicPathPolyfill'),
      require.resolve('./features/prepare/prepare'),
      require.resolve('./features/routePrefetch/routePrefetch'),
      require.resolve('./features/terminal/terminal'),

      // 1. generate tmp files
      require.resolve('./features/tmpFiles/tmpFiles'),
      // 2. `clientLoader` and `routeProps` depends on `tmpFiles` files
      require.resolve('./features/clientLoader/clientLoader'),
      require.resolve('./features/routeProps/routeProps'),
      // 3. `ssr` needs to be run last
      require.resolve('./features/ssr/ssr'),

      require.resolve('./features/tmpFiles/configTypes'),
      require.resolve('./features/transform/transform'),
      require.resolve('./features/lowImport/lowImport'),
      require.resolve('./features/vite/vite'),
      require.resolve('./features/apiRoute/apiRoute'),
      require.resolve('./features/monorepo/redirect'),
      require.resolve('./features/test/test'),
      require.resolve('./features/clickToComponent/clickToComponent'),
      require.resolve('./features/legacy/legacy'),
      require.resolve('./features/classPropertiesLoose/classPropertiesLoose'),
      require.resolve('./features/webpack/webpack'),
      require.resolve('./features/swc/swc'),
      require.resolve('./features/ui/ui'),
      require.resolve('./features/hmrGuardian/hmrGuardian'),

      // commands
      require.resolve('./commands/build'),
      require.resolve('./commands/config/config'),
      require.resolve('./commands/dev/dev'),
      require.resolve('./commands/help'),
      require.resolve('./commands/lint'),
      require.resolve('./commands/setup'),
      require.resolve('./commands/deadcode'),
      require.resolve('./commands/version'),
      require.resolve('./commands/generators/page'),
      require.resolve('./commands/generators/prettier'),
      require.resolve('./commands/generators/tsconfig'),
      require.resolve('./commands/generators/jest'),
      require.resolve('./commands/generators/tailwindcss'),
      require.resolve('./commands/generators/dva'),
      require.resolve('./commands/generators/component'),
      require.resolve('./commands/generators/mock'),
      require.resolve('./commands/generators/cypress'),
      require.resolve('./commands/generators/api'),
      require.resolve('./commands/generators/precommit'),
      require.resolve('./commands/plugin'),
      require.resolve('./commands/verify-commit'),
      require.resolve('./commands/preview'),
      require.resolve('./commands/mfsu/mfsu'),
      require.resolve('@umijs/plugin-run'),
    ].filter(Boolean),
  };
};
