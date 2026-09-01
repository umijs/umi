import { CLIEngine } from '@utoo/lint';
import { getUtooLintConfig } from '../config/utoo';
import type { ILintArgs } from '../types';
import BaseLinter from './base';

/**
 * linter for JavaScript and TypeScript powered by utoo-lint
 */
export default class Eslinter extends BaseLinter {
  getRunArgs(args: ILintArgs) {
    return args._;
  }

  run(args: ILintArgs) {
    const linter = new CLIEngine({
      baseConfig: getUtooLintConfig(),
      cwd: this.paths.cwd,
      fix: args.fix,
      quiet: args.quiet,
    });
    const report = linter.executeOnFiles(this.getRunArgs(args));

    if (args.fix) {
      CLIEngine.outputFixes(report);
    }

    const output = linter.getFormatter()(report.results);
    if (output) {
      process.stdout.write(`${output}\n`);
    }

    if (report.errorCount > 0) {
      process.exitCode = 1;
    }
  }
}
