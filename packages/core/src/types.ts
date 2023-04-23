import joi from '@umijs/utils/compiled/@hapi/joi';
import zod, { z } from '@umijs/utils/compiled/zod';

export enum Env {
  development = 'development',
  production = 'production',
  test = 'test',
}

export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
}

export interface IPluginConfig {
  default?: any;
  schema?: {
    (joi: joi.Root & { zod: typeof z }): joi.Schema | zod.Schema;
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

export type ChangeTypeValue = string | `${ConfigChangeType}` | Function;
export type IOnChangeTypes = Record<string, ChangeTypeValue>;

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
  absPath: string;
  file: string;
  id: string;
  parentId?: string;
  [key: string]: any;
}

export interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: {
    fn: { (args: T): void };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

export interface IModify<T, U> {
  (fn: { (initialValue: T, args: U): T }): void;
  (fn: { (initialValue: T, args: U): Promise<T> }): void;
  (args: {
    fn: { (initialValue: T, args: U): T };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
  (args: {
    fn: { (initialValue: T, args: U): Promise<T> };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

export interface IAdd<T, U> {
  (fn: { (args: T): U | U[] }): void;
  (fn: { (args: T): Promise<U | U[]> }): void;
  (args: {
    fn: { (args: T): U | U[] };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
  (args: {
    fn: {
      (args: T): Promise<U | U[]>;
      name?: string;
      before?: string | string[];
      stage?: number;
    };
  }): void;
}

export type IFrameworkType = 'vue' | 'react';
