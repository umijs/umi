import { Context } from '../types';

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {}

  transform(pkg: Object) {
    return pkg;
  }
}
