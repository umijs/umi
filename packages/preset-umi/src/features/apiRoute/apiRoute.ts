import { IRoute } from '@umijs/core';
import { logger, winPath } from '@umijs/utils';
import fs from 'fs';
import { basename, join, resolve } from 'path';
import { watch } from '../../commands/dev/watch';
import { TEMPLATES_DIR } from '../../constants';
import type { IApi, IApiMiddleware } from '../../types';
import { OUTPUT_PATH } from './constants';
import DevServerAdapterBuild from './dev-server/esbuild';
import { matchApiRoute } from './utils';
import VercelAdapterBuild from './vercel/esbuild';

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
      schema({ zod }) {
        return zod
          .object({
            platform: zod.string(),
          })
          .deepPartial();
      },
    },
    enableBy: () => {
      const hasApiRoutes = fs.existsSync(join(api.paths.absSrcPath, 'api'));
      if (!hasApiRoutes) return false;

      const config = api.userConfig.apiRoute;
      if (!config) {
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

      // 如果是 Vercel 平台，则需要检查是否有配置了 Vercel 配置
      if (!fs.existsSync(join(api.paths.cwd, 'vercel.json'))) {
        logger.warn(
          'You have enabled the API route feature, but there is no vercel.json file in your work directory! ' +
            'Automatically creating a vercel.json file ...',
        );
        fs.writeFileSync(
          join(api.paths.cwd, 'vercel.json'),
          JSON.stringify(
            { build: { env: { ENABLE_FILE_SYSTEM_API: '1' } } },
            null,
            2,
          ),
        );
      }

      return true;
    },
  });

  api.onStart(() => {
    logger.warn(`ApiRoute feature is in beta, may be unstable`);
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
          adapterPath: winPath(resolve(__dirname, '../apiRoute/index.js')),
          apiRootDirPath: winPath(join(api.paths.absTmpPath, 'api')),
          handlerPath: winPath(
            join(api.paths.absSrcPath, 'api', apiRoute.file),
          ),
          apiRoutes: JSON.stringify(apiRoutes),
        },
      });
    });

    const middlewares: IApiMiddleware[] = await api.applyPlugins({
      key: 'addApiMiddlewares',
    });

    middlewares.forEach((middleware) => {
      middleware.path = winPath(middleware.path);
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

        const matchedApiRoute = matchApiRoute(apiRoutes, path);

        if (!matchedApiRoute) {
          logger.warn(`404 - ${req.path}`);
          next();
          return;
        }

        await require(join(
          api.paths.cwd,
          OUTPUT_PATH,
          matchedApiRoute.route.file,
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
    if (api.env === 'development') {
      watch({
        path: join(api.paths.absApiRoutesPath),
        addToUnWatches: true,
        onChange(e, p) {
          if (e === 'add') {
            logger.event(
              `New API route ${basename(p)} detected, compiling ...`,
            );
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
    }

    const apiRoutes: IRoute[] = Object.keys(api.appData.apiRoutes).map(
      (k) => api.appData.apiRoutes[k],
    );

    if (api.env === 'development') {
      await DevServerAdapterBuild(api, apiRoutes);
      return;
    }

    if (fs.existsSync(join(api.paths.cwd, OUTPUT_PATH))) {
      await fs.rmdirSync(join(api.paths.cwd, OUTPUT_PATH), {
        recursive: true,
      });
    }

    switch (platform) {
      case ServerlessPlatform.Vercel:
        await VercelAdapterBuild(api, apiRoutes);
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
