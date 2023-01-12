import type { Compiler, Stats } from 'webpack';
import { logger } from '@umijs/utils';

export interface IBuildDepPluginOpts {
  onCompileDone: Function;
  onFileChange?: (c: Compiler) => Promise<any>;
  beforeCompile?: () => Promise<any>;
}

const PLUGIN_NAME = 'MFSUBuildDeps';

export class BuildDepPlugin {
  private opts: IBuildDepPluginOpts;

  constructor(opts: IBuildDepPluginOpts) {
    this.opts = opts;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, (c: Compiler) => {
      logger.debug(
        'webpack watched change',
        'modified: ',
        c.modifiedFiles,
        'removed: ',
        c.removedFiles,
      );
      return this.opts.onFileChange?.(c) || Promise.resolve();
    });

    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () => {
      if (this.opts.beforeCompile) {
        return this.opts.beforeCompile?.();
      } else {
        return Promise.resolve();
      }
    });

    compiler.hooks.done.tap(PLUGIN_NAME, (stats: Stats) => {
      if (!stats.hasErrors()) {
        this.opts.onCompileDone();
      }
    });
  }
}
