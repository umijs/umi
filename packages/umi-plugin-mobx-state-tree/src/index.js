import { readFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import globby from 'globby';
import uniq from 'lodash.uniq';
import isRoot from 'path-is-root';
import { chunkName, findJSFile, optsToArray, endWithSlash } from './utils';

export function getStore(cwd, api) {
  const { config, winPath } = api;

  const storeJSPath = findJSFile(cwd, 'store');
  if (storeJSPath) {
    return [winPath(storeJSPath)];
  }

  return globby
    .sync(`./${config.singular ? 'store' : 'stores'}/**/*.{ts,tsx,js,jsx}`, {
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
    .map(p => api.winPath(join(cwd, p)));
}

function getStoresWithRoutes(routes, api) {
  const { paths } = api;
  return routes.reduce((memo, route) => {
    return [
      ...memo,
      ...(route.component && route.component.indexOf('() =>') !== 0
        ? getPageStores(join(paths.cwd, route.component), api)
        : []),
      ...(route.routes ? getStoresWithRoutes(route.routes, api) : []),
    ];
  }, []);
}

function getPageStores(cwd, api) {
  let stores = [];
  while (!isPagesPath(cwd, api) && !isSrcPath(cwd, api) && !isRoot(cwd)) {
    stores = stores.concat(getStore(cwd, api));
    cwd = dirname(cwd);
  }
  return stores;
}

function isPagesPath(path, api) {
  const { paths, winPath } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absPagesPath))
  );
}

function isSrcPath(path, api) {
  const { paths, winPath } = api;
  return (
    endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absSrcPath))
  );
}

export function getGlobalStores(api, shouldImportDynamic) {
  const { paths, routes } = api;
  let stores = getStore(paths.absSrcPath, api);
  if (!shouldImportDynamic) {
    console.log(11111111111122131232132321321321321);

    // 不做按需加载时，还需要额外载入 page 路由的 stores 文件
    stores = [...stores, ...getStoresWithRoutes(routes, api)];
    // 去重
    stores = uniq(stores);
  }
  return stores;
}

export default function(api, opts = {}) {
  const { paths, cwd, compatDirname, winPath } = api;
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && opts.dynamicImport;

  function getMobxJS() {
    const mobxJS = findJSFile(paths.absSrcPath, 'mobx');
    if (mobxJS) {
      return winPath(mobxJS);
    }
  }

  function getStoreName(store) {
    const storeArr = winPath(store).split('/');
    return storeArr[storeArr.length - 1];
  }

  function exclude(stores, excludes) {
    return stores.filter(store => {
      for (const exclude of excludes) {
        if (typeof exclude === 'function' && exclude(getStoreName(store))) {
          return false;
        }
        if (exclude instanceof RegExp && exclude.test(getStoreName(store))) {
          return false;
        }
      }
      return true;
    });
  }

  function getGlobalStoresFiles() {
    return exclude(
      getGlobalStores(api, shouldImportDynamic),
      optsToArray(opts.exclude),
    )
      .map(path => ({ name: basename(path, extname(path)), path }))
      .filter(_ => _.name);
  }

  function getGlobalStoresContent() {
    return getGlobalStoresFiles()
      .map(({ name, path }) =>
        `"${name}": types.optional(require('${path}').default,{}),`.trim(),
      )
      .join('\r\n');
  }

  function generateMobxContainer() {
    const tpl = join(__dirname, '../template/MobxContainer.js');
    const tplContent = readFileSync(tpl, 'utf-8');
    api.writeTmpFile('MobxContainer.js', tplContent);
  }

  function generateInitMobx() {
    const tpl = join(__dirname, '../template/initMobx.js');
    let tplContent = readFileSync(tpl, 'utf-8');
    const mobxJS = getMobxJS();
    if (mobxJS) {
      tplContent = tplContent.replace(
        '<%= MobxConfigure %>',
        `
        ...((require('${mobxJS}').config || (() => ({})))())
        `.trim(),
      );
    } else {
      tplContent = tplContent.replace(
        '<%= MobxConfigure %>',
        `
        {}
        `.trim(),
      );
    }
    tplContent = tplContent.replace(
      '<%= RegisterStores %>',
      getGlobalStoresContent(),
    );
    api.writeTmpFile('initMobx.js', tplContent);
  }

  api.onGenerateFiles(() => {
    generateMobxContainer();
    generateInitMobx();
  });

  if (shouldImportDynamic) {
    api.addRouterImport({
      source: 'umi-plugin-mobx-state-tree/dynamic',
      specifier: '_mobxDynamic',
    });
  }

  if (shouldImportDynamic) {
    api.modifyRouteComponent((memo, args) => {
      const { importPath, webpackChunkName } = args;
      if (!webpackChunkName) {
        return memo;
      }

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
      _mobxDynamic({
  <%= MODELS %>
        component: () => import(${extendStr}'${importPath}'),
      })
      `.trim();
      const stores = getPageStores(join(paths.absTmpDirPath, importPath), api)
        .map(path => ({ name: basename(path, extname(path)), path }))
        .filter(_ => _.name);
      if (stores && stores.length) {
        ret = ret.replace(
          '<%= MODELS %>',
          `
          stores: ${stores},
          `.trim(),
        );
      }
      return ret.replace('<%= MODELS %>', '');
    });
  }

  const mobxDir = compatDirname(
    'mobx/package.json',
    cwd,
    dirname(require.resolve('mobx/package.json')),
  );

  api.addVersionInfo([
    `mobx@${require(join(mobxDir, 'package.json')).version} (${mobxDir})`,
    `mobx-react@${require('mobx-react/package').version}`,
    `mobx-state-tree@${require('mobx-state-tree/package').version}`,
  ]);

  api.modifyAFWebpackOpts(memo => {
    const alias = {
      ...memo.alias,
      mobx: require.resolve('mobx'),
      'mobx-react': require.resolve('mobx-react'),
      'mobx-state-tree': require.resolve('mobx-state-tree'),
    };
    return {
      ...memo,
      alias,
    };
  });

  api.addPageWatcher([
    join(paths.absSrcPath, 'stores'),
    join(paths.absSrcPath, 'store.js'),
    join(paths.absSrcPath, 'store.jsx'),
    join(paths.absSrcPath, 'store.ts'),
    join(paths.absSrcPath, 'store.tsx'),
    join(paths.absSrcPath, 'mobx.js'),
    join(paths.absSrcPath, 'mobx.jsx'),
    join(paths.absSrcPath, 'mobx.ts'),
    join(paths.absSrcPath, 'mobx.tsx'),
  ]);

  api.addRuntimePlugin(join(__dirname, './runtime'));
  api.addRuntimePluginKey('mobx');

  api.addEntryCodeAhead(
    `
require('@tmp/initMobx');
  `.trim(),
  );
}
