import { DEFAULT_BROWSER_TARGETS } from '@umijs/bundler-webpack/dist/constants';
import { getCorejsVersion, importLazy, winPath } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  const babelCore: typeof import('@umijs/bundler-utils/compiled/babel/core') =
    importLazy(require.resolve('@umijs/bundler-utils/compiled/babel/core'));

  api.describe({
    key: 'polyfill',
    config: {
      schema({ zod }) {
        return zod.object({
          imports: zod.array(zod.string()).optional(),
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
    const { transform } = babelCore;
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
              ignoreBrowserslistConfig: true,
            },
          ],
        ],
        plugins: [
          require.resolve('@umijs/babel-preset-umi/dist/plugins/lockCoreJS'),
        ],
        babelrc: false,
        configFile: false,
        browserslistConfigFile: false,
      },
    )!;

    api.writeTmpFile({
      path: 'core/polyfill.ts',
      noPluginDir: true,
      content: excludeMathPolyfillInQiankun(code!),
    });
  });

  api.addPolyfillImports(() => [{ source: `./core/polyfill` }]);

  api.modifyConfig((memo) => {
    memo.targets ||= DEFAULT_BROWSER_TARGETS;

    memo.alias['regenerator-runtime'] = dirname(
      require.resolve('regenerator-runtime/package'),
    );
    return memo;
  });

  // Prevent some `esnext.math.xxx` constant multiple over write in qiankun
  // https://github.com/zloirock/core-js/issues/1091
  function excludeMathPolyfillInQiankun(code: string) {
    if (!api.config.qiankun) {
      return code;
    }

    const EXCLUDE_POLYFILLS = [
      'esnext.math.deg-per-rad',
      'esnext.math.rad-per-deg',
    ];
    const lines = code.split('\n');
    return lines
      .filter((line) => {
        return !EXCLUDE_POLYFILLS.some((i) => line.includes(i));
      })
      .join('\n');
  }
};
