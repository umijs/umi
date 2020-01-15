import { IConfig } from '@umijs/types';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import { Server, IServerOpts } from '@umijs/server';
import { ConfigType } from '@umijs/bundler-utils';
import getConfig, { IOpts as IGetConfigOpts } from './getConfig/getConfig';

interface IOpts {
  cwd: string;
  config: IConfig;
}

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
  ): Promise<webpack.Configuration> {
    return await getConfig({
      ...opts,
      cwd: this.cwd,
      config: this.config,
    });
  }

  async build({
    bundleConfigs,
  }: {
    bundleConfigs: webpack.Configuration[];
  }): Promise<{ stats: webpack.Stats }> {
    return new Promise((resolve, reject) => {
      const compiler = webpack(bundleConfigs);
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          console.log(stats.toString('errors-only'));
          return reject(new Error('build failed'));
        }
        resolve({ stats });
      });
    });
  }

  getMiddleware({ bundleConfigs }: { bundleConfigs: webpack.Configuration[] }) {
    const compiler = webpack(bundleConfigs);
    return webpackDevMiddleware(compiler as any);
  }

  setupDevServerOpts({
    bundleConfigs,
  }: {
    bundleConfigs: webpack.Configuration[];
  }): IServerOpts {
    const compiler = webpack(bundleConfigs);
    const compilerMiddleware = webpackDevMiddleware(compiler);

    function sendStats({
      server,
      sockets,
      stats,
    }: {
      server: Server;
      sockets: any;
      stats: webpack.Stats.ToJsonOutput;
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

    function getStats(stats: webpack.Stats) {
      return stats.toJson({
        all: false,
        hash: true,
        assets: true,
        warnings: true,
        errors: true,
        errorDetails: false,
      });
    }

    let _stats: webpack.Stats | null = null;

    return {
      compilerMiddleware,
      onListening: ({ server }) => {
        function addHooks(compiler: webpack.Compiler) {
          const { compile, invalid, done } = compiler.hooks;
          compile.tap('umi-dev-server', () => {
            server.sockWrite({ type: 'invalid' });
          });
          invalid.tap('umi-dev-server', () => {
            server.sockWrite({ type: 'invalid' });
          });
          done.tap('umi-dev-server', stats => {
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

  async dev() {}
}

export { Bundler, ConfigType };
