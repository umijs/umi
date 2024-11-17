import type {
  Compilation,
  Compiler,
} from '@umijs/bundler-webpack/compiled/webpack';
import { EnableBy } from '@umijs/core/dist/types';
import { fsExtra, importLazy, logger, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import type { IApi } from '../../types';
import { isWindows } from '../../utils/platform';
import { absServerBuildPath, generateBuildManifest } from './utils';

export default (api: IApi) => {
  const esbuildBuilder: typeof import('./builder/builder') = importLazy(
    require.resolve('./builder/builder'),
  );
  const webpackBuilder: typeof import('./webpack/webpack') = importLazy(
    require.resolve('./webpack/webpack'),
  );
  const makoBuiler: typeof import('./mako/mako') = importLazy(
    require.resolve('./mako/mako'),
  );
  let serverBuildTarget: string;

  api.describe({
    key: 'ssr',
    config: {
      schema({ zod }) {
        return zod
          .object({
            serverBuildPath: zod.string(),
            serverBuildTarget: zod.enum(['express', 'worker']),
            platform: zod.string(),
            builder: zod.enum(['esbuild', 'webpack', 'mako']),
            __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: zod.object({
              pureApp: zod.boolean(),
              pureHtml: zod.boolean(),
            }),
            useStream: zod.boolean().default(true),
          })
          .deepPartial();
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

  api.modifyDefaultConfig((memo) => {
    if (serverBuildTarget === 'worker') {
      const oReactDom = memo.alias['react-dom'];

      // put react-dom after react-dom/server
      delete memo.alias['react-dom'];

      // use browser version of react-dom/server for worker mode
      // ref: https://github.com/facebook/react/blob/f86afca090b668d8be10b642750844759768d1ad/packages/react-server-dom-webpack/package.json#L52
      memo.alias['react-dom/server$'] = winPath(
        join(
          api.service.configDefaults.alias['react-dom'],
          'server.browser.js',
        ),
      );
      memo.alias['react-dom'] = oReactDom;
    }

    return memo;
  });

  api.modifyConfig((memo) => {
    // define SSR_BUILD_TARGET to strip useless logic
    memo.define ??= {};
    serverBuildTarget = memo.define['process.env.SSR_BUILD_TARGET'] =
      memo.ssr.serverBuildTarget || 'express';

    // csr && ssr must use the same mako bundler
    // mako builder need config manifest
    if (memo.ssr.builder === 'mako') {
      assert(
        memo.mako,
        `The \`ssr.builder mako\` config is now allowed when \`mako\` is enable!`,
      );
      memo.manifest ??= {};
      if (isWindows) {
        memo.ssr.builder = 'webpack';
      }
    }

    return memo;
  });

  api.addMiddlewares(() => [
    async (req, res, next) => {
      if (serverBuildTarget === 'worker') {
        return next();
      }

      const modulePath = absServerBuildPath(api);
      if (existsSync(modulePath)) {
        delete require.cache[modulePath];
        (await require(modulePath)).default(req, res, next);
      } else {
        // TODO: IMPROVEMENT: use Umi Animation
        res.end('umi.server.js is compiling ...');
      }
    },
  ]);

  const serverPackagePath = dirname(
    require.resolve('@umijs/server/package.json'),
  );
  const ssrTypesPath = join(serverPackagePath, './dist/types');

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

    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/serverInsertedHTMLContext.ts',
      content: `
// Use React.createContext to avoid errors from the RSC checks because
// it can't be imported directly in Server Components:
import React from 'react'

export type ServerInsertedHTMLHook = (callbacks: () => React.ReactNode) => void;
// More info: https://github.com/vercel/next.js/pull/40686
export const ServerInsertedHTMLContext =
  React.createContext<ServerInsertedHTMLHook | null>(null as any);

// copy form https://github.com/vercel/next.js/blob/fa076a3a69c9ccf63c9d1e53e7b681aa6dc23db7/packages/next/src/shared/lib/server-inserted-html.tsx#L13
export function useServerInsertedHTML(callback: () => React.ReactNode): void {
  const addInsertedServerHTMLCallback = React.useContext(ServerInsertedHTMLContext);
  // Should have no effects on client where there's no flush effects provider
  if (addInsertedServerHTMLCallback) {
    addInsertedServerHTMLCallback(callback);
  }
}
`,
    });

    // types
    api.writeTmpFile({
      path: 'types.d.ts',
      content: `
export type {
  // server loader
  IServerLoaderArgs,
  UmiRequest,
  ServerLoader,
  // metadata loader
  MetadataLoader,
  IMetadata,
  IMetaTag,
} from '${winPath(ssrTypesPath)}'
`,
    });
  });

  api.onBeforeCompiler(async ({ opts }) => {
    const { builder = 'webpack' } = api.config.ssr;

    if (builder === 'esbuild') {
      await esbuildBuilder.build({
        api,
        watch: api.env === 'development',
      });
    } else if (builder === 'webpack') {
      assert(
        !api.config.vite,
        `The \`vite\` config is now allowed when \`ssr.builder\` is webpack!`,
      );

      await webpackBuilder.build(api, opts);
    } else if (api.config.mako && builder === 'mako') {
      await makoBuiler.build(api);
    }
  });
  api.onDevCompileDone(() => {
    if (api.config.mako) {
      generateBuildManifest(api);
    }
  });

  api.onBuildComplete(() => {
    if (api.config.mako) {
      generateBuildManifest(api);
    }
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
const manifest = require('../server/build-manifest.json');
export default function handler(request, response) {
    require(manifest.assets["umi.js"]).default(request, response);
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
      compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
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
