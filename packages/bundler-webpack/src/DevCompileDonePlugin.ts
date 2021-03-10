import { webpack } from '@umijs/types';

interface IOpts {
  port: number;
}

export default class DevCompileDonePlugin {
  opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }
  apply(compiler: webpack.Compiler) {
    let isFirstCompile = true;
    compiler.hooks.done.tap('DevFirstCompileDone', (stats) => {
      if (stats.hasErrors()) {
        // make sound
        if (process.env.SYSTEM_BELL !== 'none') {
          process.stdout.write('\x07');
        }
        return;
      }
      console.log(`App running at: http://localhost:${this.opts.port}`);
      if (isFirstCompile) {
        process.send?.({ type: 'DONE' });
        isFirstCompile = false;
      }
    });
  }
}
