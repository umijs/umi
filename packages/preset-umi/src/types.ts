import type { RequestHandler } from '@umijs/bundler-webpack';
import type webpack from '@umijs/bundler-webpack/compiled/webpack';
import type WebpackChain from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type {
  IAdd,
  IEvent,
  IModify,
  IServicePluginAPI,
  PluginAPI,
} from '@umijs/core';
import { Env } from '@umijs/core';

export type IScript =
  | Partial<{
      async: boolean;
      charset: string;
      crossOrigin: string | null;
      defer: boolean;
      src: string;
      type: string;
      content: string;
    }>
  | string;
export type IStyle =
  | Partial<{
      type: string;
      content: string;
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
export type IEntryImport = {
  source: string;
  specifier?: string;
};

export type IApi = PluginAPI &
  IServicePluginAPI & {
    restartServer: () => void;
    writeTmpFile: (opts: {
      path: string;
      content?: string;
      tpl?: string;
      tplPath?: string;
      context?: Record<string, any>;
    }) => void;
    addTmpGenerateWatcherPaths: IAdd<null, string[]>;
    onGenerateFiles: IEvent<{
      isFirstTime?: boolean;
      files?: { event: string; path: string } | null;
    }>;
    onPkgJSONChanged: IEvent<{
      origin: Record<string, any>;
      current: Record<string, any>;
    }>;
    onBuildComplete: IEvent<{
      isFirstCompile: boolean;
      stats: any;
      time: number;
      err?: Error;
    }>;
    onCheckPkgJSON: IEvent<{
      origin?: Record<string, any>;
      current: Record<string, any>;
    }>;
    onCheckConfig: IEvent<{
      config: Record<string, any>;
      userConfig: Record<string, any>;
    }>;
    onCheckCode: IEvent<{
      file: string;
      code: string;
      isFromTmp: boolean;
      imports: {
        source: string;
        loc: any;
        default: string;
        namespace: string;
        specifiers: Record<string, string>;
      }[];
      exports: any[];
      cjsExports: string[];
    }>;
    onDevCompileDone: IEvent<{
      isFirstCompile: boolean;
      stats: any;
      time: number;
    }>;
    addEntryImports: IAdd<null, IEntryImport[]>;
    addEntryImportsAhead: IAdd<null, IEntryImport[]>;
    addEntryCodeAhead: IAdd<null, string[]>;
    addEntryCode: IAdd<null, string[]>;
    addExtraBabelPresets: IAdd<null, any[]>;
    addExtraBabelPlugins: IAdd<null, any[]>;
    addBeforeBabelPresets: IAdd<null, any[]>;
    addBeforeBabelPlugins: IAdd<null, any[]>;
    addBeforeMiddlewares: IAdd<null, RequestHandler[]>;
    addMiddlewares: IAdd<null, RequestHandler[]>;
    addHTMLHeadScripts: IAdd<null, IScript[]>;
    addHTMLScripts: IAdd<null, IScript[]>;
    addHTMLStyles: IAdd<null, IStyle[]>;
    addHTMLLinks: IAdd<null, ILink[]>;
    addHTMLMetas: IAdd<null, IMeta[]>;
    addRuntimePlugin: IAdd<null, string[]>;
    addRuntimePluginKey: IAdd<null, string[]>;
    modifyHTMLFavicon: IModify<string, {}>;
    modifyHTML: IModify<string, { path: string }>;
    modifyRendererPath: IModify<string, {}>;
    modifyWebpackConfig: IModify<
      webpack.Configuration,
      {
        webpack: typeof webpack;
        env: Env;
      }
    >;
    modifyViteConfig: IModify<
      webpack.Configuration,
      {
        env: Env;
      }
    >;
    chainWebpack: {
      (fn: {
        (
          memo: WebpackChain,
          args: {
            webpack: typeof webpack;
            env: Env;
          },
        ): void;
      }): void;
    };
  };
