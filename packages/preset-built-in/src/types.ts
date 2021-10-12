import { IEvent, IServicePluginAPI, PluginAPI } from '@umijs/core';

export type IApi = PluginAPI &
  IServicePluginAPI & {
    restartServer: Function;
    onPkgJSONChanged: IEvent<{
      origin: Record<string, any>;
      current: Record<string, any>;
    }>;
  };
