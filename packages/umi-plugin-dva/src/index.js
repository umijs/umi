import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import globby from 'globby';
import uniq from 'lodash.uniq';
import isRoot from 'path-is-root';
import winPath from 'slash2';
import { chunkName, findJSFile, optsToArray, endWithSlash } from './utils';

export function getModel(cwd, service) {
  const { config } = service;

  const modelJSPath = findJSFile(cwd, 'model');
  if (modelJSPath) {
    return [winPath(modelJSPath)];
  }

  return globby
    .sync(`./${config.singular ? 'model' : 'models'}/**/*.{ts,tsx,js,jsx}`, {
      cwd,
    })
    .filter(
      p =>
        !p.endsWith('.d.ts') &&
        !p.endsWith('.test.js') &&
        !p.endsWith('.test.jsx') &&
        !p.endsWith('.test.ts') &&
        !p.endsWith('.test.tsx'),
    )
    .map(p => winPath(join(cwd, p)));
}

function getModelsWithRoutes(routes, service) {
  const { paths } = service;
  return routes.reduce((memo, route) => {
    if (route.component) {
      return [
        ...memo,
        ...getPageModels(join(paths.cwd, route.component), service),
        ...(route.routes ? getModelsWithRoutes(route.routes, service) : []),
      ];
    } else {
      return memo;
    }
  }, []);
}

function getPageModels(cwd, service) {
  let models = [];
  while (
    !isPagesPath(cwd, service) &&
    !isSrcPath(cwd, service) &&
    !isRoot(cwd)
  ) {
    models = models.concat(getModel(cwd, service));
    cwd = dirname(cwd);
  }
  return models;
}

function isPagesPath(path, service) {
  const { paths } = service;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absPagesPath))
  );
}

function isSrcPath(path, service) {
  const { paths } = service;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absSrcPath))
  );
}

export function getGlobalModels(service, shouldImportDynamic) {
  const { paths, routes } = service;
  let models = getModel(paths.absSrcPath, service);
  if (!shouldImportDynamic) {
    // 不做按需加载时，还需要额外载入 page 路由的 models 文件
    models = [...models, ...getModelsWithRoutes(routes, service)];
    // 去重
    models = uniq(models);
  }
  return models;
}

export default function(api, opts = {}) {
  const { RENDER, ROUTER_MODIFIER, IMPORT } = api.placeholder;
  const { paths, config } = api.service;
  const dvaContainerPath = join(paths.absTmpDirPath, 'DvaContainer.js');
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && !config.disableDynamicImport;

  function getDvaJS() {
    const dvaJS = findJSFile(paths.absSrcPath, 'dva');
    if (dvaJS) {
      return winPath(dvaJS);
    }
  }

  function getModelName(model) {
    const modelArr = winPath(model).split('/');
    return modelArr[modelArr.length - 1];
  }

  function exclude(models, excludes) {
    return models.filter(model => {
      for (const exclude of excludes) {
        if (typeof exclude === 'function' && exclude(getModelName(model))) {
          return false;
        }
        if (exclude instanceof RegExp && exclude.test(getModelName(model))) {
          return false;
        }
      }
      return true;
    });
  }

  function getGlobalModelContent() {
    return exclude(
      getGlobalModels(api.service, shouldImportDynamic),
      optsToArray(opts.exclude),
    )
      .map(path =>
        `
    app.model({ namespace: '${basename(
      path,
      extname(path),
    )}', ...(require('${path}').default) });
  `.trim(),
      )
      .join('\r\n');
  }

  function getPluginContent() {
    const pluginPaths = globby.sync('plugins/**/*.{js,ts}', {
      cwd: paths.absSrcPath,
    });
    const ret = pluginPaths.map(path =>
      `
app.use(require('../../${path}').default);
  `.trim(),
    );
    if (opts.immer) {
      ret.push(
        `
app.use(require('${winPath(require.resolve('dva-immer'))}').default());
      `.trim(),
      );
    }
    return ret.join('\r\n');
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

      const { loading } = config;
      let loadingOpts = '';
      if (loading) {
        loadingOpts = `LoadingComponent: require('${winPath(
          join(paths.cwd, loading),
        )}').default,`;
      }
      let ret = `
_dvaDynamic({
  <%= MODELS %>
  component: () => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'),
  ${loadingOpts}
})
      `.trim();
      const models = getPageModels(
        join(paths.absTmpDirPath, pageJSFile),
        api.service,
      );
      if (models && models.length) {
        ret = ret.replace(
          '<%= MODELS %>',
          `
app: window.g_app,
models: () => [
  ${models
    .map(
      model =>
        `import(/* webpackChunkName: '${chunkName(
          paths.cwd,
          model,
        )}' */'${model}')`,
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
    const dvaRender = api.service.applyPlugins('modifyDvaRender', {
      initialValue: `
ReactDOM.render(React.createElement(
  DvaContainer,
  null,
  React.createElement(require('./router').default)
), document.getElementById('root'));
`.trim(),
    });

    return memo.replace(
      RENDER,
      `
const DvaContainer = require('./DvaContainer').default;
${dvaRender}
`.trim(),
    );
  });

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.alias = {
      ...memo.alias,
      dva: dirname(require.resolve('dva/package')),
      'dva-loading': require.resolve('dva-loading'),
      'path-to-regexp': require.resolve('path-to-regexp'),
      'object-assign': require.resolve('object-assign'),
      ...(opts.immer
        ? {
            immer: require.resolve('immer'),
          }
        : {}),
    };
    return memo;
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      join(paths.absSrcPath, 'models'),
      join(paths.absSrcPath, 'plugins'),
      join(paths.absSrcPath, 'model.js'),
      join(paths.absSrcPath, 'model.jsx'),
      join(paths.absSrcPath, 'model.ts'),
      join(paths.absSrcPath, 'model.tsx'),
      join(paths.absSrcPath, 'dva.js'),
      join(paths.absSrcPath, 'dva.jsx'),
      join(paths.absSrcPath, 'dva.ts'),
      join(paths.absSrcPath, 'dva.tsx'),
    ];
  });
}
