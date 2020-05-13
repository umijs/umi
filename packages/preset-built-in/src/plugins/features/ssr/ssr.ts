import * as fs from 'fs';
import assert from 'assert';
import * as path from 'path';
import { IApi, BundlerConfigType } from '@umijs/types';
import { winPath, Mustache, lodash } from '@umijs/utils';
import { getHtmlGenerator } from '../../commands/htmlUtils';
import {
  CHUNK_NAME,
  OUTPUT_SERVER_FILENAME,
  TMP_PLUGIN_DIR,
  CLIENT_EXPORTS,
} from './constants';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema: (joi) => {
        return joi.object({
          forceInitial: joi
            .boolean()
            .description(
              'remove window.g_initialProps in html, to force execing Page getInitialProps  functions',
            ),
          devServerRender: joi
            .boolean()
            .description('disable serve-side render in umi dev mode.'),
          mode: joi.string().valid('stream', 'string'),
          staticMarkup: joi
            .boolean()
            .description('static markup in static site'),
        });
      },
    },
    // 配置开启
    enableBy: api.EnableBy.config,
  });

  api.onStart(() => {
    assert(
      api.config.history?.type !== 'hash',
      'the `type` of `history` must be `browser` when using SSR',
    );
  });

  // 再加一个 webpack instance
  api.modifyBundleConfigs(async (memo, { getConfig }) => {
    return [...memo, await getConfig({ type: BundlerConfigType.ssr })];
  });

  api.onGenerateFiles(async () => {
    const serverTpl = path.join(winPath(__dirname), 'templates/server.tpl');
    const serverContent = fs.readFileSync(serverTpl, 'utf-8');
    const html = getHtmlGenerator({ api });

    const defaultHTML = await html.getContent({
      route: { path: '/' },
      noChunk: true,
    });

    api.writeTmpFile({
      path: 'core/server.ts',
      content: Mustache.render(serverContent, {
        Env: api.env,
        RuntimePath: winPath(
          path.dirname(require.resolve('@umijs/runtime/package.json')),
        ),
        Renderer: winPath(
          require.resolve('./templates/renderServer/renderServer'),
        ),
        RuntimePolyfill: winPath(
          require.resolve('regenerator-runtime/runtime'),
        ),
        Utils: winPath(require.resolve('./templates/utils')),
        Mode: !!api.config.ssr?.mode || 'string',
        MountElementId: api.config.mountElementId,
        StaticMarkup: !!api.config.ssr?.staticMarkup,
        // @ts-ignore
        ForceInitial: !!api.config.ssr?.forceInitial,
        Basename: api.config.base,
        DEFAULT_HTML_PLACEHOLDER: JSON.stringify(defaultHTML),
      }),
    });

    const clientExportsContent = fs.readFileSync(
      path.join(winPath(__dirname), `templates/${CLIENT_EXPORTS}.tpl`),
      'utf-8',
    );
    api.writeTmpFile({
      path: `${TMP_PLUGIN_DIR}/${CLIENT_EXPORTS}.ts`,
      content: clientExportsContent,
    });
  });

  api.modifyHTMLChunks(async (memo, opts) => {
    // remove server bundle entry in html
    // for dynamicImport
    if (api.config.dynamicImport && opts.chunks) {
      // TODO: page bind opposite chunks, now will bind all chunks
      const chunks = opts.chunks.map((chunk) => {
        return chunk.name;
      });
      return lodash.uniq([...memo, ...chunks]);
    }
    return memo;
  });

  api.modifyConfig((config) => {
    // force enable writeToDisk
    config.devServer.writeToDisk = (filePath: string) => {
      return /(umi\.server\.js|\.server\.js)$/.test(filePath);
    };
    return config;
  });

  // modify devServer content
  api.modifyDevHTMLContent(async (defaultHtml, { req }) => {
    // umi dev to enable server side render by default
    const { stream, devServerRender = true } = api.config?.ssr || {};
    const serverPath = path.join(
      api.paths!.absOutputPath,
      OUTPUT_SERVER_FILENAME,
    );
    // if dev clear cache
    if (require.cache[serverPath]) {
      // replace default html
      delete require.cache[serverPath];
    }

    if (!devServerRender) {
      return defaultHtml;
    }

    try {
      console.time(`[SSR] ${stream ? 'stream' : ''} render ${req.url} start`);
      const render = require(serverPath);
      const context = {};
      const { html, error } = await render({
        // with query
        path: req.url,
        context,
        htmlTemplate: defaultHtml,
        mountElementId: api.config?.mountElementId,
      });
      console.timeEnd(
        `[SSR] ${stream ? 'stream' : ''} render ${req.url} start`,
      );
      if (error) {
        throw error;
      }
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
    const serverEntryPath = path.join(paths!.absTmpPath, 'core/server.ts');
    if (type === BundlerConfigType.ssr) {
      config.entryPoints.clear();
      config.entry(CHUNK_NAME).add(serverEntryPath);
      config.target('node');
      config.name(CHUNK_NAME);
      config.devtool(false);

      config.output
        .filename(OUTPUT_SERVER_FILENAME)
        .libraryExport('default')
        .chunkFilename('[name].server.js')
        .libraryTarget('commonjs2');

      config.plugin('define').tap(([args]) => [
        {
          ...args,
          'window.routerBase': JSON.stringify(api.config.base),
          'process.env.__IS_SERVER': true,
        },
      ]);

      config.externals([]);
    } else {
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
};
