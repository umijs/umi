import { chalk, createDebug, lodash, mkdirp } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import mime from 'mime';
import { dirname, join, parse } from 'path';
import { IApi } from 'umi';
import url from 'url';
import webpack from 'webpack';
import { runtimePath } from '../../generateFiles/constants';
import AntdIconPlugin from './babel-antd-icon-plugin';
import BebelImportRedirectPlugin from './babel-import-redirect-plugin';
import { MF_VA_PREFIX } from './constants';
import DepBuilder from './DepBuilder';
import DepInfo from './DepInfo';
import { copy } from './utils';

const debug = createDebug('umi:mfsu');

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
    NavLink: 'react-router-dom',
    ApplyPluginsType: runtimePath,
  },
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

export default function (api: IApi) {
  const webpackAlias = {};
  let depInfo: DepInfo;
  let depBuilder: DepBuilder;
  let mode: TMode = 'development';

  api.onStart(async ({ name, args }) => {
    checkConfig(api);

    if (name === 'build') {
      mode = 'production';
      // @ts-ignore
    } else if (name === 'mfsu' && args._[1] === 'build' && args.mode) {
      // @ts-ignore
      mode = args.mode;
    }
    assert(
      ['development', 'production'].includes(mode),
      `[MFSU] Unsupported mode ${mode}, expect development or production.`,
    );

    debug(`mode: ${mode}`);

    const tmpDir = getMfsuPath(api, { mode });
    debug(`tmpDir: ${tmpDir}`);
    if (!existsSync(tmpDir)) {
      mkdirp.sync(tmpDir);
    }
    depInfo = new DepInfo({
      tmpDir,
      mode,
      cwd: api.cwd,
    });
    debug('load cache');
    depInfo.loadCache();
    depBuilder = new DepBuilder({
      tmpDir,
      mode,
      api,
    });
  });

  api.onBuildComplete(async ({ err }) => {
    if (err) return;
    debug(`build deps in production`);
    await buildDeps();
  });

  api.onDevCompileDone(async () => {
    debug(`build deps in development`);
    await buildDeps();
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
      webpackAlias['core-js'] = dirname(
        require.resolve('core-js/package.json'),
      );
      webpackAlias['regenerator-runtime/runtime'] = require.resolve(
        'regenerator-runtime/runtime',
      );
      webpackAlias['dumi/theme'] =
        api.paths.absNodeModulesPath + '/@umijs/preset-dumi/lib/theme/index.js';
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
              // TODO: 正则匹配应该被删除，因为 mf/ 开始的包不应该再被匹配
              if (opts.isMatch && !/^mf\//.test(opts.source)) {
                depInfo.addTmpDep(opts.source);
              }
            },
          },
        ],
        ...opts.plugins,
      ];
      return opts;
    },
    stage: Infinity,
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
  // TODO: 改成从 webpack 配置里获取
  api.chainWebpack(async (memo) => {
    Object.assign(webpackAlias, memo.toConfig().resolve?.alias || {});
    const remotePath =
      api.env === 'production' ? api.userConfig.publicPath || '/' : '/';
    memo.plugin('mf').use(
      new webpack.container.ModuleFederationPlugin({
        name: 'umi-app',
        remotes: {
          mf: 'mf@' + remotePath + MF_VA_PREFIX + 'remoteEntry.js',
        },
      }),
    );
    return memo.merge({
      experiments: { topLevelAwait: true },
    });
  });

  // TODO: support watch
  async function buildDeps(opts: { watch?: boolean; force?: boolean } = {}) {
    const { shouldBuild } = depInfo.loadTmpDeps();
    debug(`shouldBuild: ${shouldBuild}, force: ${opts.force}`);
    if (opts.force || shouldBuild) {
      await depBuilder.build({
        deps: depInfo.data.deps,
        webpackAlias,
        onBuildComplete(err: any, stats: any) {
          debug(`build complete with err ${err}`);
          if (err || stats.hasErrors()) {
            return;
          }
          debug('write cache');
          depInfo.writeCache();

          const server = api.getServer();
          if (server) {
            debug(`refresh server`);
            server.sockWrite({ type: 'ok', data: { reload: true } });
          }
        },
      });
    }

    if (mode === 'production') {
      // production 模式，build 完后将产物移动到 dist 中
      debug(`copy mf output files to dist`);
      copy(
        depBuilder.tmpDir,
        join(api.cwd, api.userConfig.outputPath || './dist'),
      );
    }
  }

  // npx umi mfsu build
  // npx umi mfsu build --mode production
  // npx umi mfsu build --mode development --watch
  // npx umi mfsu build --mode development --force
  api.registerCommand({
    name: 'mfsu',
    async fn({ args }) {
      switch (args._[0]) {
        case 'build':
          console.log('[MFSU] build deps...');
          await buildDeps({
            force: args.force as boolean,
            watch: args.watch as boolean,
          });
          break;
        default:
          throw new Error(
            `[MFSU] Unsupported subcommand ${args._[0]} for mfsu.`,
          );
      }
    },
  });
}
