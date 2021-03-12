import { chalk } from '@umijs/utils';
import Common from './Common';

export default class Logger extends Common {
  public LOG = chalk.black.bgBlue('LOG');
  public INFO = chalk.black.bgBlue('INFO');
  public WARN = chalk.black.bgHex('#faad14')('WARN');
  public ERROR = chalk.black.bgRed('ERROR');
  public PROFILE = chalk.black.bgCyan('PROFILE');

  public log(...args: any) {
    // TODO: node env production
    console.log(this.LOG, ...args);
  }

  /**
   * The {@link logger.info} function is an alias for {@link logger.log()}.
   * @param args
   */
  public info(...args: any) {
    console.log(this.INFO, ...args);
  }

  public error(...args: any) {
    console.error(this.ERROR, ...args);
  }

  public warn(...args: any) {
    console.warn(this.WARN, ...args);
  }

  public profile(id: string, message?: string) {
    const time = Date.now();
    const namespace = `${this.namespace}:${id}`;
    // for test
    let msg;
    if (this.profilers[id]) {
      const timeEnd = this.profilers[id];
      delete this.profilers[id];
      process.stderr.write(this.PROFILE + ' ');
      msg = `${this.PROFILE} ${chalk.cyan(
        `└ ${namespace}`,
      )} Completed in ${this.formatTiming(time - timeEnd)}`;
      console.log(msg);
    } else {
      msg = `${this.PROFILE} ${chalk.cyan(`┌ ${namespace}`)} ${message || ''}`;
      console.log(msg);
    }

    this.profilers[id] = time;
    return msg;
  }
}
