import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import webpackDevMiddleware from '@umijs/deps/compiled/webpack-dev-middleware';
import { IServerOpts, Server } from '@umijs/server';
import { BundlerConfigType, IConfig } from '@umijs/types';
import { lodash as _, winPath } from '@umijs/utils';
import { join } from 'path';
import { unescape } from 'querystring';
import getConfig, { IOpts as IGetConfigOpts } from './getConfig/getConfig';

interface IOpts {
  cwd: string;
  config: IConfig;
}

defaultWebpack.init(!!process.env.USE_WEBPACK_5);
require('./requireHook').init();

class Bundler {
  static id = 'webpack';
  static version = 4;
  cwd: string;
  config: IConfig;

  constructor({ cwd, config }: IOpts) {
    this.cwd = cwd;
    this.config = config;
  }

  async getConfig(
    opts: Omit<IGetConfigOpts, 'cwd' | 'config'>,
  ): Promise<defaultWebpack.Configuration> {
    return await getConfig({
      ...opts,
      cwd: this.cwd,
      config: this.config,
    });
  }

  async build({
    bundleConfigs,
    bundleImplementor = defaultWebpack,
    watch,
    onBuildComplete,
  }: {
    bundleConfigs: defaultWebpack.Configuration[];
    bundleImplementor?: typeof defaultWebpack;
    watch?: boolean;
    onBuildComplete?: any;
  }): Promise<{ stats?: defaultWebpack.Stats; compiler: any }> {
    return new Promise((resolve, reject) => {
      const compiler = bundleImplementor.webpack(bundleConfigs);
      if (watch) {
        compiler.watch({}, (err, stats) => {
          onBuildComplete?.(err, stats);
          if (err || stats.hasErrors()) {
            try {
              console.log(stats.toString('errors-only'));
            } catch (e) {}
            console.error(err);
          }
        });
        resolve({ compiler });
      } else {
        compiler.run((err, stats) => {
          onBuildComplete?.(err, stats);
          if (err || stats.hasErrors()) {
            try {
              console.log(stats.toString('errors-only'));
            } catch (e) {}
            console.error(err);
            return reject(new Error('build failed'));
          }
          // ref: https://github.com/webpack/webpack/issues/12345#issuecomment-755273757
          // @ts-ignore
          compiler.close?.();
          // @ts-ignore
          resolve({ stats, compiler });
        });
      }
    });
  }

  /**
   * get ignored watch dirs regexp, for test case
   */
  getIgnoredWatchRegExp =
    (): defaultWebpack.Options.WatchOptions['ignored'] => {
      const { outputPath } = this.config;
      const absOutputPath = _.escapeRegExp(
        winPath(join(this.cwd, outputPath as string, '/')),
      );
      // need ${sep} after outputPath
      return process.env.WATCH_IGNORED === 'none'
        ? undefined
        : new RegExp(
            process.env.WATCH_IGNORED || `(node_modules|${absOutputPath})`,
          );
    };

  setupDevServerOpts({
    bundleConfigs,
    bundleImplementor = defaultWebpack,
  }: {
    bundleConfigs: defaultWebpack.Configuration[];
    bundleImplementor?: typeof defaultWebpack;
  }): IServerOpts {
    const compiler = bundleImplementor.webpack(bundleConfigs);
    const { ssr, devServer } = this.config;

    this.cwdPathCheck();
    // 这里不做 winPath 处理，是为了和下方的 path.sep 匹配上
    const compilerMiddleware = webpackDevMiddleware(compiler, {
      // must be /, otherwise it will exec next()
      publicPath: '/',
      logLevel: 'silent',
      // if `ssr` set false, next() into server-side render
      ...(ssr ? { index: false } : {}),
      writeToDisk: devServer && devServer?.writeToDisk,
      watchOptions: {
        // not watch outputPath dir and node_modules
        ignored: this.getIgnoredWatchRegExp(),
      },
    });

    function sendStats({
      server,
      sockets,
      stats,
    }: {
      server: Server;
      sockets: any;
      stats: defaultWebpack.Stats.ToJsonOutput;
    }) {
      server.sockWrite({ sockets, type: 'hash', data: stats.hash });

      if (stats.errors.length > 0) {
        server.sockWrite({ sockets, type: 'errors', data: stats.errors });
      } else if (stats.warnings.length > 0) {
        server.sockWrite({ sockets, type: 'warnings', data: stats.warnings });
      } else {
        server.sockWrite({ sockets, type: 'ok' });
      }
    }

    function getStats(stats: defaultWebpack.Stats) {
      return stats.toJson({
        all: false,
        hash: true,
        assets: true,
        warnings: true,
        errors: true,
        errorDetails: false,
      });
    }

    let _stats: defaultWebpack.Stats | null = null;

    return {
      compilerMiddleware,
      onListening: ({ server }) => {
        function addHooks(compiler: defaultWebpack.Compiler) {
          const { compile, invalid, done } = compiler.hooks;
          compile.tap('umi-dev-server', () => {
            server.sockWrite({ type: 'invalid' });
          });
          invalid.tap('umi-dev-server', () => {
            server.sockWrite({ type: 'invalid' });
          });
          done.tap('umi-dev-server', (stats) => {
            sendStats({
              server,
              sockets: server.sockets,
              stats: getStats(stats),
            });
            _stats = stats;
          });
        }

        if (compiler.compilers) {
          compiler.compilers.forEach(addHooks);
        } else {
          addHooks(compiler as any);
        }
      },
      onConnection: ({ connection, server }) => {
        if (_stats) {
          sendStats({
            server,
            sockets: [connection],
            stats: getStats(_stats),
          });
        }
      },
    };
  }

  private cwdPathCheck() {
    const cwd = process.cwd();
    const unescaped = unescape(cwd);

    if (cwd !== unescaped) {
      console.error(
        `Project directory path "${cwd}" contains escaped characters, please remove that.
 ref: https://github.com/umijs/umi/issues/8084`,
      );
      throw Error('path contains escaped characters');
    }
  }
}

export { Bundler, BundlerConfigType, defaultWebpack as webpack };
