import type { ILintArgs } from '../types';
import BaseLinter from './base';

/**
 * linter for drive eslint
 */
export default class Eslinter extends BaseLinter {
  linter = 'eslint';

  getRunArgs(args: ILintArgs) {
    return [
      '--quiet', // no warnings
      ...(args.fix ? ['--fix'] : []),
      ...args._,
    ];
  }
}
