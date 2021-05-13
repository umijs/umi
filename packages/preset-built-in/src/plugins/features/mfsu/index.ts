import { IApi } from 'umi';
import { join, resolve } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

import webpack from 'webpack';
import { isEqual } from 'lodash';
import { Deps, preBuild, prefix } from './build';
import { watchDeps } from './watchDeps';

import { renderReactPath, runtimePath } from '../../generateFiles/constants';

const checkConfig = (api: IApi) => {
  const { webpack5, dynamicImport } = api.config;
  if (!webpack5 || !dynamicImport) {
    return false;
  }
  return true;
};

const requireDeps = ['@umijs/renderer-react', '@umijs/runtime', 'react'];

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

export default function (api: IApi) {
  api.register({
    key: 'mfsu',
    async fn() {
      // 检查配置
      if (!checkConfig(api)) {
        throw new Error('未开启对应配置');
      }

      // 获取 deps
      const deps = getDeps();

      // 确保存在 @umijs/runtime 和 @umijs/renderer-react 依赖
      requireDeps.forEach((requireDep) => {
        if (!deps[requireDep]) {
          deps[requireDep] = '*';
        }
      });

      // 检查需不需要重新构建
      if (!isEqual(getPrevDeps(api), deps)) {
        // 构建
        await preBuild(api, deps);
      }
      // 监听
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
        return joi.object().description('open mfsu feature');
      },
    },
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
            res.setHeader('content-type', 'application/javascript');
            res.send(value);
          })
          .catch((err) => {
            res.send(err);
          });
      }
    };
  });

  /** 修改 webpack 配置 */
  api.chainWebpack((memo) => {
    if (!api.userConfig.mfsu) {
      return memo;
    }
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
          [
            require.resolve('@umijs/babel-plugin-import-to-await-require'),
            {
              libs: Array.from(
                new Set([
                  ...Object.keys(getDeps()),
                  ...requireDeps.filter(
                    (requireDep) =>
                      !['@umijs/runtime', '@umijs/renderer-react'].includes(
                        requireDep,
                      ),
                  ),
                ]),
              ),
              remoteName: 'mf',
              alias: {
                [runtimePath]: '@umijs/runtime',
                [renderReactPath]: '@umijs/renderer-react',
              },
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
}
