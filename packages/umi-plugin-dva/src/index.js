import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import globby from 'globby';

const ROUTE_FILES = ['page.js', 'page.ts', 'page.jsx', 'page.tsx'];

export default function(api) {
  const { RENDER, ROUTER_MODIFIER, IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;
  const dvaContainerPath = join(paths.absTmpDirPath, 'DvaContainer.js');
  const isProduction = process.env.NODE_ENV === 'production';

  function getModels() {
    const pattern = isProduction ? 'models/*.{ts,js}' : '**/models/*.{ts,js}';
    const modelPaths = globby.sync(pattern, {
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

  function getPageModels(pageJSFile) {
    const filePath = join(paths.absTmpDirPath, pageJSFile);
    const fileName = basename(filePath);
    if (ROUTE_FILES.indexOf(fileName) > -1) {
      const root = dirname(filePath);
      const modelPaths = globby.sync('./models/*.{ts,js}', {
        cwd: root,
      });
      return modelPaths.map(m => join(root, m));
    } else {
      return [];
    }
  }

  function getPlugins() {
    const pluginPaths = globby.sync('plugins/*.js', {
      cwd: paths.absSrcPath,
    });
    return pluginPaths
      .map(path =>
        `
    app.use(require('../../${path}').default);
  `.trim(),
      )
      .join('\r\n');
  }

  function stripFirstSlash(path) {
    if (path.charAt(0) === '/') {
      return path.slice(1);
    } else {
      return path;
    }
  }

  function chunkName(path) {
    return stripFirstSlash(winPath(path.replace(paths.cwd, ''))).replace(
      /\//g,
      '__',
    );
  }

  api.register('generateFiles', () => {
    const tpl = join(__dirname, '../template/DvaContainer.js');
    let tplContent = readFileSync(tpl, 'utf-8');
    tplContent = tplContent
      .replace('<%= RegisterPlugins %>', getPlugins())
      .replace('<%= RegisterModels %>', getModels());
    writeFileSync(dvaContainerPath, tplContent, 'utf-8');
  });

  api.register('modifyRouterFile', ({ memo }) => {
    return memo
      .replace(
        IMPORT,
        `
import { routerRedux } from 'dva/router';
${isProduction ? `import _dvaDynamic from 'dva/dynamic';` : ''}
${IMPORT}
      `.trim(),
      )
      .replace(
        ROUTER_MODIFIER,
        `
const { ConnectedRouter } = routerRedux;
Router = ConnectedRouter;
${ROUTER_MODIFIER}
      `.trim(),
      );
  });

  if (isProduction) {
    api.register('modifyRouteComponent', ({ args }) => {
      const { pageJSFile, webpackChunkName } = args;
      let ret = `
_dvaDynamic({
  <%= MODELS %>
  component: () => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'),
})
      `.trim();
      const models = getPageModels(pageJSFile);
      if (models && models.length) {
        ret = ret.replace(
          '<%= MODELS %>',
          `
app: window.g_app,
models: () => [
  ${models
    .map(
      model =>
        `import(/* webpackChunkName: '${chunkName(model)}' */'${model}')`,
    )
    .join(',\r\n  ')}
],
      `.trim(),
        );
      }
      return ret.replace('<%= MODELS %>', '');
    });
  }

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

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      join(paths.absSrcPath, 'models'),
      join(paths.absSrcPath, 'plugins'),
    ];
  });
}
