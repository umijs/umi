import type { Compiler } from 'webpack';

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

    compiler.hooks.compile.tap(PLUGIN_NAME, () => {
      this.opts.onCompileDone();
    });
  }
}
