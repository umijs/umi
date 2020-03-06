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
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { Server, IServerOpts } from '@umijs/server';
import { Generator } from '@umijs/utils';
import { IOpts as IBabelPresetUmiOpts } from '@umijs/babel-preset-umi';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import {
  Express,
  NextFunction,
  Request,
  Response,
  RequestHandler,
} from 'express';

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

type IPresetOrPlugin = string | [string, any];
type env = 'development' | 'production';

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
  writeTmpFile: { (args: { path: string; content: string }): void };
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
  onPatchRoute: IEvent<{ route: IRoute }>;
  onPatchRoutes: IEvent<{ routes: IRoute[] }>;
  onBuildComplete: IEvent<{ err?: Error; stats?: webpack.Stats }>;
  onDevCompileDone: IEvent<{ isFirstCompile: boolean; stats: webpack.Stats }>;

  // ApplyPluginType.modify
  modifyPaths: IModify<string[], null>;
  modifyPublicPathStr: IModify<string, { route: IRoute }>;
  modifyBundler: IModify<any, null>;
  modifyBundleConfigOpts: IModify<
    any,
    { env: env; type: string; bundler: { id: string; version: number } }
  >;
  modifyBundleConfig: IModify<
    webpack.Configuration,
    { env: env; type: string; bundler: { id: string; version: number } }
  >;
  modifyBundleConfigs: IModify<
    any[],
    {
      env: env;
      bundler: { id: string };
      getConfig: ({ type }: { type: string }) => object;
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
    { route: IRoute }
  >;
  chainWebpack: IModify<WebpackChain, { webpack: typeof webpack }>;

  // ApplyPluginType.add
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
  addBeforeMiddewares: IAdd<{ service: Service }, RequestHandler<any>>;
  addMiddewares: IAdd<{ service: Service }, RequestHandler<any>>;
}

export { IRoute };

interface IManifest {
  fileName: string;
  publicPath: string;
  basePath: string;
}

export interface IConfig extends IConfigCore {
  alias?: {
    [key: string]: string;
  };
  analyze?: BundleAnalyzerPlugin.Options;
  autoprefixer?: object;
  base?: string;
  chainWebpack?: {
    (memo: WebpackChain, args: { webpack: typeof webpack; env: env }): void;
  };
  chunks?: string[];
  cssLoader?: object;
  cssnano?: object;
  copy?: string[];
  define?: {
    [key: string]: any;
  };
  devServer?: IServerOpts;
  devtool?: webpack.Options.Devtool;
  dynamicImport?: {
    loading?: string;
  };
  exportStatic?: {
    htmlSuffix?: boolean;
    dynamicRoot?: boolean;
  };
  externals?: any;
  extraBabelPlugins?: IPresetOrPlugin[];
  extraBabelPresets?: IPresetOrPlugin[];
  extraPostCSSPlugins?: any[];
  favicon?: string;
  forkTSCheker?: object;
  hash?: boolean;
  headScripts?: IScriptConfig;
  history?: {
    type: 'browser' | 'hash' | 'memory';
    options?: object;
  };
  ignoreMomentLocale?: boolean;
  inlineLimit?: number;
  lessLoader?: object;
  links?: Partial<HTMLLinkElement>[];
  manifest?: Partial<IManifest>;
  metas?: Partial<HTMLMetaElement>[];
  mock?:
    | {
        exclude?: string[];
      }
    | false;
  mountElementId?: string;
  outputPath?: string;
  plugins?: IPresetOrPlugin[];
  presets?: IPresetOrPlugin[];
  proxy?: any;
  publicPath?: string;
  runtimePublicPath?: boolean;
  scripts?: IScriptConfig;
  singular?: boolean;
  ssr?: object;
  styleLoader?: object;
  styles?: IStyleConfig;
  targets?: ITargets;
  terserOptions?: object;
  theme?: object;
  title?: string;
  [key: string]: any;
}

export { webpack };
export { Html, IScriptConfig, IStyleConfig };
export { Request, Express, Response, NextFunction, RequestHandler };
