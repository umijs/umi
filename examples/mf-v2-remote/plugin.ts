import type { IApi } from '@umijs/max';
import { chalk } from '@umijs/utils';
import path from 'path';

const LOGGER_LABEL = chalk.bold.blue('[module-federation-v2]');

export default (api: IApi) => {
  let bundlerWebpackPath: string | undefined;
  try {
    bundlerWebpackPath = path.dirname(
      require.resolve('@umijs/bundler-webpack/package.json'),
    );
  } catch {}

  api.onStart(() => {
    if (!bundlerWebpackPath) {
      throw new Error(
        `Not found '@umijs/bundler-webpack', please check dependencies`,
      );
    }
    const infoMsg = `Using module federation v2`;
    console.log(`${LOGGER_LABEL} ${chalk.gray(infoMsg)}`);
    process.env.FEDERATION_WEBPACK_PATH = path.join(
      api.paths.absTmpPath,
      `plugin-${api.plugin.key}`,
      'webpack/lib/index.js',
    );
  });

  api.onGenerateFiles(({ isFirstTime }) => {
    if (!isFirstTime || !bundlerWebpackPath) {
      return;
    }

    const webpackPath = path.join(bundlerWebpackPath, 'compiled/webpack');
    const deepImportPath = path.join(webpackPath, 'deepImports.json');
    const deepImports = require(deepImportPath) as string[];

    deepImports.forEach((p) => {
      const content = `
module.exports = require('${p}')
`.trimStart();

      // write file
      api.writeTmpFile({
        path: `${p}.js`,
        content,
      });
    });

    // write webpack entry file
    const entryContent = `module.exports = require('webpack')`;
    api.writeTmpFile({
      path: 'webpack/lib/index.js',
      content: entryContent,
    });
  });
};
