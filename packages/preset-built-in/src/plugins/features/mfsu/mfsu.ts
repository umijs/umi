import { lodash } from '@umijs/utils';
import { existsSync, readFileSync, readdir, copyFileSync } from 'fs';
import mime from 'mime';
import { join, parse } from 'path';
import { IApi } from 'umi';
import webpack from 'webpack';
import { runtimePath } from '../../generateFiles/constants';
import AntdIconPlugin from './babel-antd-icon-plugin';
import BebelImportRedirectPlugin from './babel-import-redirect-plugin';
import { Deps, preBuild, prefix } from './build';
import { watchDeps } from './watchDeps';
import url from 'url';
import { Logger } from '@umijs/core';
import { copy, getFuzzyIncludes, shouldBuild } from './utils';

const logger = new Logger('umi:preset-build-in');

export type TMode = 'production' | 'development';

export const checkConfig = (api: IApi) => {
  const { webpack5, dynamicImport } = api.config;
  if (!webpack5 || !dynamicImport) {
    throw new Error(
      `未开启对应配置: ${!webpack5 ? 'webpack5' : ''} ${
        !dynamicImport ? 'dynamicImport' : ''
      }`,
    );
  }
};

// 必须安装的模块
const requireDeps = [
  'react',
  'react-router-dom',
  'react-router',
  ...['react/jsx-runtime', 'react/jsx-dev-runtime'].filter((dep) => {
    try {
      require(join(process.cwd(), 'node_modules', dep));
      return true;
    } catch (err) {
      return false;
    }
  }),
  ...(process.env.BABEL_POLYFILL !== 'none'
    ? ['core-js', 'regenerator-runtime/runtime']
    : []),
];

// 不打包的模块
const defaultExcludeDeps = ['umi'];

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
  const deps: Deps = { ...dependencies, ...peerDependencies };
  requireDeps
    .concat(Object.values(await getAlias(api)))
    .forEach((requireDep) => {
      if (!deps[requireDep]) {
        deps[requireDep] = '*';
      }
    });

  const extraDeps = getIncludeDeps(api);

  if (extraDeps) {
    extraDeps.forEach((ed) => {
      deps[ed] = '*';
    });
  }

  getExcludeDeps(api).forEach((ded) => {
    if (deps[ded]) {
      delete deps[ded];
    }
  });

  // remove "@umijs/plugin-*" and "umi-plugin-"
  Object.keys(deps).forEach((key) => {
    if (/^(@umijs\/plugin-|umi-plugin-)/.test(key)) {
      delete deps[key];
    }
  });

  return deps;
};

export const getMfsuPath = (api: IApi, { mode }: { mode: TMode }) => {
  if (mode === 'development') {
    const configPath = api.userConfig.mfsu?.development?.output;
    return configPath
      ? join(api.cwd, configPath)
      : join(api.paths.absTmpPath!, '.cache', '.mfsu');
  } else if (mode === 'production') {
    const configPath = api.userConfig.mfsu?.production?.output;
    return configPath
      ? join(api.cwd, configPath)
      : join(api.cwd, './.mfsu-production');
  }
  throw new Error(
    '未知的 mode 参数：' + mode + ', 应为 development 或 production',
  );
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

export const getIncludeDeps = (api: IApi) =>
  [
    ...((api.userConfig.mfsu.includes as string[])
      ?.map((include) => {
        if (include.endsWith('/*')) {
          return getFuzzyIncludes(include);
        } else {
          return include;
        }
      })
      .flat() || []),
  ] as string[];

export const getExcludeDeps = (api: IApi) => [
  ...defaultExcludeDeps,
  ...(api.userConfig.mfsu.excludes || []),
];

export default function (api: IApi) {
  api.onStart(async ({ name }) => {
    checkConfig(api);

    const deps = await getDeps(api);

    // dev mode
    if (name === 'dev') {
      if (shouldBuild(getPrevDeps(api, { mode: 'development' }), deps)) {
        await preBuild(api, { deps, mode: 'development' });
      }

      const unwatch = watchDeps({
        api: api,
        cwd: api.cwd,
        onChange: () => {
          unwatch();
          api.restartServer();
        },
      });
    }
    // prod mode
    if (name === 'build') {
      if (!lodash.isEqual(getPrevDeps(api, { mode: 'production' }), deps)) {
        await preBuild(api, {
          deps,
          mode: 'production',
          outputPath: getMfsuPath(api, { mode: 'production' }),
        });
      }
    }
  });

  // 针对 production 模式，build 完后将产物移动到 dist 中
  api.onBuildComplete(() => {
    const mfsuProdPath = getMfsuPath(api, { mode: 'production' });
    copy(mfsuProdPath, join(api.cwd, './dist'));
  });

  api.describe({
    key: 'mfsu',
    config: {
      schema(joi) {
        return joi
          .object({
            includes: joi.array(),
            excludes: joi.array(),
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
      const userRedirect = api.userConfig.mfsu.redirect || {};
      const redirect = lodash.merge(defaultRedirect, userRedirect);
      opts.presets[0][1].env.useBuiltIns = false; // 降低 babel-preset-umi 的优先级，保证 core-js 可以被插件及时编译
      opts.plugins = [
        AntdIconPlugin,
        [BebelImportRedirectPlugin, redirect],
        [
          require.resolve('@umijs/babel-plugin-import-to-await-require'),
          {
            libs: Array.from(
              new Set([
                ...Object.keys(await getDeps(api)).filter(
                  (d) => !getExcludeDeps(api).includes(d),
                ),
                ...requireDeps,
                ...getIncludeDeps(api),
              ]),
            ),
            remoteName: 'mf',
            alias: await getAlias(api),
          },
        ],
        ...opts.plugins,
      ];
      return opts;
    },
    stage: Infinity - 1,
  });

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
    memo.plugin('mf').use(
      new webpack.container.ModuleFederationPlugin({
        name: 'umi-app',
        remotes: {
          mf: 'mf@/' + prefix + 'remoteEntry.js',
        },
      }),
    );
    return memo.merge({
      experiments: { topLevelAwait: true },
    });
  });
}
