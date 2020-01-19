import { IApi, IConfig } from '@umijs/types';
import { IServerOpts, Server } from '@umijs/server';
import { portfinder } from '@umijs/utils';
import assert from 'assert';
import getBundleAndConfigs from '../getBundleAndConfigs';
import createRouteMiddleware from './createRouteMiddleware';
import generateFiles from '../generateFiles';

export default (api: IApi) => {
  const {
    env,
    cwd,
    paths,
    utils: { rimraf, chalk },
  } = api;

  let port: number;
  let server: Server;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  api.registerCommand({
    name: 'dev',
    fn: async function() {
      port = await portfinder.getPortPromise({
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
      });
      process.send?.({ type: 'UPDATE_PORT', port });

      rimraf.sync(paths.absTmpPath!);

      // generate files
      await generateFiles({ api, watch: true });

      // delay dev server 启动，避免重复 compile
      // https://github.com/webpack/watchpack/issues/25
      // https://github.com/yessky/webpack-mild-compile
      await delay(500);

      // dev
      const bundleConfig = await getBundleAndConfigs({ api, port });
      const { bundler, bundleConfigs } = bundleConfig;
      const opts: IServerOpts = bundler.setupDevServerOpts({
        bundleConfigs: bundleConfigs,
      });
      server = new Server({
        ...opts,
        // @ts-ignore
        proxy: (api.config as IConfig)?.proxy,
        beforeMiddlewares: [],
        afterMiddlewares: [createRouteMiddleware({ api })],
      });
      return await server.listen({
        port,
        hostname: process.env.HOST || '0.0.0.0',
      });
    },
  });

  api.registerMethod({
    name: 'getPort',
    fn() {
      assert(
        env === 'development',
        `api.getPort() is only valid in development.`,
      );
      return port;
    },
  });

  api.registerMethod({
    name: 'getServer',
    fn() {
      assert(
        env === 'development',
        `api.getServer() is only valid in development.`,
      );
      return server;
    },
  });
};
