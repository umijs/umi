import type { Compiler, Stats } from 'webpack';

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
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, (c) => {
      return this.opts.onFileChange?.(c) || Promise.resolve();
    });

    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () => {
      this.opts.beforeCompile?.();
    });

    compiler.hooks.done.tap(PLUGIN_NAME, (stats: Stats) => {
      if (!stats.hasErrors()) {
        this.opts.onCompileDone();
      }
    });
  }
}
