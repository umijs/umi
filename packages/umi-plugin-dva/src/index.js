import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import globby from 'globby';

export default function(api) {
  const { IMPORT, RENDER } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;
  const dvaContainerPath = join(paths.absTmpDirPath, 'DvaContainer.js');

  function getModels() {
    const modelPaths = globby.sync('**/models/*.js', {
      cwd: paths.absSrcPath,
    });
    return modelPaths
      .map(path =>
        `
    app.model({ ...(require('../../${path}').default) });
  `.trim(),
      )
      .join('\r\n');
  }

  function getPlugins() {
    const pluginPaths = globby.sync('../../plugins/*.js', {
      cwd: paths.absSrcPath,
    });
    return pluginPaths
      .map(path =>
        `
    app.use(require('./${path}').default);
  `.trim(),
      )
      .join('\r\n');
  }

  api.register('generateFiles', () => {
    const tpl = join(__dirname, '../template/DvaContainer.js');
    let tplContent = readFileSync(tpl, 'utf-8');
    tplContent = tplContent
      .replace('<%= RegisterPlugins %>', getPlugins())
      .replace('<%= RegisterModels %>', getModels());
    writeFileSync(dvaContainerPath, tplContent, 'utf-8');
  });

  api.register('modifyEntryFile', ({ memo }) => {
    return memo.replace(
      RENDER,
      `
const DvaContainer = require('./DvaContainer').default;
ReactDOM.render(React.createElement(
  DvaContainer,
  null,
  React.createElement(require('./router').default)
), document.getElementById('root'));
      `.trim(),
    );
  });

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.alias = {
      ...memo.alias,
      dva: dirname(require.resolve('dva/package')),
      'dva-loading': require.resolve('dva-loading'),
    };
    return memo;
  });
}
