import {
  PluginAPI,
  Service,
  IRoute,
  IConfig as IConfigCore,
} from '@umijs/core';
import webpack from 'webpack';
import { Request, Express, Response, NextFunction } from 'express';

interface IEvent<T> {
  (fn: { (args: T): void }): void;
}

interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
}

interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
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
}

export { IRoute };

export interface IConfig extends IConfigCore {
  devtool?: string;
  hash?: boolean;
  externals?: any;
  alias?: {
    (key: string): string;
  };
  ignoreMomentLocale?: boolean;
  inlineLimit?: number;
  theme?: object;
  styleLoader?: object;
  extraBabelPresets?: IPresetOrPlugin[];
  extraBabelPlugins?: IPresetOrPlugin[];
  disableDynamicImport?: boolean;
  terserOptions?: object;
}

export { webpack };
export { Request, Express, Response, NextFunction };
