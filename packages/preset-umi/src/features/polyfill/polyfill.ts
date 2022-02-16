import { transform } from '@umijs/bundler-utils/compiled/babel/core';
import { getCorejsVersion, winPath } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'polyfill',
    config: {
      schema(Joi) {
        return Joi.object().keys({
          imports: Joi.array().items(Joi.string()).required().unique(),
        });
      },
    },
    enableBy: () => {
      return process.env.BABEL_POLYFILL !== 'none';
    },
  });

  api.onGenerateFiles(() => {
    const coreJsImports = api.config.polyfill?.imports
      ? api.config.polyfill?.imports
          .map((item: string) => `import '${item}';`)
          .join('\n')
      : `import 'core-js';`;
    const { code } = transform(
      `
${coreJsImports}
import '${winPath(require.resolve('regenerator-runtime/runtime'))}';
export {};
`,
      {
        filename: 'polyfill.ts',
        presets: [
          [
            require.resolve('@umijs/bundler-utils/compiled/babel/preset-env'),
            {
              useBuiltIns: 'entry',
              corejs: getCorejsVersion(
                join(__dirname, '../../../package.json'),
              ),
              modules: false,
              targets: api.config.targets,
            },
          ],
        ],
        plugins: [
          require.resolve('@umijs/babel-preset-umi/dist/plugins/lockCoreJS'),
        ],
      },
    )!;
    api.writeTmpFile({
      path: 'core/polyfill.ts',
      noPluginDir: true,
      content: code!,
    });
  });

  api.addPolyfillImports(() => [{ source: `./core/polyfill` }]);

  api.modifyConfig((memo) => {
    memo.alias['regenerator-runtime'] = dirname(
      require.resolve('regenerator-runtime/package'),
    );
    return memo;
  });
};
