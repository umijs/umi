import { Compiler, Stats } from '@umijs/bundler-webpack/compiled/webpack';

interface IOpts {
  onCompileDone: Function;
}

const PLUGIN_NAME = 'MFSUBuildDeps';

export class BuildDepPlugin {
  private opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }
  apply(compiler: Compiler): void {
    compiler.hooks.done.tap(PLUGIN_NAME, (stats: Stats) => {
      if (!stats.hasErrors()) {
        this.opts.onCompileDone();
      }
    });
  }
}
