import type { Compiler } from 'webpack';

interface IOpts {
  onWriteCache: Function;
}

const PLUGIN_NAME = 'MFSUWriteCache';

export class WriteCachePlugin {
  private opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }
  apply(compiler: Compiler): void {
    compiler.cache.hooks.store.tap(
      { name: PLUGIN_NAME, stage: /*Cache.STAGE_DISK*/ 10 },
      () => {
        this.opts.onWriteCache();
      },
    );
  }
}
