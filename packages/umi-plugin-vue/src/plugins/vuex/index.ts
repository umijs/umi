import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname, relative } from 'path';
import * as uniq from 'lodash.uniq';
import { render } from 'mustache';
import { sync } from 'globby';
import { winPath } from 'umi-utils';
import { chunkName, findJSFile, optsToArray, endWithSlash } from '../../utils';

const JS_EXTNAMES = ['.js', '.ts'];
const tplfile = 'dvaContainer.js';

function template(path) {
  return join(__dirname, '../../../template', `${path}.mustache`);
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

function isPagesPath(path, api) {
  const { paths } = api;
  return endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absPagesPath));
}

function isSrcPath(path, api) {
  const { paths } = api;
  return endWithSlash(winPath(path)) === endWithSlash(winPath(paths.absSrcPath));
}

function getModelName(model) {
  const modelArr = winPath(model).split('/');
  return modelArr[modelArr.length - 1];
}

function getModel(cwd, api) {
  const modelJSPath = findJSFile(cwd, 'model', JS_EXTNAMES);
  return modelJSPath
    ? [winPath(modelJSPath)]
    : sync(`./models/**/*.{ts,js}`, { cwd })
        .filter(p => p.indexOf('.test.') === -1 && p.indexOf('.d.') === -1)
        .map(p => winPath(join(cwd, p)));
}

function getPageModels(cwd, api) {
  let models = [];
  while (!isPagesPath(cwd, api) && !isSrcPath(cwd, api)) {
    models = models.concat(getModel(cwd, api));
    cwd = dirname(cwd);
  }
  return models;
}

function getModelsWithRoutes(routes, api) {
  const { paths } = api;
  return routes.reduce((memo, route) => {
    return [
      ...memo,
      ...(route.component && route.component.indexOf('() =>') !== 0
        ? getPageModels(join(paths.cwd, route.component), api)
        : []),
      ...(route.children ? getModelsWithRoutes(route.children, api) : []),
    ];
  }, []);
}

function getGlobalModels(api, shouldImportDynamic) {
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

function addVersionInfo(api) {
  const { cwd, compatDirname } = api;

  api.addVersionInfo([
    `vuex@${require('vuex/package').version}`,
    `umi-vue@${require('umi-vue/package').version}`,
  ]);
}

function addPageWatcher(api) {
  const { paths } = api;
  api.addPageWatcher([join(paths.absSrcPath, 'models')]);
}

export default function(
  api,
  opts = {
    exclude: [],
    loading: {},
    shouldImportDynamic: true,
  },
) {
  const { config, paths } = api;

  addVersionInfo(api);
  addPageWatcher(api);
  api.addRuntimePluginKey('vuex');

  function getPluginContent() {
    const ret = [];
    return ret.join('\r\n');
  }

  function getGlobalModelContent() {
    return exclude(getGlobalModels(api, opts.shouldImportDynamic), optsToArray(opts.exclude))
      .map(path =>
        `
    app.model({ namespace: '${basename(path, extname(path))}', ...(require('${path}').default) });
  `.trim(),
      )
      .join('\r\n');
  }

  api.onGenerateFiles(() => {
    const wrapperTpl = readFileSync(template(tplfile), 'utf-8');
    const wrapperContent = render(wrapperTpl, {
      LoadingPluginOption: JSON.stringify(opts.loading),
      RegisterPlugins: getPluginContent(),
      RegisterModels: getGlobalModelContent(),
    });
    const wrapperPath = join(paths.absTmpDirPath, tplfile);
    writeFileSync(wrapperPath, wrapperContent, 'utf-8');
  });

  api.modifyEntryRender(entry => {
    return `
  require('@tmp/${tplfile}')
    ${entry}`;
  });

  if (opts.shouldImportDynamic) {
    api.addRouterImport({
      source: 'umi-vue/dynamic',
      specifier: '_dvaDynamic',
    });

    api.modifyAFWebpackOpts(opts => {
      return {
        ...opts,
        disableDynamicImport: false,
      };
    });

    api.modifyRouteComponent((memo, args) => {
      const { importPath, component } = args;
      const models = getPageModels(join(paths.absTmpDirPath, importPath), api);
      let extendStr = `/* webpackChunkName: ^${chunkName(paths.cwd, component)}^ */`;
      return `_dvaDynamic({
          models: () => [
            ${models
              .map(
                model =>
                  `import(/* webpackChunkName: '${chunkName(paths.cwd, model)}' */'${relative(
                    paths.absTmpDirPath,
                    model,
                  )}')`,
              )
              .join(',\r\n  ')}
          ],
          component: () => import(${extendStr}'${importPath}'),
        })`.trim();
    });
  }
}
