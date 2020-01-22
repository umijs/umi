import joi from '@hapi/joi';
import { yargs } from '@umijs/utils';

export type IServicePathKeys =
  | 'cwd'
  | 'absNodeModulesPath'
  | 'absOutputPath'
  | 'absSrcPath'
  | 'absPagesPath'
  | 'absTmpPath'
  | 'aliasedTmpPath';

export type IServicePaths = {
  [key in IServicePathKeys]: string;
};

export interface IDep {
  [name: string]: string;
}

export interface IPackage {
  name?: string;
  dependencies?: IDep;
  devDependencies?: IDep;
}

export interface IPlugin {
  id: string;
  // Currently only used for config
  key: string;
  path: string;
  apply: Function;

  config?: IPluginConfig;
  isPreset?: boolean;
}

export interface IPluginConfig {
  default?: any;
  schema?: {
    (joi: joi.Root): joi.Schema;
  };
  onChange?: string | Function;
}

export interface IPreset extends IPlugin {}

export interface IHook {
  key: string;
  fn: Function;
  pluginId?: string;
  before?: string;
  stage?: number;
}

export interface ICommand {
  name: string;
  alias?: string;
  fn: {
    ({ args }: { args: yargs.Arguments }): void;
  };
}
