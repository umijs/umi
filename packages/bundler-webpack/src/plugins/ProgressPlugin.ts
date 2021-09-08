import {
  Compiler,
  ProgressPlugin,
  Stats,
} from '@umijs/bundler-webpack/compiled/webpack';
import { logger } from '@umijs/utils';

const PLUGIN_NAME = 'ProgressBarPlugin';
interface IOpts {}

class UmiProgressPlugin extends ProgressPlugin {
  public options: IOpts;

  constructor(options: IOpts = {}) {
    super({ activeModules: true });
    this.options = options;

    this.handler = (percent, message, ...details) => {
      this.updateProgress({ percent, message, details });
    };
  }

  apply(compiler: Compiler): void {
    compiler.hooks.invalid.tap(PLUGIN_NAME, () => {
      logger.wait('compiling...');
    });
    compiler.hooks.done.tap(PLUGIN_NAME, (stats: Stats) => {
      const { errors, warnings } = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
        colors: true,
      });
      const hasErrors = !!errors?.length;
      const hasWarnings = !!warnings?.length;
      hasWarnings;
      if (hasErrors) {
        errors.forEach((error) => {
          logger.error(
            `${error.moduleName!}${error.loc ? `:${error.loc}` : ''}`,
          );
          console.log(error.message);
        });
      } else {
        logger.event('compiled successfully');
      }
    });
  }

  updateProgress(opts: { percent: number; message: string; details: any[] }) {
    opts;
  }
}

export default UmiProgressPlugin;
