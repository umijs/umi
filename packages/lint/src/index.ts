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
    const styleArgs = { ...args, _: [...args._] };

    if (!styleArgs.cssinjs) {
      for (const suffix of ES_EXTS) {
        styleArgs._.unshift('--ignore-pattern', suffix);
      }
    }

    stylelint.run(styleArgs);
  }

  if (!args.stylelintOnly) {
    const eslint = new EsLinter(opts);
    const esArgs = { ...args, _: [...args._] };

    for (const suffix of STYLE_EXTS) {
      esArgs._.unshift('--ignore-pattern', suffix);
    }

    eslint.run(esArgs);
  }
};
