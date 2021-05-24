import { lodash } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
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

const checkConfig = (api: IApi) => {
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

export const getPrevDeps = (api: IApi) => {
  const infoPath = join(getMfsuTmpPath(api), './info.json');
  return existsSync(infoPath) ? require(infoPath) : {};
};

export const getDeps = (): Deps => {
  const pkgPath = join(process.cwd(), 'package.json');
  const { dependencies = {}, peerDependencies = {} } = existsSync(pkgPath)
    ? require(pkgPath)
    : {};
  const deps = { ...dependencies, ...peerDependencies };
  return deps;
};

export const getMfsuTmpPath = (api: IApi) => {
  return join(api.paths.absTmpPath!, '.cache', '.mfsu');
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

export const getExtraDeps = (api: IApi) => [
  ...(api.userConfig.mfsu.extraDeps || []),
];

export default function (api: IApi) {
  api.onStart(async ({ name }) => {
    if (name === 'dev') {
      checkConfig(api);

      let deps = getDeps();

      requireDeps
        .concat(Object.values(await getAlias(api)))
        .forEach((requireDep) => {
          if (!deps[requireDep]) {
            deps[requireDep] = '*';
          }
        });

      const extraDeps = getExtraDeps(api);

      if (extraDeps) {
        extraDeps.forEach((ed) => {
          deps[ed] = '*';
        });
      }

      defaultExcludeDeps.forEach((ded) => {
        if (deps[ded]) {
          delete deps[ded];
        }
      });

      if (!lodash.isEqual(getPrevDeps(api), deps)) {
        await preBuild(api, deps);
      }

      const unwatch = watchDeps({
        api: api,
        cwd: process.cwd(),
        onChange: () => {
          unwatch();
          api.restartServer();
        },
      });
    }
  });

  api.describe({
    key: 'mfsu',
    config: {
      schema(joi) {
        return joi
          .object({
            extraDeps: joi.array(),
            redirect: joi.object(),
          })
          .description('open mfsu feature');
      },
    },
    enableBy() {
      // 暂时只支持在 dev 时开启
      return (
        api.userConfig.mfsu && (api.env === 'development' || process.env.MFSUC)
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

  // 降低 babel-preset-umi 的优先级，保证 core-js 可以被插件及时编译
  api.modifyBabelOpts({
    fn: async (opts) => {
      const userRedirect = api.userConfig.mfsu.redirect || {};
      const redirect = lodash.merge(defaultRedirect, userRedirect);
      opts.presets[0][1].env.useBuiltIns = false;
      opts.plugins = [
        AntdIconPlugin,
        [BebelImportRedirectPlugin, redirect],
        [
          require.resolve('@umijs/babel-plugin-import-to-await-require'),
          {
            libs: Array.from(
              new Set([
                ...Object.keys(getDeps()).filter(
                  (d) => !defaultExcludeDeps.includes(d),
                ),
                ...requireDeps,
                ...getExtraDeps(api),
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
        !existsSync(join(getMfsuTmpPath(api), '.' + pathname))
      ) {
        next();
      } else {
        const value = readFileSync(
          join(getMfsuTmpPath(api), '.' + pathname),
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
