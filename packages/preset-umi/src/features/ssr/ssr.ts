import type { Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import { EnableBy } from '@umijs/core/dist/types';
import { fsExtra, logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from '../../types';
import { build } from './builder/builder';
import { absServerBuildPath } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema(Joi) {
        return Joi.object({
          serverBuildPath: Joi.string(),
          platform: Joi.string(),
        });
      },
    },
    enableBy: EnableBy.config,
  });

  api.onCheck(() => {
    const reactVersion =
      parseInt(api.appData.react.version.split('.')[0], 10) || 0;
    if (reactVersion < 18) {
      throw new Error(
        `SSR requires React version >= 18.0.0, but got ${reactVersion}.`,
      );
    }
  });

  api.onStart(() => {
    logger.warn(`SSR feature is in beta, may be unstable`);
  });

  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      const modulePath = absServerBuildPath(api);
      if (existsSync(modulePath)) {
        (await require(modulePath)).default(req, res, next);
      } else {
        // TODO: IMPROVEMENT: use Umi Animation
        res.end('umi.server.js is compiling ...');
      }
    },
  ]);

  api.onGenerateFiles(() => {
    // react-shim.js is for esbuild to build umi.server.js
    api.writeTmpFile({
      noPluginDir: true,
      path: 'ssr/react-shim.js',
      content: `
      import * as React from 'react';
export { React };
`,
    });
  });

  api.onStart(async () => {
    await build({
      api,
      watch: api.env === 'development',
    });
  });

  // 在 webpack 完成打包以后，使用 esbuild 编译 umi.server.js
  api.onBuildComplete(async ({ err }) => {
    if (err) return;
    if (api.config.ssr.platform === 'vercel') {
      // update vercel.json
      const jsonFile = join(api.cwd, 'vercel.json');
      const json = existsSync(jsonFile) ? fsExtra.readJSONSync(jsonFile) : {};
      json.routes = (json.routes || []).filter((route: any) => {
        return !['/', '/__serverLoader'].includes(route.src);
      });
      json.routes.push({ src: '/', dest: '/api/umi.server' });
      json.routes.push({ src: '/__serverLoader', dest: '/api/umi.server' });
      writeFileSync(jsonFile, JSON.stringify(json, null, 2));
      logger.info(`[SSR] vercel.json updated`);

      // write api/umi.server.js
      writeFileSync(
        join(api.cwd, 'api/umi.server.js'),
        `
export default function handler(request, response) {
  require('../server/umi.server.js').default(request, response);
}
      `.trimStart(),
        'utf-8',
      );
      logger.info(`[SSR] write api/umi.server.js`);
    }
  });

  const pluginName = 'ProcessAssetsPlugin';
  class ProcessAssetsPlugin {
    apply(compiler: Compiler) {
      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.afterProcessAssets.tap(pluginName, () => {
          const modulePath = absServerBuildPath(api);
          delete require.cache[modulePath];
        });
      });
    }
  }

  api.modifyWebpackConfig((config) => {
    config.plugins!.push(new ProcessAssetsPlugin());

    // Limit the number of css chunks to 1.
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        cacheGroups: {
          styles: {
            // TODO: no umi specified
            name: 'umi',
            test: /\.(less|css|scss|sass)$/,
            chunks: 'all',
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };
    return config;
  });
};
