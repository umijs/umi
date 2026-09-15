import { yParser } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'lint',
    description: 'lint source code using eslint and stylelint, or utoo-lint',
    configResolveMode: 'loose',
    details: `
umi lint

# lint for specific files, default is "{src,test}/**/*.{js,jsx,ts,tsx,less}"
umi lint "**/*.{ts,scss}"

# lint eslint-only or stylelint-only
umi lint --eslint-only
umi lint --stylelint-only

# opt in to standalone utoo-lint (requires @utoo/lint)
umi lint --utlint
umi lint --utlint --fix src
umi lint --utlint migrate eslint --from .eslintrc.js

# automatically fix, where possible
umi lint --fix

# disable reporting on warnings
umi lint --quiet
`,
    fn: async function () {
      // re-parse cli args to process boolean flags, for get the lint-staged args
      const rawArgs = process.argv.slice(3);
      const args = yParser(rawArgs, {
        boolean: ['quiet', 'fix', 'eslint-only', 'stylelint-only', 'utlint'],
      });

      if (args.utlint) {
        if (args.eslintOnly || args.stylelintOnly || args.cssinjs) {
          throw new Error(
            '--utlint cannot be combined with --eslint-only, --stylelint-only or --cssinjs. Run stylelint separately with umi lint --stylelint-only.',
          );
        }

        // Preserve native options, subcommands and the end-of-options marker.
        const forwardedArgs = [...rawArgs];
        for (let i = 0; i < forwardedArgs.length; i++) {
          if (forwardedArgs[i] === '--') break;
          if (/^--(?:no-)?utlint(?:=.*)?$/.test(forwardedArgs[i])) {
            const count =
              forwardedArgs[i] === '--utlint' &&
              /^(true|false)$/.test(forwardedArgs[i + 1] || '')
                ? 2
                : 1;
            forwardedArgs.splice(i, count);
            i--;
          }
        }
        return require('./lint/utlint').runUtlint(api.cwd, forwardedArgs);
      }

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
