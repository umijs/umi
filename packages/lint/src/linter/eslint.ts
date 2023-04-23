import type { ILintArgs } from '../types';
import BaseLinter from './base';

/**
 * linter for drive eslint
 */
export default class Eslinter extends BaseLinter {
  linter = 'eslint';

  getRunArgs(args: ILintArgs) {
    return [
      ...(args.quiet ? ['--quiet'] : []),
      ...(args.fix ? ['--fix'] : []),
      ...args._,
    ];
  }
}
