// sort-object-keys
import type { RequestHandler, webpack } from '@umijs/bundler-webpack';
import type WebpackChain from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { IConfig } from '@umijs/bundler-webpack/dist/types';
import type {
  IAdd,
  IEvent,
  IModify,
  IRoute as ICoreRoute,
  IServicePluginAPI,
  PluginAPI,
} from '@umijs/core';
import { Env } from '@umijs/core';
import type { CheerioAPI } from '@umijs/utils/compiled/cheerio';
import type { InlineConfig as ViteInlineConfig } from 'vite';

export { UmiApiRequest, UmiApiResponse } from './features/apiRoute';
export { webpack, IConfig };

export type IScript =
  | Partial<{
      async: boolean;
      charset: string;
      content: string;
      crossOrigin: string | null;
      defer: boolean;
      src: string;
      type: string;
    }>
  | string;
export type IStyle =
  | Partial<{
      content: string;
      type: string;
    }>
  | string;
export type ILink = Partial<{
  as: string;
  crossOrigin: string | null;
  disabled: boolean;
  href: string;
  hreflang: string;
  imageSizes: string;
  imageSrcset: string;
  integrity: string;
  media: string;
  referrerPolicy: string;
  rel: string;
  rev: string;
  target: string;
  type: string;
}>;
export type IMeta = Partial<{
  content: string;
  httpEquiv: string;
  name: string;
  scheme: string;
}>;
export type IApiMiddleware = {
  name: string;
  path: string;
};
export type IEntryImport = {
  source: string;
  specifier?: string;
};
export type IRoute = ICoreRoute;
export type IApi = PluginAPI &
  IServicePluginAPI & {
    addApiMiddlewares: IAdd<null, IApiMiddleware>;
    addBeforeBabelPlugins: IAdd<null, any>;
    addBeforeBabelPresets: IAdd<null, any>;
    addBeforeMiddlewares: IAdd<null, RequestHandler>;
    addEntryCode: IAdd<null, string>;
    addEntryCodeAhead: IAdd<null, string>;
    addEntryImports: IAdd<null, IEntryImport>;
    addEntryImportsAhead: IAdd<null, IEntryImport>;
    addExtraBabelPlugins: IAdd<null, any>;
    addExtraBabelPresets: IAdd<null, any>;
    addHTMLHeadScripts: IAdd<null, IScript>;
    addHTMLLinks: IAdd<null, ILink>;
    addHTMLMetas: IAdd<null, IMeta>;
    addHTMLScripts: IAdd<null, IScript>;
    addHTMLStyles: IAdd<null, IStyle>;
    addLayouts: IAdd<null, { file: string; id: string }>;
    addMiddlewares: IAdd<null, RequestHandler>;
    addPolyfillImports: IAdd<null, { source: string; specifier?: string }>;
    addRuntimePlugin: IAdd<null, string>;
    addRuntimePluginKey: IAdd<null, string>;
    addTmpGenerateWatcherPaths: IAdd<null, string>;
    chainWebpack: {
      (fn: {
        (
          memo: WebpackChain,
          args: {
            env: Env;
            webpack: typeof webpack;
          },
        ): void;
      }): void;
    };
    modifyHTML: IModify<CheerioAPI, { path: string }>;
    modifyHTMLFavicon: IModify<string, {}>;
    modifyRendererPath: IModify<string, {}>;
    modifyRoutes: IModify<Record<string, IRoute>, {}>;
    modifyViteConfig: IModify<
      ViteInlineConfig,
      {
        env: Env;
      }
    >;
    modifyWebpackConfig: IModify<
      webpack.Configuration,
      {
        env: Env;
        webpack: typeof webpack;
      }
    >;
    onBeforeCompiler: IEvent<{}>;
    onBuildComplete: IEvent<{
      err?: Error;
      isFirstCompile: boolean;
      stats: webpack.Stats;
      time: number;
    }>;
    onCheckCode: IEvent<{
      cjsExports: string[];
      code: string;
      exports: any[];
      file: string;
      imports: {
        default: string;
        loc: any;
        namespace: string;
        source: string;
        specifiers: Record<string, string>;
      }[];
      isFromTmp: boolean;
    }>;
    onCheckConfig: IEvent<{
      config: Record<string, any>;
      userConfig: Record<string, any>;
    }>;
    onCheckPkgJSON: IEvent<{
      current: Record<string, any>;
      origin?: Record<string, any>;
    }>;
    onDevCompileDone: IEvent<{
      isFirstCompile: boolean;
      stats: webpack.Stats;
      time: number;
    }>;
    onGenerateFiles: IEvent<{
      files?: { event: string; path: string } | null;
      isFirstTime?: boolean;
    }>;
    onPatchRoute: IEvent<{
      route: IRoute;
    }>;
    onPkgJSONChanged: IEvent<{
      current: Record<string, any>;
      origin: Record<string, any>;
    }>;
    restartServer: () => void;
    writeTmpFile: (opts: {
      content?: string;
      context?: Record<string, any>;
      noPluginDir?: boolean;
      path: string;
      tpl?: string;
      tplPath?: string;
    }) => void;
  };
