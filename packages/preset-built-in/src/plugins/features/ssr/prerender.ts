import * as path from 'path';
import * as fs from 'fs';
import assert from 'assert';

import { IApi, utils } from 'umi';

import { fixHtmlSuffix, getDistContent, getStaticRoutePaths, isDynamicRoute, routeToFile } from './utils';

const { createDebug, signale, mkdirp, rimraf } = utils;

const debug = createDebug('umi:preset-built-in:prerender');

export default (api: IApi) => {
  api.describe({
    key: 'prerender',
    config: {
      schema: (joi) => {
        return joi.object({
          extraRoutes: joi.array().items(joi.string()).description('extra Routes for dynamic routes'),
        })
      }
    },
    // 配置开启
    enableBy: api.EnableBy.config,
  });

  if (api.userConfig.prerender) {
    assert(api.userConfig?.ssr && !api.userConfig?.ssr?.stream, 'Prerender need enable `ssr: {}` and disable ssr.stream');
  }

  api.modifyDefaultConfig((config) => {
    config.ssr = {
      ...config.ssr,
      staticMarkup: true,
    };
    return config;
  })

  api.onPatchRoute(({ route }) => {
    if (api.env === 'production') {
      route.path = fixHtmlSuffix(route);
    }
  });

  api.onBuildComplete(async ({ err }) => {
    const { absOutputPath } = api.paths;
    const { extraRoutes = [] } = api.config.prerender || {};
    if (!err) {
      const routes = await api.getRoutes();
      const routePaths = getStaticRoutePaths(routes);
      // get render paths
      const renderPaths = routePaths.concat(extraRoutes);

      debug(`renderPaths: ${renderPaths.join(',')}`);
      signale.start('Umi Prerender Start');

      const { serverFilePath, htmlFile } = getDistContent(absOutputPath || '');
      const render = require(serverFilePath);

       // loop routes
      for (const url of renderPaths) {
        let ssrHtml = htmlFile;

        // 动态路由走默认 default.html
        if (!isDynamicRoute(url)) {
          const { html } = await render({
            path: url,
          });
          ssrHtml = html;
        }

        const filename = routeToFile(url);
        try {
          // write html file
          const outputRoutePath = path.join(absOutputPath || '', filename);
          const dir = path.join(absOutputPath || '', filename.substring(0, filename.lastIndexOf('/')));
          mkdirp.sync(dir);
          fs.writeFileSync(outputRoutePath, ssrHtml);
          signale.complete(filename);
        } catch (e) {
          signale.fatal(`${url} render ${filename} failed`, e);
          throw e;
        }
      }
      // delete umi.server.js
      rimraf.sync(serverFilePath);
      signale.info('Remove umi.server.js sccuess!');
      signale.success('Umi prerender success!');
    }
  })
};
