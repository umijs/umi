import { IApi, IConfig } from '@umijs/types';
import { IServerOpts, Server } from '@umijs/server';
import { delay } from '@umijs/utils';
import assert from 'assert';
import { cleanTmpPathExceptCache, getBundleAndConfigs } from '../buildDevUtils';
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

  function destroy() {
    for (const unwatch of unwatchs) {
      unwatch();
    }
    server?.listeningApp?.close();
  }

  api.registerCommand({
    name: 'dev',
    fn: async function() {
      const defaultPort = api.config.devServer?.port || process.env.PORT;
      port = await portfinder.getPortPromise({
        port: defaultPort ? parseInt(String(defaultPort), 10) : 8000,
      });
      console.log(chalk.cyan('Starting the development server...'));
      process.send?.({ type: 'UPDATE_PORT', port });

      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });
      const watch = process.env.WATCH !== 'none';

      // generate files
      const unwatchGenerateFiles = await generateFiles({ api, watch });
      if (unwatchGenerateFiles) unwatchs.push(unwatchGenerateFiles);

      // watch config change
      if (watch) {
        const unwatchConfig = api.service.configInstance.watch({
          userConfig: api.service.userConfig,
          onChange: async ({ pluginChanged, userConfig, valueChanged }) => {
            if (pluginChanged.length) {
              api.restartServer();
            }
            if (valueChanged.length) {
              let reload = false;
              let regenerateTmpFiles = false;
              const fns: Function[] = [];
              valueChanged.forEach(({ key, pluginId }) => {
                const { onChange } = api.service.plugins[pluginId].config || {};
                if (onChange === api.ConfigChangeType.regenerateTmpFiles) {
                  regenerateTmpFiles = true;
                }
                if (!onChange || onChange === api.ConfigChangeType.reload) {
                  reload = true;
                }
                if (typeof onChange === 'function') {
                  fns.push(onChange);
                }
              });

              if (reload) {
                api.restartServer();
              } else {
                api.service.config = api.service.configInstance.getConfig();
                if (regenerateTmpFiles) {
                  console.log('regenerate tmp files');
                  await generateFiles({ api });
                } else {
                  fns.forEach(fn => fn());
                }
              }
            }
          },
        });
        unwatchs.push(unwatchConfig);
      }

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
        compress: true,
        headers: {
          'access-control-allow-origin': '*',
        },
        // @ts-ignore
        proxy: (api.config as IConfig)?.proxy,
        beforeMiddlewares,
        afterMiddlewares: [createRouteMiddleware({ api })],
        ...(api.config.devServer || {}),
      });
      const hostname =
        api.config.devServer?.host || process.env.HOST || '0.0.0.0';
      const listenRet = await server.listen({
        port,
        hostname,
      });
      return {
        ...listenRet,
        destroy,
      };
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
      destroy();
      process.send?.({ type: 'RESTART' });
    },
  });
};
