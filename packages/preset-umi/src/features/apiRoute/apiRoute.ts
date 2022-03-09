import { IRoute } from '@umijs/core';
import { logger } from '@umijs/utils';
import fs from 'fs';
import { basename, join, resolve } from 'path';
import { matchRoutes } from 'react-router';
import { TEMPLATES_DIR } from '../../constants';
import type { IApi, IApiMiddleware } from '../../types';
import DevServerAdapterBuild from './dev-server/esbuild';
import VercelAdapterBuild from './vercel/esbuild';
import { watch } from '../../commands/dev/watch';

enum ServerlessPlatform {
  Vercel = 'vercel',
  Netlify = 'netlify',
  Worker = 'worker',
}

function getPlatform(p: string) {
  switch (p) {
    case 'vercel':
      return ServerlessPlatform.Vercel;
    case 'netlify':
      return ServerlessPlatform.Netlify;
    case 'worker':
      return ServerlessPlatform.Worker;
    default:
      return undefined;
  }
}

export default (api: IApi) => {
  let platform: ServerlessPlatform | undefined;

  // 注册 API 路由相关配置项
  api.describe({
    key: 'apiRoute',
    config: {
      schema(Joi) {
        return Joi.object({
          platform: Joi.string(),
        });
      },
    },
    enableBy: () => {
      const hasApiRoutes = fs.existsSync(join(api.paths.absSrcPath, 'api'));
      if (!hasApiRoutes) return false;

      const config = api.userConfig.apiRoute;
      if (!config) {
        logger.warn(
          'Directory ./src/api exists, but config.apiRoute is not set. API route feature will not be enabled!',
        );
        return false;
      }
      if (!config.platform) {
        logger.warn(
          'Please set config.apiRoute.platform to enable API route feature!',
        );
        return false;
      }

      platform = getPlatform(config.platform);
      if (!platform) {
        logger.warn(
          'There is an invalid value of config.apiRoute.platform: ' +
            config.platform +
            ', so API route feature will not be enabled!',
        );
        return false;
      }

      if (platform !== ServerlessPlatform.Vercel) {
        logger.warn(
          'Current version of Umi only supports deploying API routes to Vercel, so API route feature will not be enabled!',
        );
        return false;
      }

      return true;
    },
  });

  // 生成中间产物时，将 API 路由与插件注册的中间件封装到临时文件目录下
  api.onGenerateFiles(async () => {
    // @TODO: 根据 platform 的值执行不同 Adapter 的流程

    const apiRoutes: IRoute[] = Object.keys(api.appData.apiRoutes).map(
      (k) => api.appData.apiRoutes[k],
    );

    apiRoutes.map((apiRoute) => {
      api.writeTmpFile({
        noPluginDir: true,
        path: join('api', apiRoute.file),
        tplPath: join(TEMPLATES_DIR, 'apiRoute.tpl'),
        context: {
          adapterPath: resolve(__dirname, '../apiRoute/index.js'),
          apiRootDirPath: join(api.paths.absTmpPath, 'api'),
          handlerPath: join(api.paths.absSrcPath, 'api', apiRoute.file),
        },
      });
    });

    const middlewares: IApiMiddleware[] = await api.applyPlugins({
      key: 'addApiMiddlewares',
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'api/_middlewares.ts',
      tplPath: join(TEMPLATES_DIR, 'middlewares.tpl'),
      context: { middlewares },
    });
  });

  // 开发阶段，透过中间件拦截对 API 路由的请求，在这里直接进行处理
  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      if (req.path.startsWith('/api')) {
        const path = req.path.replace('/api', '');

        const apiRoutes: IRoute[] = Object.keys(api.appData.apiRoutes).map(
          (k) => api.appData.apiRoutes[k],
        );

        const matches = matchRoutes(
          apiRoutes.map((r) => ({ path: r.path })),
          path,
        );

        if (!matches || matches?.length === 0) {
          logger.warn(`404 - ${req.path}`);
          next();
          return;
        }

        const matchedApiRoute = apiRoutes.find(
          (r) =>
            r.path === matches[0].pathname ||
            r.path + '/' === matches[0].pathname ||
            '/' + r.path === matches[0].pathname ||
            '/' + r.path + '/' === matches[0].pathname,
        );

        if (!matchedApiRoute) {
          logger.warn(`404 - ${req.path}`);
          next();
          return;
        }

        await require(join(
          api.paths.cwd,
          '.output/server/pages/api',
          matchedApiRoute.file,
        ).replace('.ts', '.js')).default(req, res);

        return;
      }

      next();
    },
  ]);

  api.addTmpGenerateWatcherPaths(() => [api.paths.absApiRoutesPath]);

  // 编译时，将打包好的临时文件根据用户指定的目标平台进行打包
  api.onBeforeCompiler(async () => {
    // 当有新的 API 路由或是原有的路由被删除时，必须重启服务，因为 appData 内的 apiRoutes 没有更新
    watch({
      path: join(api.paths.absApiRoutesPath),
      addToUnWatches: true,
      onChange(e, p) {
        if (e === 'add') {
          logger.event(`New API route ${basename(p)} detected, compiling ...`);
          api.restartServer();
          return;
        }
        if (e === 'unlink') {
          logger.event(
            `API route ${basename(p)} has been removed, compiling ...`,
          );
          api.restartServer();
          return;
        }
      },
    });

    const apiRoutePaths = Object.keys(api.appData.apiRoutes).map((key) =>
      join(api.paths.absTmpPath, 'api', api.appData.apiRoutes[key].file),
    );

    if (api.env === 'development') {
      await DevServerAdapterBuild(api, apiRoutePaths);
      return;
    }

    if (fs.existsSync(join(api.paths.cwd, '.output/server/pages/api'))) {
      await fs.rmdirSync(join(api.paths.cwd, '.output/server/pages/api'), {
        recursive: true,
      });
    }

    switch (platform) {
      case ServerlessPlatform.Vercel:
        await VercelAdapterBuild(api, apiRoutePaths);
        return;
      case ServerlessPlatform.Netlify:
        logger.error('API routes bundle failed: Netlify is not supported yet!');
        return;
      case ServerlessPlatform.Worker:
        logger.error(
          'API routes bundle failed: Cloudflare Worker is not supported yet!',
        );
        return;
      default:
        throw new Error(
          `API routes bundle failed: Unsupported platform: ${platform}`,
        );
    }
  });
};
