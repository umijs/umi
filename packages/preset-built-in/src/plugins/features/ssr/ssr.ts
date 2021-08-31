import { webpack } from '@umijs/bundler-webpack';
import { Route } from '@umijs/core';
import serialize from '@umijs/deps/compiled/serialize-javascript';
// @ts-ignore
import { getCompilerHooks } from '@umijs/deps/compiled/webpack-manifest-plugin';
import { BundlerConfigType, IApi } from '@umijs/types';
import {
  cleanRequireCache,
  lodash as _,
  Mustache,
  routeToChunkName,
  winPath,
} from '@umijs/utils';
import assert from 'assert';
import fs from 'fs';
import { EOL } from 'os';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { matchRoutes, RouteConfig } from 'react-router-config';
import { getHtmlGenerator } from '../../commands/htmlUtils';
import {
  CHUNK_MANIFEST,
  CHUNK_NAME,
  CLIENT_EXPORTS,
  OUTPUT_SERVER_FILENAME,
  OUTPUT_SERVER_TYPE_FILENAME,
  TMP_PLUGIN_DIR,
} from './constants';
import ServerTypePlugin from './serverTypePlugin';

class ManifestChunksMapPlugin {
  constructor(public opts: { api: IApi }) {
    this.opts = opts;
  }

  apply(compiler: webpack.Compiler) {
    let chunkGroups: any;
    const { beforeEmit } = getCompilerHooks(compiler);

    compiler.hooks.emit.tapPromise(
      'ManifestChunksMapPlugin',
      async (compilation: any) => {
        chunkGroups = compilation.chunkGroups;
      },
    );

    beforeEmit.tap('ManifestChunksMapPlugin', (manifest: object) => {
      if (chunkGroups) {
        const fileFilter = (file: string) =>
          !file.endsWith('.map') && !file.endsWith('.hot-update.js');
        const addPath = (file: string) =>
          `${this.opts.api.config.publicPath}${file}`;
        try {
          const _chunksMap = chunkGroups.reduce((acc: any[], c: any) => {
            acc[c.name] = [
              ...(acc[c.name] || []),
              ...c.chunks.reduce(
                (files: any[], cc: any) => [
                  ...files,
                  ...cc.files.filter(fileFilter).map(addPath),
                ],
                [],
              ),
            ];
            return acc;
          }, {});
          return {
            // IMPORTANT: hard code for `_chunkMap` field
            _chunksMap,
            ...manifest,
          };
        } catch (e) {
          this.opts.api.logger.error('[SSR chunkMap ERROR]', e);
        }
      }
      return manifest;
    });
  }
}

/**
 * export `onBuildComplete` just for the unit case
 * replace default html placeholder with the latest html (hash)
 * @param api
 */
export const onBuildComplete =
  (api: IApi) =>
  async ({ err, stats }: any) => {
    if (!err && stats?.stats) {
      // get content between `<html>*</html>` .*? 匹配换行符会有系统差异
      const HTML_REG = /<html>[\s\S]*?<\/html>/m;
      const [clientStats] = stats.stats;
      const htmlGenerator = getHtmlGenerator({ api });
      const latestHTML = await htmlGenerator.getContent({
        route: { path: api.config.publicPath },
        chunks: clientStats.compilation.chunks,
      });
      const [htmlContent] = latestHTML.match(HTML_REG) || [];
      const serverPath = path.join(
        api.paths.absOutputPath!,
        OUTPUT_SERVER_FILENAME,
      );

      // replace `umi.server.js` default html into latest serialize html
      if (fs.existsSync(serverPath) && latestHTML) {
        const serverContent = (
          await fs.promises.readFile(serverPath, 'utf-8')
        ).replace(HTML_REG, serialize(htmlContent));
        await fs.promises.writeFile(serverPath, serverContent);
      }
    }
    return undefined;
  };

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema: (joi) => {
        return joi
          .object({
            forceInitial: joi
              .boolean()
              .description('force execing Page getInitialProps functions'),
            removeWindowInitialProps: joi
              .boolean()
              .description('remove window.g_initialProps in html'),
            devServerRender: joi
              .boolean()
              .description('disable serve-side render in umi dev mode.'),
            mode: joi.string().valid('stream', 'string'),
            staticMarkup: joi
              .boolean()
              .description('static markup in static site'),
          })
          .without('forceInitial', ['removeWindowInitialProps'])
          .error(
            new Error(
              'The `removeWindowInitialProps` cannot be enabled when `forceInitial` has been enabled at the same time.',
            ),
          );
      },
    },
    // 配置开启
    enableBy: () =>
      // TODO: api.EnableBy.config 读取的 userConfig，modifyDefaultConfig hook 修改后对这个判断不起效
      'ssr' in api.userConfig ? api.userConfig.ssr : api.config?.ssr,
  });

  api.onStart(() => {
    assert(
      // @ts-ignore
      api.config.history?.type !== 'hash',
      'the `type` of `history` must be `browser` when using SSR',
    );
    if (api.config.dynamicImport && api.config.ssr) {
      api.logger.warn(
        'The manifest file will be generated if enabling `dynamicImport` in ssr.',
      );
    }
    // ref: https://github.com/umijs/umi/issues/5501
    if (!process.env.WATCH_IGNORED) {
      const { outputPath } = api.config;
      const absOutputPath = winPath(
        path.join(api.cwd, outputPath as string, '/'),
      );
      process.env.WATCH_IGNORED = `(node_modules|${absOutputPath}(?!${OUTPUT_SERVER_FILENAME}))`;
    }
  });

  // 再加一个 webpack instance
  api.modifyBundleConfigs(async (memo, { getConfig }) => {
    return [...memo, await getConfig({ type: BundlerConfigType.ssr })];
  });

  api.onGenerateFiles(async () => {
    const serverTpl = path.join(winPath(__dirname), 'templates/server.tpl');
    const serverContent = await fs.promises.readFile(serverTpl, 'utf-8');
    const html = getHtmlGenerator({ api });

    const defaultHTML = await html.getContent({
      route: { path: api.config.publicPath },
      noChunk: true,
    });

    const routes = await api.getRoutes();

    api.writeTmpFile({
      path: 'core/server.ts',
      content: Mustache.render(serverContent, {
        Env: api.env,
        Routes: new Route().getJSON({
          routes,
          config: api.config,
          cwd: api.cwd,
          isServer: true,
        }),
        RuntimePath: winPath(
          path.dirname(require.resolve('@umijs/runtime/package.json')),
        ),
        Renderer: winPath(
          require.resolve('./templates/renderServer/renderServer'),
        ),
        RuntimePolyfill: winPath(
          require.resolve('regenerator-runtime/runtime'),
        ),
        loadingComponent:
          // @ts-ignore
          api.config.dynamicImport?.loading &&
          // @ts-ignore
          winPath(api.config.dynamicImport?.loading),
        DynamicImport: !!api.config.dynamicImport,
        Utils: winPath(require.resolve('./templates/utils')),
        // @ts-ignore
        Mode: api.config.ssr?.mode ?? 'string',
        MountElementId: api.config.mountElementId,
        // @ts-ignore
        StaticMarkup: !!api.config.ssr?.staticMarkup,
        // @ts-ignore
        ForceInitial: !!api.config.ssr?.forceInitial,
        // @ts-ignore
        RemoveWindowInitialProps: !!api.config.ssr?.removeWindowInitialProps,
        Basename: api.config.base,
        PublicPath: api.config.publicPath,
        ManifestFileName: api.config.manifest
          ? api.config.manifest.fileName || CHUNK_MANIFEST
          : '',
        DEFAULT_HTML_PLACEHOLDER: serialize(defaultHTML),
      }),
    });

    const clientExportsContent = await fs.promises.readFile(
      path.join(winPath(__dirname), `templates/${CLIENT_EXPORTS}.tpl`),
      'utf-8',
    );
    api.writeTmpFile({
      path: `${TMP_PLUGIN_DIR}/${CLIENT_EXPORTS}.ts`,
      content: Mustache.render(clientExportsContent, {
        SSRUtils: winPath(require.resolve('@umijs/utils/lib/ssr')),
      }),
    });
  });

  // run for dynamicImport in exportStatic
  api.modifyHTMLChunks(async (memo, opts) => {
    const { route } = opts;
    // remove server bundle entry in html
    // for dynamicImport
    if (
      api.config.dynamicImport &&
      api.env === 'production' &&
      opts.chunks &&
      route.path &&
      route.component
    ) {
      // different pages using correct chunks, not load all chunks
      const chunkArr: string[] = [];
      const routes = await api.getRoutes();
      const matchedRoutes = matchRoutes(routes as RouteConfig[], route.path);
      const chunks = _.uniq(
        matchedRoutes.map((matchedRoute) =>
          matchedRoute.route.component
            ? routeToChunkName({ route: matchedRoute.route, cwd: api.cwd })
            : null,
        ),
      );
      chunks.forEach((chunk) => {
        if (chunk && opts.chunks.find((c) => c.name.startsWith(chunk))) {
          chunkArr.push(chunk);
        }
      });
      return _.uniq([...memo, ...chunkArr]);
    }
    return memo;
  });

  api.modifyConfig((config) => {
    // force enable writeToDisk
    // @ts-ignore
    config.devServer.writeToDisk = (filePath: string) => {
      const regexp = new RegExp(
        `(${OUTPUT_SERVER_FILENAME}|${OUTPUT_SERVER_TYPE_FILENAME})$`,
      );
      return regexp.test(filePath);
    };
    // enable manifest
    if (config.dynamicImport) {
      config.manifest = {
        writeToFileEmit: true,
        ...(config.manifest || {}),
      };
    }
    return config;
  });

  // make sure to clear umi.server.js cache
  api.onDevCompileDone(() => {
    const serverExp = new RegExp(_.escapeRegExp(OUTPUT_SERVER_FILENAME));
    // clear require cache
    for (const moduleId of Object.keys(require.cache)) {
      if (serverExp.test(moduleId)) {
        cleanRequireCache(moduleId);
      }
    }
  });

  // modify devServer content
  api.modifyDevHTMLContent(async (defaultHtml, { req }) => {
    // umi dev to enable server side render by default
    const { mode, devServerRender = true } = api.config?.ssr || {};
    const serverPath = path.join(
      api.paths.absOutputPath!,
      OUTPUT_SERVER_FILENAME,
    );

    if (!devServerRender) {
      return defaultHtml;
    }

    try {
      const startTime = performance.nodeTiming.duration;
      let render = require(serverPath);
      const context = {};
      const { html, error } = await render({
        origin: `${req.protocol}://${req.get('host')}`,
        // with query
        path: req.url,
        context,
        htmlTemplate: defaultHtml,
        mountElementId: api.config?.mountElementId,
      });
      const endTime = performance.nodeTiming.duration;
      console.log(
        `[SSR] ${mode === 'stream' ? 'stream' : ''} render ${req.url} start: ${(
          endTime - startTime
        ).toFixed(2)}ms`,
      );
      if (error) {
        throw error;
      }
      render = null;
      return html;
    } catch (e) {
      api.logger.error('[SSR]', e);
    }
    return defaultHtml;
  });

  // 修改
  api.chainWebpack(async (config, opts) => {
    const { paths } = api;
    const { type } = opts;
    const serverEntryPath = path.join(paths.absTmpPath!, 'core/server.ts');

    if (type === BundlerConfigType.ssr) {
      config.entryPoints.clear();
      config.entry(CHUNK_NAME).add(serverEntryPath);
      config.target('node');
      config.name(CHUNK_NAME);
      config.devtool(false);

      config.output
        .filename(OUTPUT_SERVER_FILENAME)
        // avoid using `require().default`, just using `require()`
        .libraryExport('default')
        .chunkFilename('[name].server.js')
        .libraryTarget('commonjs2');

      // disable *.server.chunk.js, routes avoid dynamic and require in different mode.
      config.plugin('limit-chunk').use(webpack.optimize.LimitChunkCountPlugin, [
        {
          maxChunks: 1,
        },
      ]);
      config.plugin('generate-server-type').use(ServerTypePlugin, [
        [
          {
            name: OUTPUT_SERVER_TYPE_FILENAME,
            content: `import { IServerRender } from 'umi';${EOL}export = render;${EOL}export as namespace render;${EOL}declare const render: IServerRender;`,
          },
        ],
      ]);
      config.plugin('define').tap(([args]) => [
        {
          ...args,
          'window.routerBase': JSON.stringify(api.config.base),
          'process.env.__IS_SERVER': true,
        },
      ]);

      config.externals([]);
    } else {
      config
        .plugin('ManifestChunksMap')
        .use(ManifestChunksMapPlugin, [{ api }]);
      // define client bundler config
      config.plugin('define').tap(([args]) => [
        {
          ...args,
          'process.env.__IS_SERVER': false,
        },
      ]);
    }
    return config;
  });

  // runtime ssr plugin
  api.addRuntimePluginKey(() => 'ssr');

  api.addUmiExports(() => [
    {
      exportAll: true,
      source: `../${TMP_PLUGIN_DIR}/${CLIENT_EXPORTS}`,
    },
  ]);

  // replace html default html template
  // fixed: hash: true, defaultHTML not update
  api.onBuildComplete(onBuildComplete(api));
};
