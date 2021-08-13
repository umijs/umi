import { BundlerConfigType } from '@umijs/types';
import { chalk, createDebug, mkdirp } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import mime from 'mime';
import { dirname, join, parse } from 'path';
import { IApi } from 'umi';
import webpack from 'webpack';
import BabelImportRedirectPlugin from './babel-import-redirect-plugin';
import BabelPluginAutoExport from './babel-plugin-auto-export';
import BabelPluginWarnRequire from './babel-plugin-warn-require';
import { DEFAULT_MF_NAME, MF_VA_PREFIX } from './constants';
import DepBuilder from './DepBuilder';
import DepInfo from './DepInfo';
import { getUmiRedirect } from './getUmiRedirect';
import { copy } from './utils';

const debug = createDebug('umi:mfsu');

export type TMode = 'production' | 'development';

export const checkConfig = (api: IApi) => {
  const { mfsu } = api.config;

  // .mfsu directory do not match babel-loader
  if (mfsu && mfsu.development && mfsu.development.output) {
    assert(
      /\.mfsu/.test(mfsu.development.output),
      `[MFSU] mfsu.development.output must match /\.mfsu/.`,
    );
  }
  if (mfsu && mfsu.production && mfsu.production.output) {
    assert(
      /\.mfsu/.test(mfsu.production.output),
      `[MFSU] mfsu.production.output must match /\.mfsu/.`,
    );
  }
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

export const normalizeReqPath = (api: IApi, reqPath: string) => {
  let normalPublicPath = api.config.publicPath as string;
  if (/^https?\:\/\//.test(normalPublicPath)) {
    normalPublicPath = new URL(normalPublicPath).pathname;
  } else {
    normalPublicPath = normalPublicPath.replace(/^(?:\.+\/?)+/, '/'); // normalPublicPath should start with '/'
  }
  const isMfAssets =
    reqPath.startsWith(`${normalPublicPath}mf-va_`) ||
    reqPath.startsWith(`${normalPublicPath}mf-dep_`) ||
    reqPath.startsWith(`${normalPublicPath}mf-static/`);
  const fileRelativePath = reqPath
    .replace(new RegExp(`^${normalPublicPath}`), '/')
    .slice(1);
  return {
    isMfAssets,
    normalPublicPath,
    fileRelativePath,
  };
};

export default function (api: IApi) {
  const webpackAlias = {};
  const webpackExternals: any[] = [];
  let publicPath = '/';
  let depInfo: DepInfo;
  let depBuilder: DepBuilder;
  let mode: TMode = 'development';

  api.onPluginReady({
    fn() {
      const command = process.argv[2];
      if (['dev', 'build'].includes(command)) {
        console.log(chalk.hex('#faac00')('⏱️  MFSU Enabled'));
      }
    },
    stage: 2,
  });

  api.onStart(async ({ name, args }) => {
    checkConfig(api);

    if (name === 'build') {
      mode = 'production';
      // @ts-ignore
    } else if (name === 'mfsu' && args._[1] === 'build' && args.mode) {
      // umi mfsu build --mode
      // @ts-ignore
      mode = args.mode || 'development';
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
      api,
      cwd: api.cwd,
      webpackAlias,
    });
    debug('load cache');
    depInfo.loadCache();
    depBuilder = new DepBuilder({
      tmpDir,
      mode,
      api,
    });
  });

  api.modifyConfig({
    fn(memo) {
      return {
        ...memo,

        // Always enable dynamicImport when mfsu is enabled
        dynamicImport: memo.dynamicImport || {},

        // Lock chunks when mfsu is enabled
        // @ts-ignore
        chunks: memo.mfsu?.chunks || ['umi'],
      };
    },
    stage: Infinity,
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
            development: joi.object({
              output: joi.string(),
            }),
            production: joi.object({
              output: joi.string(),
            }),
            mfName: joi.string(),
            exportAllMembers: joi.object(),
            chunks: joi.array().items(joi.string()),
            ignoreNodeBuiltInModules: joi.boolean(),
          })
          .description('open mfsu feature');
      },
    },
    enableBy() {
      return (
        (api.env === 'development' && api.userConfig.mfsu) ||
        (api.env === 'production' && api.userConfig.mfsu?.production) ||
        process.env.ENABLE_MFSU
      );
    },
  });

  api.modifyBabelPresetOpts({
    fn: (opts, args) => {
      return {
        ...opts,
        ...(args.mfsu
          ? {}
          : {
              importToAwaitRequire: {
                remoteName:
                  (api.config.mfsu && api.config.mfsu.mfName) ||
                  DEFAULT_MF_NAME,
                matchAll: true,
                webpackAlias,
                webpackExternals,
                alias: {
                  [api.cwd]: '$CWD$',
                },
                // @ts-ignore
                exportAllMembers: api.config.mfsu?.exportAllMembers,
                onTransformDeps(opts: {
                  file: string;
                  source: string;
                  isMatch: boolean;
                  isExportAllDeclaration?: boolean;
                }) {
                  const file = opts.file.replace(
                    api.paths.absSrcPath! + '/',
                    '@/',
                  );
                  if (process.env.MFSU_DEBUG && !opts.source.startsWith('.')) {
                    if (process.env.MFSU_DEBUG === 'MATCHED' && !opts.isMatch)
                      return;
                    if (process.env.MFSU_DEBUG === 'UNMATCHED' && opts.isMatch)
                      return;
                    console.log(
                      `> import ${chalk[opts.isMatch ? 'green' : 'red'](
                        opts.source,
                      )} from ${file}, ${
                        opts.isMatch ? 'MATCHED' : 'UNMATCHED'
                      }`,
                    );
                  }
                  // collect dependencies
                  if (opts.isMatch) {
                    depInfo.addTmpDep(opts.source, file);
                  }
                },
              },
            }),
      };
    },
    stage: Infinity,
  });

  api.modifyBabelOpts({
    fn: async (opts) => {
      webpackAlias['core-js'] = dirname(
        require.resolve('core-js/package.json'),
      );
      webpackAlias['regenerator-runtime/runtime'] = require.resolve(
        'regenerator-runtime/runtime',
      );

      // @ts-ignore
      const umiRedirect = await getUmiRedirect(process.env.UMI_DIR);

      // 降低 babel-preset-umi 的优先级，保证 core-js 可以被插件及时编译
      opts.presets?.forEach((preset) => {
        if (preset instanceof Array && /babel-preset-umi/.test(preset[0])) {
          preset[1].env.useBuiltIns = false;
        }
      });
      opts.plugins = [
        BabelPluginWarnRequire,
        BabelPluginAutoExport,
        [
          BabelImportRedirectPlugin,
          {
            umi: umiRedirect,
            dumi: umiRedirect,
            '@alipay/bigfish': umiRedirect,
          },
        ],
        ...opts.plugins,
      ];
      return opts;
    },
    stage: Infinity,
  });

  api.addBeforeMiddlewares(() => {
    return (req, res, next) => {
      const path = req.path;
      const { isMfAssets, fileRelativePath } = normalizeReqPath(api, req.path);
      if (isMfAssets) {
        depBuilder.onBuildComplete(() => {
          const mfsuPath = getMfsuPath(api, { mode: 'development' });
          const content = readFileSync(
            join(mfsuPath, fileRelativePath),
            'utf-8',
          );
          res.setHeader('content-type', mime.lookup(parse(path || '').ext));
          // 排除入口文件，因为 hash 是入口文件控制的
          if (!/remoteEntry.js/.test(req.url)) {
            res.setHeader('cache-control', 'max-age=31536000,immutable');
          }
          res.send(content);
        });
      } else {
        next();
      }
    };
  });

  // 修改 webpack 配置
  api.register({
    key: 'modifyBundleConfig',
    fn(memo: any, { type, mfsu }: { mfsu: boolean; type: BundlerConfigType }) {
      if (type === BundlerConfigType.csr) {
        Object.assign(webpackAlias, memo.resolve!.alias || {});
        const externals = memo.externals || {};
        webpackExternals.push(
          ...(Array.isArray(externals) ? externals : [externals]),
        );
        publicPath = memo.output.publicPath;

        if (!mfsu) {
          const mfName =
            (api.config.mfsu && api.config.mfsu.mfName) || DEFAULT_MF_NAME;
          memo.plugins.push(
            new webpack.container.ModuleFederationPlugin({
              name: 'umi-app',
              remotes: {
                [mfName]: `${mfName}@${MF_VA_PREFIX}remoteEntry.js`,
              },
            }),
          );

          // 避免 MonacoEditorWebpackPlugin 在项目编译阶段重复编译 worker
          const hasMonacoPlugin = memo.plugins.some((plugin: object) => {
            return plugin.constructor.name === 'MonacoEditorWebpackPlugin';
          });
          if (hasMonacoPlugin) {
            memo.plugins.push(
              new (class MonacoEditorWebpackPluginHack {
                apply(compiler: webpack.Compiler) {
                  const taps: { type: string; fn: Function; name: string }[] =
                    compiler.hooks.make['taps'];
                  compiler.hooks.make['taps'] = taps.filter((tap) => {
                    // ref: https://github.com/microsoft/monaco-editor-webpack-plugin/blob/3e40369/src/plugins/AddWorkerEntryPointPlugin.ts#L34
                    return !(tap.name === 'AddWorkerEntryPointPlugin');
                  });
                }
              })(),
            );
          }
        }
      }
      return memo;
    },
    stage: Infinity,
  });

  async function buildDeps(opts: { force?: boolean } = {}) {
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

          if (mode === 'development') {
            const server = api.getServer();
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
  // npx umi mfsu build --mode development --force
  api.registerCommand({
    name: 'mfsu',
    async fn({ args }) {
      switch (args._[0]) {
        case 'build':
          console.log('[MFSU] build deps...');
          await buildDeps({
            force: args.force as boolean,
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
