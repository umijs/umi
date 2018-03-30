import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import globby from 'globby';
import uniq from 'lodash.uniq';

export default function(api) {
  const { RENDER, ROUTER_MODIFIER, IMPORT } = api.placeholder;
  const { paths, config } = api.service;
  const { winPath } = api.utils;
  const dvaContainerPath = join(paths.absTmpDirPath, 'DvaContainer.js');
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && !config.disableDynamicImport;

  function getDvaJS() {
    if (existsSync(join(paths.absSrcPath, 'dva.js'))) {
      return winPath(join(paths.absSrcPath, 'dva.js'));
    }
    if (existsSync(join(paths.absSrcPath, 'dva.ts'))) {
      return winPath(join(paths.absSrcPath, 'dva.ts'));
    }
  }

  function getModel(cwd) {
    const modelJSPath = join(cwd, 'model.js');
    if (existsSync(modelJSPath)) {
      return [winPath(modelJSPath)];
    }
    const modelTSPath = join(cwd, 'model.ts');
    if (existsSync(modelTSPath)) {
      return [winPath(modelTSPath)];
    }

    return globby
      .sync(`./${config.singular ? 'model' : 'models'}/**/*.{ts,js}`, {
        cwd,
      })
      .filter(p => !p.endsWith('.d.ts'))
      .map(p => winPath(join(cwd, p)));
  }

  function endWithSlash(path) {
    return path.slice(-1) !== '/' ? `${path}/` : path;
  }

  function isPagesPath(path) {
    return (
      winPath(endWithSlash(path)) === winPath(endWithSlash(paths.absPagesPath))
    );
  }

  function isSrcPath(path) {
    return (
      winPath(endWithSlash(path)) === winPath(endWithSlash(paths.absSrcPath))
    );
  }

  function getModelsWithRoutes(routes) {
    return routes.reduce((memo, route) => {
      return [
        ...memo,
        ...getPageModels(join(paths.cwd, route.component)),
        ...(route.routes ? getModelsWithRoutes(route.routes) : []),
      ];
    }, []);
  }

  function getGlobalModels() {
    let models = getModel(paths.absSrcPath);
    if (!shouldImportDynamic) {
      // dev 模式下还需要额外载入 page 路由的 models 文件
      models = [...models, ...getModelsWithRoutes(api.service.routes)];
      // 去重
      models = uniq(models);
    }
    return models;
  }

  function getPageModels(cwd) {
    let models = [];
    while (!isPagesPath(cwd) && !isSrcPath(cwd) && cwd !== '/') {
      models = models.concat(getModel(cwd));
      cwd = dirname(cwd);
    }
    return models;
  }

  function getGlobalModelContent() {
    return getGlobalModels()
      .map(path =>
        `
    app.model({ ...(require('${path}').default) });
  `.trim(),
      )
      .join('\r\n');
  }

  function getPluginContent() {
    const pluginPaths = globby.sync('plugins/**/*.{js,ts}', {
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
    return stripFirstSlash(
      winPath(path).replace(winPath(paths.cwd), ''),
    ).replace(/\//g, '__');
  }

  api.register('generateFiles', () => {
    const tpl = join(__dirname, '../template/DvaContainer.js');
    let tplContent = readFileSync(tpl, 'utf-8');
    const dvaJS = getDvaJS();
    if (dvaJS) {
      tplContent = tplContent.replace(
        '<%= ExtendDvaConfig %>',
        `
...((require('${dvaJS}').config || (() => ({})))()),
        `.trim(),
      );
      //         .replace('<%= EnhanceApp %>', `
      // app = (require('${dvaJS}').enhance || (app => app))(app);
      //         `.trim());
    }
    tplContent = tplContent
      .replace('<%= ExtendDvaConfig %>', '')
      .replace('<%= EnhanceApp %>', '')
      .replace('<%= RegisterPlugins %>', getPluginContent())
      .replace('<%= RegisterModels %>', getGlobalModelContent());
    writeFileSync(dvaContainerPath, tplContent, 'utf-8');
  });

  api.register('modifyRouterFile', ({ memo }) => {
    return memo
      .replace(
        IMPORT,
        `
import { routerRedux } from 'dva/router';
${shouldImportDynamic ? `import _dvaDynamic from 'dva/dynamic';` : ''}
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

  if (shouldImportDynamic) {
    api.register('modifyRouteComponent', ({ memo, args }) => {
      const { pageJSFile, webpackChunkName } = args;
      if (!webpackChunkName) {
        return memo;
      }

      let ret = `
_dvaDynamic({
  <%= MODELS %>
  component: () => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'),
})
      `.trim();
      const models = getPageModels(join(paths.absTmpDirPath, pageJSFile));
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
      join(paths.absSrcPath, 'dva.js'),
      join(paths.absSrcPath, 'dva.ts'),
    ];
  });
}
