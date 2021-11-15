import { IApi } from '../../types';
import babelPlugin from './babelPlugin';

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
                api.applyPlugins({
                  key: 'onCheckCode',
                  args: args,
                });
              },
            },
          ],
        ],
      },
    ];
  });
};
