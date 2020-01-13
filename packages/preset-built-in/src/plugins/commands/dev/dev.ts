import { IApi } from '@umijs/types';
import { Server } from '@umijs/server';
import getBundleAndConfigs from '../getBundleAndConfigs';
import createRouteMiddleware from './createRouteMiddleware';

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
      await api.applyPlugins({
        key: 'onGenerateFiles',
        type: api.ApplyPluginsType.event,
      });

      // dev
      const { bundler, bundleConfigs } = await getBundleAndConfigs({ api });
      const server = new Server({
        compilerMiddleware: bundler.getMiddleware({
          bundleConfigs,
        }),
        beforeMiddlewares: [],
        afterMiddlewares: [createRouteMiddleware({ api })],
        onListening: () => {
          console.log('dev server started');
        },
      });
      const httpServer = await server.listen({
        port: 8000,
        hostname: '0.0.0.0',
      });
      return httpServer;
    },
  });
};
