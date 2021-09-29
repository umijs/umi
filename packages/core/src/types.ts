import joi from '../compiled/@hapi/joi';

export enum Env {
  development = 'development',
  production = 'production',
}

export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
}

export interface IPluginConfig {
  default?: any;
  schema?: {
    (joi: joi.Root): joi.Schema;
  };
  onChange?: string | Function;
}

export enum ServiceStage {
  uninitialized,
  init,
  initPresets,
  initPlugins,
  resolveConfig,
  collectAppData,
  onCheck,
  onStart,
  runCommand,
}

export enum ConfigChangeType {
  reload = 'reload',
  regenerateTmpFiles = 'regenerateTmpFiles',
}

export enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
}

export enum EnableBy {
  register = 'register',
  config = 'config',
}

export interface IRoute {
  path: string;
  file: string;
  id: string;
  parentId?: string;
}
