import { PluginAPI } from '@umijs/core';
import { join } from 'path';

interface IEvent<T> {
  (fn: { (args: T): void }): void;
}

export interface IApi extends PluginAPI {
  paths: {
    cwd: string;
    absNodeModulesPath: string;
    absOutputPath: string;
    absSrcPath: string;
    absPagesPath: string;
    absTmpPath: string;
  };

  onGenerateFiles: IEvent<{ isRebuild?: boolean }>;
}
