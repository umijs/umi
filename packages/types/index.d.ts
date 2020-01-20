import {
  IConfig as IConfigCore,
  IRoute,
  PluginAPI,
  Service,
} from '@umijs/core';
import { Server } from '@umijs/server';
import { Generator } from '@umijs/utils';
import { IOpts as IBabelPresetUmiOpts } from '@umijs/babel-preset-umi';
import webpack from 'webpack';
import { Express, NextFunction, Request, Response } from 'express';

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
  config: typeof Service.prototype.config;
  pkg: typeof Service.prototype.pkg;
  env: typeof Service.prototype.env;

  // methods
  applyPlugins: typeof Service.prototype.applyPlugins;
  ApplyPluginsType: typeof Service.prototype.ApplyPluginsType;
  ServiceStage: typeof Service.prototype.ServiceStage;
  writeTmpFile: { (args: { path: string; content: string }): void };
  registerGenerator: { (args: { key: string; Generator: Generator }): void };

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
  modifyBundlerImplementor: IModify<any, {}>;

  // ApplyPluginType.add
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
  addEntryCode: IAdd<null, string>;
  addEntryCodeAhead: IAdd<null, string>;
  addTmpGenerateWatcherPaths: IAdd<null, string>;
}

export { IRoute };

export interface IConfig extends IConfigCore {
  alias?: {
    (key: string): string;
  };
  cssLoader?: object;
  define?: {
    (key: string): any;
  };
  devtool?: string;
  disableDynamicImport?: boolean;
  externals?: any;
  extraBabelPlugins?: IPresetOrPlugin[];
  extraBabelPresets?: IPresetOrPlugin[];
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  inlineLimit?: number;
  lessLoader?: object;
  plugins?: IPresetOrPlugin[];
  presets?: IPresetOrPlugin[];
  proxy?: any;
  runtimePublicPath?: boolean;
  singular?: boolean;
  styleLoader?: object;
  targets?: ITargets;
  terserOptions?: object;
  theme?: object;
}

export { webpack };
export { Request, Express, Response, NextFunction };
