import {
  IConfig as IConfigCore,
  IRoute,
  PluginAPI,
  Html,
  IStyleConfig,
  IScriptConfig,
  IHTMLTag,
  Service,
} from '@umijs/core';
import { Stream } from 'stream';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { Server, IServerOpts } from '@umijs/server';
import { Generator } from '@umijs/utils';
import { IOpts as IBabelPresetUmiOpts } from '@umijs/babel-preset-umi';
import {
  IRouteComponentProps,
  IRoute as IRouteProps,
} from '@umijs/renderer-react';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { Express, NextFunction, RequestHandler } from 'express';
import { Request, Response } from 'express-serve-static-core';
import { History, Location } from 'history-with-query';

export enum BundlerConfigType {
  csr = 'csr',
  ssr = 'ssr',
}

interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: { fn: { (args: T): void }; before?: string; stage?: number }): void;
}

interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
  (fn: { (initialValue: T, args: U): Promise<T> }): void;
  (args: {
    fn: { (initialValue: T, args: U): T };
    before?: string;
    stage?: number;
  }): void;
  (args: {
    fn: { (initialValue: T, args: U): Promise<T> };
    before?: string;
    stage?: number;
  }): void;
}

interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
  (fn: { (args: T): Promise<U | U[]> }): void;
  (args: { fn: { (args: T): U | U[] }; before?: string; stage?: number }): void;
  (args: {
    fn: { (args: T): Promise<U | U[]>; before?: string; stage?: number };
  }): void;
}

interface IGetter<T> {
  (): T;
}

interface IImport {
  source: string;
  specifier?: string;
}

export interface ITargets {
  browsers?: any;
  [key: string]: number | boolean;
}

export type IBundlerConfigType = keyof typeof BundlerConfigType;

export interface ICreateCSSRule {
  (opts: {
    lang: string;
    type: IBundlerConfigType;
    test: RegExp;
    loader?: string;
    options?: object;
  }): void;
}

type IPresetOrPlugin = string | [string, any];
type IBabelPresetOrPlugin = Function | string | [string, any, string?];
type env = 'development' | 'production';

type IRouteMap = Array<{ route: Pick<IRoute, 'path'>; file: string }>;
interface IHtmlUtils extends Html {
  getRouteMap: () => Promise<IRouteMap>;
}

export interface IApi extends PluginAPI {
  // properties
  paths: typeof Service.prototype.paths;
  cwd: typeof Service.prototype.cwd;
  userConfig: typeof Service.prototype.userConfig;
  config: IConfig;
  pkg: typeof Service.prototype.pkg;
  env: typeof Service.prototype.env;
  args: typeof Service.prototype.args;

  // methods
  applyPlugins: typeof Service.prototype.applyPlugins;
  ApplyPluginsType: typeof Service.prototype.ApplyPluginsType;
  ConfigChangeType: typeof Service.prototype.ConfigChangeType;
  EnableBy: typeof Service.prototype.EnableBy;
  stage: typeof Service.prototype.stage;
  ServiceStage: typeof Service.prototype.ServiceStage;
  writeTmpFile: {
    (args: { path: string; content: string; skipTSCheck?: boolean }): void;
  };
  registerGenerator: { (args: { key: string; Generator: Generator }): void };
  babelRegister: typeof Service.prototype.babelRegister;
  getRoutes: () => Promise<IRoute[]>;
  hasPlugins: typeof Service.prototype.hasPlugins;
  hasPresets: typeof Service.prototype.hasPresets;

  // methods from dev command
  getPort: IGetter<number>;
  getHostname: IGetter<string>;
  getServer: IGetter<Server>;
  restartServer: Function;

  // ApplyPluginType.event
  onPluginReady: IEvent<null>;
  onStart: IEvent<{ args: object }>;
  onExit: IEvent<{ signal: 'SIGINT' | 'SIGQUIT' | 'SIGTERM' }>;
  onGenerateFiles: IEvent<{ isRebuild?: boolean }>;
  onPatchRoute: IEvent<{ route: IRoute; parentRoute?: IRoute }>;
  onPatchRouteBefore: IEvent<{ route: IRoute; parentRoute?: IRoute }>;
  onPatchRoutes: IEvent<{ routes: IRoute[]; parentRoute?: IRoute }>;
  onPatchRoutesBefore: IEvent<{ routes: IRoute[]; parentRoute?: IRoute }>;
  onBuildComplete: IEvent<{
    err?: Error;
    stats?: { stats: webpack.Stats[]; hash: string };
  }>;
  onDevCompileDone: IEvent<{
    isFirstCompile: boolean;
    stats: webpack.Stats;
    type: IBundlerConfigType;
  }>;

  // ApplyPluginType.modify
  modifyPaths: IModify<typeof Service.prototype.paths, null>;
  modifyRendererPath: IModify<string, null>;
  modifyPublicPathStr: IModify<string, { route: IRoute }>;
  modifyBundler: IModify<any, null>;
  modifyBundleConfigOpts: IModify<
    any,
    {
      env: env;
      type: IBundlerConfigType;
      bundler: { id: string; version: number };
    }
  >;
  modifyBundleConfig: IModify<
    webpack.Configuration,
    {
      env: env;
      type: IBundlerConfigType;
      bundler: { id: string; version: number };
    }
  >;
  modifyBundleConfigs: IModify<
    any[],
    {
      env: env;
      bundler: { id: string };
      getConfig: ({ type }: { type: IBundlerConfigType }) => object;
    }
  >;
  modifyBabelOpts: IModify<
    {
      sourceType: string;
      babelrc: boolean;
      cacheDirectory: boolean;
      presets: any[];
      plugins: any[];
    },
    {
      env: env;
      type?: IBundlerConfigType;
    }
  >;
  modifyBabelPresetOpts: IModify<
    IBabelPresetUmiOpts,
    {
      env: env;
    }
  >;
  modifyBundleImplementor: IModify<any, {}>;
  modifyConfig: IModify<IConfig, {}>;
  modifyDefaultConfig: IModify<IConfig, {}>;
  modifyHTML: IModify<CheerioStatic, { route: IRoute }>;
  modifyRoutes: IModify<IRoute[], {}>;
  modifyHTMLChunks: IModify<
    (string | { name: string; headScript?: boolean })[],
    {
      route: IRoute;
      type?: IBundlerConfigType;
      chunks: webpack.compilation.Chunk[];
    }
  >;
  modifyDevHTMLContent: IModify<string | Stream, { req: Request }>;
  modifyExportRouteMap: IModify<IRouteMap, { html: IHtmlUtils }>;
  modifyProdHTMLContent: IModify<string, { route: IRoute; file: string }>;
  chainWebpack: IModify<
    WebpackChain,
    {
      webpack: typeof webpack;
      createCSSRule: ICreateCSSRule;
      type: IBundlerConfigType;
    }
  >;

  // ApplyPluginType.add
  addDepInfo: IAdd<null, { name: string; range: string; alias?: string[] }>;
  addDevScripts: IAdd<null, string>;
  addHTMLHeadScripts: IAdd<{ route?: IRoute }, IScriptConfig>;
  addHTMLScripts: IAdd<{ route?: IRoute }, IScriptConfig>;
  addHTMLMetas: IAdd<{ route?: IRoute }, IHTMLTag>;
  addHTMLLinks: IAdd<{ route?: IRoute }, IHTMLTag>;
  addHTMLStyles: IAdd<{ route?: IRoute }, IHTMLTag>;
  addUmiExports: IAdd<
    null,
    {
      source: string;
      specifiers?: (
        | string
        | {
            local: string;
            exported: string;
          }
      )[];
      exportAll?: boolean;
    }
  >;
  addProjectFirstLibraries: IAdd<null, { name: string; path: string }>;
  addRuntimePlugin: IAdd<null, string>;
  addRuntimePluginKey: IAdd<null, string>;
  addPolyfillImports: IAdd<null, IImport>;
  addEntryImportsAhead: IAdd<null, IImport>;
  addEntryImports: IAdd<null, IImport>;
  addEntryCode: IAdd<null, string>;
  addEntryCodeAhead: IAdd<null, string>;
  addTmpGenerateWatcherPaths: IAdd<null, string>;
  addBeforeMiddlewares: IAdd<{ service: Service }, RequestHandler<any>>;
  addBeforeMiddewares: IAdd<{ service: Service }, RequestHandler<any>>;
  addMiddlewares: IAdd<{ service: Service }, RequestHandler<any>>;
  addMiddewares: IAdd<{ service: Service }, RequestHandler<any>>;
}

export { IRoute };

export interface IManifest {
  fileName: string;
  publicPath: string;
  basePath: string;
  writeToFileEmit: boolean;
}

export interface ISSR {
  forceInitial?: boolean;
  removeWindowInitialProps?: boolean;
  devServerRender?: boolean;
  mode?: 'string' | 'stream';
  staticMarkup?: boolean;
}

export interface ICopy {
  from: string;
  to: string;
}

export interface BaseIConfig extends IConfigCore {
  alias?: {
    [key: string]: string;
  };
  analyze?: BundleAnalyzerPlugin.Options;
  autoprefixer?: object;
  base?: string;
  chainWebpack?: {
    (
      memo: WebpackChain,
      args: {
        type: IBundlerConfigType;
        webpack: typeof webpack;
        env: env;
        createCSSRule: ICreateCSSRule;
      },
    ): void;
  };
  chunks?: string[];
  cssLoader?: object;
  cssModulesTypescriptLoader?: { mode?: 'verify' | 'emit' };
  cssnano?: object;
  copy?: (string | ICopy)[];
  define?: {
    [key: string]: any;
  };
  devServer?: IServerOpts;
  devtool?: webpack.Options.Devtool;
  dynamicImport?: {
    loading?: string;
  };
  dynamicImportSyntax?: {};
  exportStatic?: {
    htmlSuffix?: boolean;
    dynamicRoot?: boolean;
    extraRoutePaths?: () => Promise<string[]>;
  };
  externals?: any;
  extraBabelIncludes?: string[];
  extraBabelPlugins?: IBabelPresetOrPlugin[];
  extraBabelPresets?: IBabelPresetOrPlugin[];
  extraPostCSSPlugins?: any[];
  favicon?: string;
  forkTSChecker?: object;
  fastRefresh?: object;
  hash?: boolean;
  headScripts?: IScriptConfig;
  history?: {
    type: 'browser' | 'hash' | 'memory';
    options?: object;
  };
  runtimeHistory?: object;
  ignoreMomentLocale?: boolean;
  inlineLimit?: number;
  lessLoader?: object;
  links?: Partial<HTMLLinkElement>[];
  manifest?: Partial<IManifest>;
  metas?: Partial<HTMLMetaElement>[];
  mpa?: object;
  mock?: { exclude?: string[] };
  mountElementId?: string;
  nodeModulesTransform?: {
    type: 'all' | 'none';
    exclude?: string[];
  };
  outputPath?: string;
  plugins?: IPresetOrPlugin[];
  polyfill?: { imports: string[] };
  postcssLoader?: object;
  presets?: IPresetOrPlugin[];
  proxy?: any;
  publicPath?: string;
  runtimePublicPath?: boolean;
  scripts?: IScriptConfig;
  singular?: boolean;
  ssr?: ISSR;
  styleLoader?: object;
  styles?: IStyleConfig;
  targets?: ITargets;
  terserOptions?: object;
  theme?: object;
  title?: string;
  [key: string]: any;
}

type WithFalse<T> = {
  [P in keyof T]?: T[P] | false;
};

interface IServerRenderParams {
  path: string;
  htmlTemplate?: string;
  mountElementId?: string;
  context?: object;
  mode?: 'string' | 'stream';
  basename?: string;
  staticMarkup?: boolean;
  forceInitial?: boolean;
  removeWindowInitialProps?: boolean;
  getInitialPropsCtx?: object;
  manifest?: string;
  [k: string]: any;
}

interface IServerRenderResult<T = string | Stream> {
  rootContainer: T;
  html: T;
  error: Error;
}

interface IServerRender<T = string> {
  (params: IServerRenderParams): Promise<IServerRenderResult<T>>;
}

export type IConfig = WithFalse<BaseIConfig>;

export { webpack };
export { Html, IScriptConfig, IStyleConfig };
export { Request, Express, Response, NextFunction, RequestHandler };

export { History, Location, IRouteProps, IRouteComponentProps };
export { IServerRender, IServerRenderParams, IServerRenderResult };
