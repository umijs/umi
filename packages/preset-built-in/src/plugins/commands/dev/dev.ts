import { IApi, IConfig } from '@umijs/types';
import { IServerOpts, Server } from '@umijs/server';
import { delay } from '@umijs/utils';
import assert from 'assert';
import getBundleAndConfigs from '../getBundleAndConfigs';
import createRouteMiddleware from './createRouteMiddleware';
import generateFiles from '../generateFiles';

export default (api: IApi) => {
  const {
    env,
    cwd,
    paths,
    utils: { rimraf, chalk, portfinder },
  } = api;

  let port: number;
  let server: Server;
  const unwatchs: Function[] = [];

  api.registerCommand({
    name: 'dev',
    fn: async function() {
      port = await portfinder.getPortPromise({
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
      });
      console.log(chalk.cyan('Starting the development server...'));
      process.send?.({ type: 'UPDATE_PORT', port });

      rimraf.sync(paths.absTmpPath!);

      // generate files
      const unwatchGenerateFiles = await generateFiles({ api, watch: true });
      unwatchs.push(unwatchGenerateFiles);

      // watch config change
      const unwatchConfig = api.service.configInstance.watch({
        userConfig: api.service.userConfig,
        onChange({ pluginChanged, userConfig, valueChanged }) {
          api.restartServer();
        },
      });
      unwatchs.push(unwatchConfig);

      // delay dev server 启动，避免重复 compile
      // https://github.com/webpack/watchpack/issues/25
      // https://github.com/yessky/webpack-mild-compile
      await delay(500);

      // dev
      const {
        bundler,
        bundleConfigs,
        bundleImplementor,
      } = await getBundleAndConfigs({ api, port });
      const opts: IServerOpts = bundler.setupDevServerOpts({
        bundleConfigs: bundleConfigs,
        bundleImplementor,
      });

      const beforeMiddlewares = await api.applyPlugins({
        key: 'addBeforeMiddewares',
        type: api.ApplyPluginsType.add,
        initialValue: [],
        args: {},
      });

      const server = new Server({
        ...opts,
        // @ts-ignore
        proxy: (api.config as IConfig)?.proxy,
        beforeMiddlewares,
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

  api.registerMethod({
    name: 'restartServer',
    fn() {
      console.log(chalk.gray(`Try to restart dev server...`));
      for (const unwatch of unwatchs) {
        unwatch();
      }
      server.listeningApp.close();
      process.send?.({ type: 'RESTART' });
    },
  });
};
