import { IApi, IConfig } from '@umijs/types';
import { IServerOpts, Server } from '@umijs/server';
import getBundleAndConfigs from '../getBundleAndConfigs';
import createRouteMiddleware from './createRouteMiddleware';
import generateFiles from '../generateFiles';

export default (api: IApi) => {
  const {
    cwd,
    paths,
    utils: { rimraf, chalk },
  } = api;

  api.registerCommand({
    name: 'dev',
    fn: async function() {
      rimraf.sync(paths.absTmpPath!);

      // generate files
      await generateFiles({ api, watch: true });

      // dev
      const bundleConfig = await getBundleAndConfigs({ api });
      const { bundler, bundleConfigs } = bundleConfig;
      const opts: IServerOpts = bundler.setupDevServerOpts({
        bundleConfigs: bundleConfigs,
      });
      const server = new Server({
        ...opts,
        // @ts-ignore
        proxy: (api.config as IConfig)?.proxy,
        beforeMiddlewares: [],
        afterMiddlewares: [createRouteMiddleware({ api })],
      });
      return await server.listen({
        port: 8000,
        hostname: '0.0.0.0',
      });
    },
  });
};
