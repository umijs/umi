import { chalk, importLazy } from '@umijs/utils';
import { IApi } from '../../types';
import babelPlugin from './babelPlugin';
import CodeFrameError from './CodeFrameError';

const babelCodeFrame: typeof import('@umijs/bundler-utils/compiled/babel/code-frame') =
  importLazy(require.resolve('@umijs/bundler-utils/compiled/babel/code-frame'));

export default (api: IApi) => {
  api.addBeforeBabelPresets(() => {
    return [
      {
        plugins: [
          [
            babelPlugin,
            {
              cwd: api.cwd,
              absTmpPath: api.paths.absTmpPath,
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
                      `\n${babelCodeFrame.codeFrameColumns(
                        args.code,
                        err.location,
                        {
                          highlightCode: true,
                          message: err.message,
                        },
                      )}\n`,
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
