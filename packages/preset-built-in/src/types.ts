import { IAdd, IEvent, IServicePluginAPI, PluginAPI } from '@umijs/core';

export interface IRegisterGenerator {
  key: string;
  fn: (opts: { args: any; paths: IServicePluginAPI['paths'] }) => void;
}

export type IApi = PluginAPI &
  IServicePluginAPI & {
    restartServer: () => void;
    writeTmpFile: (opts: {
      path: string;
      content?: string;
      tpl?: string;
      tplPath?: string;
      context?: Record<string, any>;
    }) => void;
    addTmpGenerateWatcherPaths: IAdd<null, string[]>;
    registerGenerator: (command: IRegisterGenerator) => void;
    onGenerateFiles: IEvent<{
      isFirstTime?: boolean;
      files?: { event: string; path: string } | null;
    }>;
    onPkgJSONChanged: IEvent<{
      origin: Record<string, any>;
      current: Record<string, any>;
    }>;
    onBuildComplete: IEvent<{
      isFirstCompile: boolean;
      stats: any;
      time: number;
      err?: Error;
    }>;
    onDevCompileDone: IEvent<{
      isFirstCompile: boolean;
      stats: any;
      time: number;
    }>;
    addRuntimePlugin: IAdd<null, string[]>;
    addRuntimePluginKey: IAdd<null, string[]>;
  };
