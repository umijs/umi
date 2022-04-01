import { fork } from 'child_process';
import path from 'path';
import type { ILintArgs, ILinterOpts } from '../types';

/**
 * base linter
 */
export default class BaseLinter {
  /**
   * linter package name
   */
  linter = '';

  /**
   * paths for linter
   */
  paths: Partial<ILinterOpts> = {};

  constructor({ cwd }: ILinterOpts) {
    this.paths.cwd = cwd;
  }

  /**
   * get bin file path for current linter
   */
  getBinPath() {
    try {
      const pkgPath = require.resolve(`${this.linter}/package.json`);
      const pkgContent = require(pkgPath);

      return path.resolve(path.dirname(pkgPath), pkgContent.bin[this.linter]);
    } catch (e) {
      throw new Error(`${this.linter} not found, please install it first.`);
    }
  }

  /**
   * get linter fork args
   */
  getRunArgs(args: ILintArgs): string[] {
    // not implemented
    args;
    return [];
  }

  /**
   * execute linter
   */
  run(args: ILintArgs) {
    fork(this.getBinPath(), this.getRunArgs(args));
  }
}
