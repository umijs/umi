import { yParser } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'lint',
    description: 'lint source code using eslint and stylelint',
    configResolveMode: 'loose',
    details: `
umi lint

# lint for specific files, default is "{src,test}/**/*.{js,jsx,ts,tsx,less}"
umi lint "**/*.{ts,scss}"

# lint eslint-only or stylelint-only
umi lint --eslint-only
umi lint --stylelint-only

# automatically fix, where possible
umi lint --fix

# disable reporting on warnings
umi lint --quiet
`,
    fn: async function () {
      // re-parse cli args to process boolean flags, for get the lint-staged args
      const args = yParser(process.argv.slice(3), {
        boolean: ['quiet', 'fix', 'eslint-only', 'stylelint-only'],
      });

      try {
        require.resolve('@umijs/lint/package.json');
      } catch (err) {
        throw new Error(
          '@umijs/lint is not built-in, please install it manually before run umi lint.',
          { cause: err },
        );
      }

      if (args._.length === 0) {
        args._.unshift('{src,test}/**/*.{js,jsx,ts,tsx,less,css}');
      }

      // lazy require for CLI performance
      require('@umijs/lint').default({ cwd: api.cwd }, args);
    },
  });
};
