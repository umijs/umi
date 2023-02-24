import { codeFrameColumns } from '@umijs/bundler-utils/compiled/babel/code-frame';
import { chalk, resolve as resolveModule } from '@umijs/utils';
import { resolve } from 'path';
import { IApi } from '../../types';
import babelPlugin from './babelPlugin';
import CodeFrameError from './CodeFrameError';

export default (api: IApi) => {
  api.addBeforeBabelPresets(() => {
    const localLinkedNodeModules = Object.keys(
      Object.assign(
        {},
        api.pkg?.dependencies,
        api.pkg?.devDependencies,
        api.pkg?.peerDependencies,
      ),
    )
      .map((pkg) => {
        try {
          return resolve(
            resolveModule.sync(`${pkg}/package.json`, {
              basedir: api.cwd,
              preserveSymlinks: false,
            }),
            '../',
          );
        } catch {
          // will be filtered below
          return api.cwd;
        }
      })
      .filter((pkg: string) => !pkg.startsWith(api.paths.absNodeModulesPath));

    return [
      {
        plugins: [
          [
            babelPlugin,
            {
              cwd: api.cwd,
              absTmpPath: api.paths.absTmpPath,
              localLinkedNodeModules,
              onCheckCode({ args }: any) {
                try {
                  api.applyPlugins({
                    key: 'onCheckCode',
                    args: {
                      ...args,
                      CodeFrameError,
                    },
                    sync: true,
                  });
                } catch (err) {
                  if (err instanceof CodeFrameError) {
                    // throw with babel code frame error
                    throw new Error(
                      `\n${codeFrameColumns(args.code, err.location, {
                        highlightCode: true,
                        message: err.message,
                      })}\n`,
                      { cause: err },
                    );
                  } else if (err instanceof Error) {
                    // throw normal error with red text color
                    throw new Error(chalk.redBright(err.message));
                  } else {
                    // log error
                    api.logger.error(err);
                  }
                }
              },
            },
          ],
        ],
      },
    ];
  });
};
