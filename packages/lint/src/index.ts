import { EsLinter, StyleLinter } from './linter';
import type { ILintArgs, ILinterOpts } from './types';

const ES_EXTS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];
const STYLE_EXTS = [
  '**/*.less',
  '**/*.css',
  '**/*.sass',
  '**/*.scss',
  '**/*.styl',
];
export type { ILintArgs, ILinterOpts };

export default (opts: ILinterOpts, args: ILintArgs) => {
  if (!args.eslintOnly) {
    const stylelint = new StyleLinter(opts);
    if (!args.cssinjs) {
      for (const suffix of ES_EXTS) {
        args._.unshift('--ignore-pattern', suffix);
      }
    }
    stylelint.run(args);
  }

  if (!args.stylelintOnly) {
    const eslint = new EsLinter(opts);
    for (const suffix of STYLE_EXTS) {
      args._.unshift('--ignore-pattern', suffix);
    }
    eslint.run(args);
  }
};
