import { webpack } from '@umijs/types';
import { chalk, clipboardy, address } from '@umijs/utils';

interface IOpts {
  port: number;
  onCompileDone: Function;
  onCompileFail: Function;
}

export default class DevCompileDonePlugin {
  opts: IOpts;

  constructor(opts: IOpts) {
    this.opts = opts;
  }

  apply(compiler: webpack.Compiler) {
    let isFirstCompile = true;
    compiler.hooks.done.tap('DevFirstCompileDone', stats => {
      if (stats.hasErrors()) {
        // make sound
        if (process.env.SYSTEM_BELL !== 'none') {
          process.stdout.write('\x07');
        }
        this.opts.onCompileFail?.({
          stats,
        });
        return;
      }

      if (isFirstCompile) {
        const lanIp = address.ip();
        const protocol = process.env.HTTPS ? 'https' : 'http';
        const localUrl = `${protocol}://localhost:${this.opts.port}`;
        const lanUrl = `${protocol}://${lanIp}:${this.opts.port}`;

        let copied = '';
        try {
          clipboardy.writeSync(localUrl);
          copied = chalk.dim('(copied to clipboard)');
        } catch (e) {
          copied = chalk.red(`(copy to clipboard failed)`);
        }

        console.log();
        console.log(
          [
            `  App running at:`,
            `  - Local:   ${chalk.cyan(localUrl)} ${copied}`,
            lanUrl && `  - Network: ${chalk.cyan(lanUrl)}`,
          ]
            .filter(Boolean)
            .join('\n'),
        );

        isFirstCompile = false;
      }

      this.opts.onCompileDone?.({
        isFirstCompile,
        stats,
      });

      if (isFirstCompile) {
        isFirstCompile = false;
        // openBrowser();
      }
    });
  }
}
