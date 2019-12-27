import { PluginAPI, Service } from '@umijs/core';

interface IEvent<T> {
  (fn: { (args: T): void }): void;
}

interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
}

interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
}

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

  // ApplyPluginType.event
  onPluginReady: IEvent<null>;
  onStart: IEvent<{ args: object }>;
  onGenerateFiles: IEvent<{ isRebuild?: boolean }>;

  // ApplyPluginType.modify
  modifyPaths: IModify<string[], null>;

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
