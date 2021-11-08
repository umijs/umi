import type { IServicePluginAPI, PluginAPI } from '@umijs/core';

export type IApi = PluginAPI &
  IServicePluginAPI & {
    onFoo: (arg0: string) => void;
  };
