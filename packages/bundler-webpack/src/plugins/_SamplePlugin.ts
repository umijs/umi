import { Compiler } from '../../compiled/webpack';

const PLUGIN_NAME = 'SamplePlugin';

interface IOpts {}

class _SamplePlugin {
  public options: IOpts;

  constructor(options: IOpts = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkHash.tap(PLUGIN_NAME, (_) => {});
    });
  }
}

export default _SamplePlugin;
