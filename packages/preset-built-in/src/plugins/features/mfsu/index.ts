import { lodash } from '@umijs/utils';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { isEqual } from 'lodash';
import mime from 'mime';
import { join, parse } from 'path';
import { IApi } from 'umi';
import webpack from 'webpack';
import { runtimePath } from '../../generateFiles/constants';
import AntdIconPlugin from './babel-antd-icon-plugin';
import BebelImportRedirectPlugin from './babel-import-redirect-plugin';
import { Deps, preBuild, prefix } from './build';
import { watchDeps } from './watchDeps';

const checkConfig = (api: IApi) => {
  const { webpack5, dynamicImport } = api.config;
  if (!webpack5 || !dynamicImport) {
    return false;
  }
  return true;
};

// 必须安装的模块
const requireDeps = ['react', 'react-router-dom', 'react-router'];

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
  const { dependencies = {}, peerDependencies = {} } = require(join(
    process.cwd(),
    'package.json',
  ));
  const deps = { ...dependencies, ...peerDependencies };
  return deps;
};

export const getMfsuTmpPath = (api: IApi) => {
  return join(api.paths.absTmpPath!, '.mfsu');
};

export const getAlias = async (api: IApi) => {
  const depInfo: {
    name: string;
    renge: string;
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
      aliasResult[alia] = name;
    });
  });
  return aliasResult;
};

export const getExtraDeps = (api: IApi) => [
  ...(api.userConfig.mfsu.extraDeps || []),
];

export default function (api: IApi) {
  api.register({
    key: 'mfsu',
    async fn() {
      if (!checkConfig(api)) {
        throw new Error('未开启对应配置');
      }

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

      if (!isEqual(getPrevDeps(api), deps)) {
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
    },
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
  });

  // 部分插件会开启 @babel/import-plugin，但是会影响 mfsu 模式的使用，在此强制关闭
  api.modifyBabelPresetOpts({
    fn: (opts) => {
      if (api.userConfig.mfsu) {
        opts.import = [];
      }
      return opts;
    },
    stage: 99,
  });

  /** 暴露文件 */
  api.addBeforeMiddlewares(() => {
    return (req, res, next) => {
      if (
        !api.userConfig.mfsu ||
        req.url === '/' ||
        !existsSync(join(getMfsuTmpPath(api), '.' + req.url))
      ) {
        next();
      } else {
        readFile(join(getMfsuTmpPath(api), '.' + req.url), {
          encoding: 'utf-8',
        })
          .then((value) => {
            res.setHeader('content-type', mime.lookup(parse(req.url).ext));
            res.send(value);
          })
          .catch((err) => {
            res.send(err);
          });
      }
    };
  });

  /** 修改 webpack 配置 */
  api.chainWebpack(async (memo) => {
    if (!api.userConfig.mfsu) {
      return memo;
    }
    const userRedirect = api.userConfig.mfsu.redirect || {};

    const redirect = lodash.merge(defaultRedirect, userRedirect);

    memo.module
      .rule('import-to-await-require')
      .test(/\.(js|jsx|ts|tsx|mjs)$/)
      .exclude.add(/node_modules/)
      .end()
      .include.add([
        api.cwd,
        // import module out of cwd using APP_ROOT
        // issue: https://github.com/umijs/umi/issues/5594
        ...(process.env.APP_ROOT ? [process.cwd()] : []),
      ])
      .end()
      .before('js')
      .use('babel-lodaer')
      .loader(require.resolve('@umijs/deps/compiled/babel-loader'))
      .options({
        plugins: [
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
                  ...requireDeps.filter(
                    (requireDep) =>
                      !['@umijs/runtime', '@umijs/renderer-react'].includes(
                        requireDep,
                      ),
                  ),
                  ...getExtraDeps(api),
                ]),
              ),
              remoteName: 'mf',
              alias: await getAlias(api),
            },
          ],
        ],
      });
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
  // 注入模块到window对象下，兼容某些包，例如：deep-extend
  api.addEntryCodeAhead(() => {
    return `\n// mfsu inject module to window. \nimport { Buffer } from 'buffer';\nwindow.Buffer = Buffer;\n`;
  });
}
