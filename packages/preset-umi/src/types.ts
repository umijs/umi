// sort-object-keys
import type { ImportDeclaration } from '@umijs/bundler-utils/compiled/@babel/types';
import type { RequestHandler, webpack, Express } from '@umijs/bundler-webpack';
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
import type { getMarkup } from '@umijs/server';
import type { CheerioAPI } from '@umijs/utils/compiled/cheerio';
import type { InlineConfig as ViteInlineConfig } from 'vite';
import type { getMarkupArgs } from './commands/dev/getMarkupArgs';
import type CodeFrameError from './features/transform/CodeFrameError';

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
  'http-equiv': string;
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
export type IFileInfo = Array<{ event: string; path: string }>;

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
    modifyBabelPresetOpts: IModify<any, null>;
    modifyEntry: IModify<Record<string, string>, null>;
    modifyExportHTMLFiles: IModify<
      { content: string; path: string }[],
      {
        getMarkup: typeof getMarkup;
        markupArgs: Awaited<ReturnType<typeof getMarkupArgs>>;
      }
    >;
    modifyHTML: IModify<CheerioAPI, { path: string }>;
    modifyHTMLFavicon: IModify<string[], {}>;
    modifyRendererPath: IModify<string, {}>;
    modifyRoutes: IModify<Record<string, IRoute>, {}>;
    modifyServerRendererPath: IModify<string, {}>;
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
    onBeforeCompiler: IEvent<{ compiler: 'vite' | 'webpack'; opts: any }>;
    onBeforeMiddleware: IEvent<{
      app: Express;
    }>;
    onBuildComplete: IEvent<{
      err?: Error;
      isFirstCompile: boolean;
      stats: webpack.Stats;
      time: number;
    }>;
    onBuildHtmlComplete: IEvent<{}>;
    onCheckCode: IEvent<{
      cjsExports: string[];
      code: string;
      CodeFrameError: typeof CodeFrameError;
      exports: any[];
      file: string;
      imports: {
        default: string;
        kind: ImportDeclaration['importKind'];
        loc: any;
        namespace: string;
        source: string;
        specifiers: Record<
          string,
          { kind: ImportDeclaration['importKind']; name: string }
        >;
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
      files?: IFileInfo | null;
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
