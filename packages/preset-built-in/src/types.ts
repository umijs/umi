import { IAdd, IEvent, IServicePluginAPI, PluginAPI } from '@umijs/core';

export type IApi = PluginAPI &
  IServicePluginAPI & {
    restartServer: () => void;
    writeTmpFile: (opts: {
      path: string;
      content?: string;
      tpl?: string;
      tplPath?: string;
      context?: Record<string, string>;
    }) => void;
    addTmpGenerateWatcherPaths: IAdd<null, string[]>;
    onGenerateFiles: IEvent<{
      files: { event: string; path: string } | null;
    }>;
    onPkgJSONChanged: IEvent<{
      origin: Record<string, any>;
      current: Record<string, any>;
    }>;
  };
