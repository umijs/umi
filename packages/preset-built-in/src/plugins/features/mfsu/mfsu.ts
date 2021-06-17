import { chalk, lodash } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import mime from 'mime';
import { join, parse } from 'path';
import { IApi } from 'umi';
import url from 'url';
import webpack from 'webpack';
import { runtimePath } from '../../generateFiles/constants';
import AntdIconPlugin from './babel-antd-icon-plugin';
import BebelImportRedirectPlugin from './babel-import-redirect-plugin';
import { Deps, preBuild, prefix } from './build';
import { copy, shouldBuild } from './utils';

export type TMode = 'production' | 'development';

export const checkConfig = (api: IApi) => {
  const { webpack5, dynamicImport } = api.config;
  if (!webpack5 || !dynamicImport) {
    throw new Error(
      `[MFSU] MFSU 功能要求同时开启对应配置: ${!webpack5 ? 'webpack5' : ''} ${
        !dynamicImport ? 'dynamicImport' : ''
      }`,
    );
  }
};

// 需要重新定向导出的模块
const defaultRedirect = {
  umi: {
    Link: 'react-router-dom',
    ApplyPluginsType: runtimePath,
  },
};

export const getPrevDeps = (
  api: IApi,
  { path, mode }: { path?: string; mode: TMode },
) => {
  const infoPath = join(path || getMfsuPath(api, { mode }), './info.json');
  return existsSync(infoPath) ? require(infoPath) : {};
};

export const getDeps = async (api: IApi) => {
  const pkgPath = join(api.cwd, 'package.json');
  const { dependencies = {}, peerDependencies = {} } = existsSync(pkgPath)
    ? require(pkgPath)
    : {};
  const packageDependencies: Deps = { ...dependencies, ...peerDependencies };

  let deps = Array.from(
    new Set(
      userDeps.concat(api.userConfig.mfsu.includes || []).filter((_dep) => {
        return (
          !(api.userConfig.excludes || []).includes(_dep) ||
          /^(@umijs\/plugin-|umi-plugin-)/.test(_dep)
        );
      }),
    ),
  );
  return deps.reduce((memo, dep) => {
    const version = packageDependencies[dep];
    memo[dep] = version || '*';
    return memo;
  }, {});
};

export const getMfsuPath = (api: IApi, { mode }: { mode: TMode }) => {
  if (mode === 'development') {
    const configPath = api.userConfig.mfsu?.development?.output;
    return configPath
      ? join(api.cwd, configPath)
      : join(api.paths.absTmpPath!, '.cache', '.mfsu');
  } else {
    const configPath = api.userConfig.mfsu?.production?.output;
    return configPath
      ? join(api.cwd, configPath)
      : join(api.cwd, './.mfsu-production');
  }
};

export const getAlias = async (api: IApi, opts?: { reverse?: boolean }) => {
  const depInfo: {
    name: string;
    range: string;
    alias?: string[];
  }[] = await api.applyPlugins({
    key: 'addDepInfo',
    type: api.ApplyPluginsType.add,
    initialValue: [],
  });

  const aliasResult = {};

  depInfo.forEach((dinfo) => {
    const { name, alias = [] } = dinfo;
    alias.forEach((alia) => {
      if (opts?.reverse) {
        // exp: {'@umijs/runtime' : '/aaa/bbb/ccc'}
        aliasResult[name] = alia;
      } else {
        // exp: {'/aaa/bbb/ccc' : '@umijs/runtime'}
        aliasResult[alia] = name;
      }
    });
  });
  return aliasResult;
};

let userDeps: string[] = [];

export default function (api: IApi) {
  const webpackAlias = {};
  api.onStart(async ({ name }) => {
    userDeps = [];
    checkConfig(api);
  });

  // 针对 production 模式，build 完后将产物移动到 dist 中
  api.onBuildComplete(async ({ err }) => {
    if (err) return;
    const deps = await getDeps(api);
    if (!lodash.isEqual(getPrevDeps(api, { mode: 'production' }), deps)) {
      await preBuild(api, webpackAlias, {
        deps,
        mode: 'production',
        outputPath: getMfsuPath(api, { mode: 'production' }),
      });
    }
    const mfsuProdPath = getMfsuPath(api, { mode: 'production' });
    copy(mfsuProdPath, join(api.cwd, api.userConfig.outputPath || './dist'));
  });

  api.onDevCompileDone(async () => {
    try {
      const deps = await getDeps(api);
      if (shouldBuild(getPrevDeps(api, { mode: 'development' }), deps)) {
        await preBuild(api, webpackAlias, { deps, mode: 'development' });
        userDeps = [];
      }
    } catch (error) {
      throw new Error('[MFSU] build failed.' + error);
    }
  });

  api.describe({
    key: 'mfsu',
    config: {
      schema(joi) {
        return joi
          .object({
            includes: joi.array().items(joi.string()),
            excludes: joi.array().items(joi.string()),
            redirect: joi.object(),
            development: joi.object({
              output: joi.string(),
            }),
            production: joi.object({
              output: joi.string(),
            }),
          })
          .description('open mfsu feature');
      },
    },
    enableBy() {
      return (
        (api.env === 'development' && api.userConfig.mfsu) ||
        (api.env === 'production' && api.userConfig.mfsu?.production) ||
        process.env.MFSUC
      );
    },
  });

  // 部分插件会开启 @babel/import-plugin，但是会影响 mfsu 模式的使用，在此强制关闭
  api.modifyBabelPresetOpts({
    fn: (opts) => {
      return {
        ...opts,
        import: [],
      };
    },
    stage: Infinity,
  });

  // 为 babel 提供相关插件
  api.modifyBabelOpts({
    fn: async (opts) => {
      const depInfoAlias = await getAlias(api, { reverse: true });
      webpackAlias['core-js'] = depInfoAlias['core-js'];
      webpackAlias['regenerator-runtime/runtime'] =
        depInfoAlias['regenerator-runtime/runtime'];

      const userRedirect = api.userConfig.mfsu.redirect || {};
      const redirect = lodash.merge(defaultRedirect, userRedirect);
      // 降低 babel-preset-umi 的优先级，保证 core-js 可以被插件及时编译
      opts.presets?.forEach((preset) => {
        if (preset instanceof Array && /babel-preset-umi/.test(preset[0])) {
          preset[1].env.useBuiltIns = false;
        }
      });
      opts.plugins = [
        AntdIconPlugin,
        [BebelImportRedirectPlugin, redirect],
        [
          require.resolve('@umijs/babel-plugin-import-to-await-require'),
          {
            remoteName: 'mf',
            matchAll: true,
            webpackAlias: webpackAlias,
            alias: {
              [api.cwd]: '$CWD$',
            },
            onTransformDeps(opts: {
              file: string;
              source: string;
              isMatch: boolean;
              isExportAllDeclaration?: boolean;
            }) {
              const file = opts.file.replace(api.paths.absSrcPath! + '/', '@/');
              if (process.env.MFSU_DEBUG && !opts.source.startsWith('.')) {
                if (process.env.MFSU_DEBUG === 'MATCHED' && !opts.isMatch)
                  return;
                if (process.env.MFSU_DEBUG === 'UNMATCHED' && opts.isMatch)
                  return;
                console.log(
                  `> import ${chalk[opts.isMatch ? 'green' : 'red'](
                    opts.source,
                  )} from ${file}, ${opts.isMatch ? 'MATCHED' : 'UNMATCHED'}`,
                );
              }
              // collect dependencies
              opts.isMatch && userDeps.push(opts.source);
            },
          },
        ],
        ...opts.plugins,
      ];
      return opts;
    },
    stage: Infinity,
  });

  api.addDepInfo(() => [
    {
      name: 'core-js',
      range: '3.6.5',
      alias: [require.resolve('core-js')],
    },
    {
      name: 'regenerator-runtime/runtime',
      range: '*',
      alias: [require.resolve('regenerator-runtime/runtime')],
    },
  ]);

  /** 暴露文件 */
  api.addBeforeMiddlewares(() => {
    return (req, res, next) => {
      const { pathname } = url.parse(req.url);
      if (
        !api.userConfig.mfsu ||
        req.url === '/' ||
        !existsSync(
          join(getMfsuPath(api, { mode: 'development' }), '.' + pathname),
        )
      ) {
        next();
      } else {
        const value = readFileSync(
          join(getMfsuPath(api, { mode: 'development' }), '.' + pathname),
          'utf-8',
        );
        res.setHeader('content-type', mime.lookup(parse(pathname || '').ext));
        // 排除入口文件，因为 hash 是入口文件控制的
        if (!/remoteEntry.js/.test(req.url)) {
          res.setHeader('cache-control', 'max-age=31536000,immutable');
        }
        res.send(value);
      }
    };
  });

  /** 修改 webpack 配置 */
  api.chainWebpack(async (memo) => {
    Object.assign(webpackAlias, memo.toConfig().resolve?.alias || {});
    const remotePath =
      api.env === 'production' ? api.userConfig.publicPath || '/' : '/';
    memo.plugin('mf').use(
      new webpack.container.ModuleFederationPlugin({
        name: 'umi-app',
        remotes: {
          mf: 'mf@' + remotePath + prefix + 'remoteEntry.js',
        },
      }),
    );
    return memo.merge({
      experiments: { topLevelAwait: true },
    });
  });
}
