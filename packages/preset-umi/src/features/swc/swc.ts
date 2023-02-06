import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy: ({ userConfig }) => {
      return (
        api.config.srcTranspiler === 'swc' || userConfig.srcTranspiler === 'swc'
      );
    },
  });

  const bundlerWebpackPkg = require('@umijs/bundler-webpack/package.json');
  api.addOnDemandDeps(() => {
    return [
      {
        name: '@swc/core',
        version: `^${bundlerWebpackPkg.devDependencies['@swc/core']}`,
        reason: `swc is used, install swc dependencies`,
      },
      {
        name: 'swc-plugin-auto-css-modules',
        version: `^${bundlerWebpackPkg.devDependencies['swc-plugin-auto-css-modules']}`,
        reason: `swc plugins`,
      },
    ];
  });
};
