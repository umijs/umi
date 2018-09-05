import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import globby from 'globby';
import uniq from 'lodash.uniq';
import isRoot from 'path-is-root';
import winPath from 'slash2';
import { chunkName, findJSFile, optsToArray, endWithSlash } from './utils';

export function getModel(cwd, api) {
  const { config } = api;

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

function getModelsWithRoutes(routes, api) {
  const { paths } = api;
  return routes.reduce((memo, route) => {
    return [
      ...memo,
      ...(route.component && route.component.indexOf('() =>') !== 0
        ? getPageModels(join(paths.cwd, route.component), api)
        : []),
      ...(route.routes ? getModelsWithRoutes(route.routes, api) : []),
    ];
  }, []);
}

function getPageModels(cwd, api) {
  let models = [];
  while (!isPagesPath(cwd, api) && !isSrcPath(cwd, api) && !isRoot(cwd)) {
    models = models.concat(getModel(cwd, api));
    cwd = dirname(cwd);
  }
  return models;
}

function isPagesPath(path, api) {
  const { paths } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absPagesPath))
  );
}

function isSrcPath(path, api) {
  const { paths } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absSrcPath))
  );
}

export function getGlobalModels(api, shouldImportDynamic) {
  const { paths, routes } = api;
  let models = getModel(paths.absSrcPath, api);
  if (!shouldImportDynamic) {
    // 不做按需加载时，还需要额外载入 page 路由的 models 文件
    models = [...models, ...getModelsWithRoutes(routes, api)];
    // 去重
    models = uniq(models);
  }
  return models;
}

export default function(api, opts = {}) {
  const { paths, cwd, compatDirname } = api;
  const dvaContainerPath = join(paths.absTmpDirPath, 'DvaContainer.js');
  const isDev = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && opts.dynamicImport;

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
      getGlobalModels(api, shouldImportDynamic),
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

  api.onGenerateFiles(() => {
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
    }
    tplContent = tplContent
      .replace('<%= ExtendDvaConfig %>', '')
      .replace('<%= EnhanceApp %>', '')
      .replace('<%= RegisterPlugins %>', getPluginContent())
      .replace('<%= RegisterModels %>', getGlobalModelContent());
    writeFileSync(dvaContainerPath, tplContent, 'utf-8');
  });

  api.modifyRouterRootComponent(
    `require('dva/router').routerRedux.ConnectedRouter`,
  );

  if (shouldImportDynamic) {
    api.addRouterImport({
      source: 'dva/dynamic',
      specifier: '_dvaDynamic',
    });
  }

  if (shouldImportDynamic) {
    api.modifyRouteComponent((memo, args) => {
      const { importPath, webpackChunkName } = args;
      if (!webpackChunkName) {
        return memo;
      }

      let loadingOpts = '';
      if (opts.dynamicImport.loadingComponent) {
        loadingOpts = `LoadingComponent: require('${winPath(
          join(paths.absSrcPath, opts.dynamicImport.loadingComponent),
        )}').default,`;
      }

      let extendStr = '';
      if (opts.dynamicImport.webpackChunkName) {
        extendStr = `/* webpackChunkName: ^${webpackChunkName}^ */`;
      }

      let ret = `
_dvaDynamic({
  <%= MODELS %>
  component: () => import(${extendStr}'${importPath}'),
  ${loadingOpts}
})
      `.trim();
      const models = getPageModels(join(paths.absTmpDirPath, importPath), api);
      if (models && models.length) {
        ret = ret.replace(
          '<%= MODELS %>',
          `
app: window.g_app,
models: () => [
  ${models
    .map(
      model =>
        `import(${
          opts.dynamicImport.webpackChunkName
            ? `/* webpackChunkName: '${chunkName(paths.cwd, model)}' */`
            : ''
        }'${model}')`,
    )
    .join(',\r\n  ')}
],
      `.trim(),
        );
      }
      return ret.replace('<%= MODELS %>', '');
    });
  }

  api.modifyEntryRender(() => {
    return `
const DvaContainer = require('./DvaContainer').default;
  ReactDOM.render(React.createElement(
    DvaContainer,
    null,
    React.createElement(require('./router').default)
  ), document.getElementById('${api.config.mountElementId || 'root'}'));
    `.trim();
  });

  const dvaDir = compatDirname(
    'dva/package.json',
    cwd,
    dirname(require.resolve('dva/package.json')),
  );

  api.addVersionInfo([
    `dva@${require(join(dvaDir, 'package.json')).version} (${dvaDir})`,
    `dva-loading@${require('dva-loading/package').version}`,
    `dva-immer@${require('dva-immer/package').version}`,
    `path-to-regexp@${require('path-to-regexp/package').version}`,
  ]);

  api.modifyAFWebpackOpts(memo => {
    const alias = {
      ...memo.alias,
      dva: dvaDir,
      'dva-loading': require.resolve('dva-loading'),
      'path-to-regexp': require.resolve('path-to-regexp'),
      'object-assign': require.resolve('object-assign'),
      ...(opts.immer
        ? {
            immer: require.resolve('immer'),
          }
        : {}),
    };
    const extraBabelPlugins = [
      ...(memo.extraBabelPlugins || []),
      ...(isDev && opts.hmr ? [require.resolve('babel-plugin-dva-hmr')] : []),
    ];
    return {
      ...memo,
      alias,
      extraBabelPlugins,
    };
  });

  api.addPageWatcher([
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
  ]);

  api.registerGenerator('dva:model', {
    Generator: require('./model').default(api),
    resolved: join(__dirname, './model'),
  });
}
