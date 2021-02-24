import { createDebug, Debugger } from '@umijs/utils';

abstract class Common {
  public debug: Debugger;
  protected namespace: string;
  protected profilers: object;
  protected formatTiming(timing: number) {
    return timing < 60 * 1000
      ? `${Math.round(timing / 10) / 100}s`
      : `${Math.round(timing / 600) / 100}m`;
  }

  constructor(namespace: string) {
    // TODO: get namespace filename accounding caller function
    if (!namespace) {
      throw new Error(`logger needs namespace`);
    }
    this.namespace = namespace;
    this.profilers = {};
    this.debug = createDebug(this.namespace);
  }

  abstract error(msg: string): void;
  abstract log(msg: string): void;
  abstract info(msg: string): void;
  abstract profile(id: string, ...args: any): void;
}

export default Common;
