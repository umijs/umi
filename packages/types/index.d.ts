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
import { Server, IServerOpts } from '@umijs/server';
import { Generator } from '@umijs/utils';
import { IOpts as IBabelPresetUmiOpts } from '@umijs/babel-preset-umi';
import webpack from 'webpack';
import {
  Express,
  NextFunction,
  Request,
  Response,
  RequestHandler,
} from 'express';

interface IEvent<T> {
  (fn: { (args: T): void }): void;
}

interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
  (fn: { (initialValue: T, args: U): Promise<T> }): void;
}

interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
  (fn: { (args: T): Promise<U | U[]> }): void;
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
  stage: typeof Service.prototype.stage;
  ServiceStage: typeof Service.prototype.ServiceStage;
  writeTmpFile: { (args: { path: string; content: string }): void };
  registerGenerator: { (args: { key: string; Generator: Generator }): void };
  babelRegister: typeof Service.prototype.babelRegister;

  // methods from dev command
  getPort: IGetter<number>;
  getServer: IGetter<Server>;
  restartServer: Function;

  // ApplyPluginType.event
  onPluginReady: IEvent<null>;
  onStart: IEvent<{ args: object }>;
  onGenerateFiles: IEvent<{ isRebuild?: boolean }>;

  // ApplyPluginType.modify
  modifyPaths: IModify<string[], null>;
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
  chainWebpack: IModify<any, {}>;

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
}

export { IRoute };

export interface IConfig extends IConfigCore {
  alias?: {
    (key: string): string;
  };
  links?: Partial<HTMLLinkElement>[];
  styles?: IStyleConfig;
  metas?: Partial<HTMLMetaElement>[];
  headScripts?: IScriptConfig;
  scripts?: IScriptConfig;
  chainWebpack?: Function;
  cssLoader?: object;
  define?: {
    [key: string]: any;
  };
  devServer?: IServerOpts;
  devtool?: string;
  disableDynamicImport?: boolean;
  externals?: any;
  extraBabelPlugins?: IPresetOrPlugin[];
  extraBabelPresets?: IPresetOrPlugin[];
  hash?: boolean;
  history?: 'browser' | 'hash' | 'memory';
  ignoreMomentLocale?: boolean;
  inlineLimit?: number;
  lessLoader?: object;
  mountElementId?: string;
  plugins?: IPresetOrPlugin[];
  presets?: IPresetOrPlugin[];
  proxy?: any;
  runtimePublicPath?: boolean;
  singular?: boolean;
  styleLoader?: object;
  targets?: ITargets;
  terserOptions?: object;
  theme?: object;
  ssr?: object;
  favicon?: string;
  [key: string]: any;
}

export { webpack };
export { Html, IScriptConfig, IStyleConfig };
export { Request, Express, Response, NextFunction, RequestHandler };
