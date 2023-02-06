import { IApi } from '../../types';

export default (api: IApi) => {
  api.addOnDemandDeps(() => {
    const enabled =
      api.config.srcTranspiler === 'swc' ||
      api.userConfig.srcTranspiler === 'swc';
    if (!enabled) {
      return [];
    }

    const bundlerWebpackPkg = require('@umijs/bundler-webpack/package.json');

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
