import type { RequestHandler } from '@umijs/bundler-webpack';
import type webpack from '@umijs/bundler-webpack/compiled/webpack';
import type WebpackChain from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { IAdd, IEvent, IServicePluginAPI, PluginAPI } from '@umijs/core';
import { Env } from '@umijs/core';

export interface IRegisterGenerator {
  key: string;
  fn: (opts: { args: any; paths: IServicePluginAPI['paths'] }) => void;
}

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
    registerGenerator: (command: IRegisterGenerator) => void;
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
    addBeforeMiddlewares: IAdd<null, RequestHandler[]>;
    addMiddlewares: IAdd<null, RequestHandler[]>;
    addHTMLHeadScripts: IAdd<null, IScript[]>;
    addHTMLScripts: IAdd<null, IScript[]>;
    addHTMLStyles: IAdd<null, IStyle[]>;
    addHTMLLinks: IAdd<null, ILink[]>;
    addHTMLMetas: IAdd<null, IMeta[]>;
    addRuntimePlugin: IAdd<null, string[]>;
    addRuntimePluginKey: IAdd<null, string[]>;
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
