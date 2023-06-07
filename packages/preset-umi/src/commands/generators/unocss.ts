import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper, getUmiJsPlugin } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:unocss',
  });

  api.registerGenerator({
    key: 'unocss',
    name: 'Enable Uno CSS',
    description: 'Setup Uno CSS configuration',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !api.config.unocss;
    },
    disabledDescription: () =>
      `unocss has been enabled; you can remove \`unocss\` fields in ${api.appData.mainConfigFile} then run this to re-setup`,
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        unocss: '^0.34.1',
      });

      // max preset 内置了 unocss plugin
      if (api.appData?.umi?.cliName !== 'max') {
        h.addDevDeps({
          '@umijs/plugins': getUmiJsPlugin(),
        });
      }

      h.setUmirc('unocss', {});
      h.appendInternalPlugin('@umijs/plugins/dist/unocss');
      logger.info('Update .umirc.ts');

      writeFileSync(
        join(api.cwd, 'uno.config.ts'),
        `
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify(),
    presetIcons(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
      },
    }),
    presetUno(),
  ],
  shortcuts: [
    [
      'btn',
      'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    ],
  ],
});
`.trimStart(),
      );
      logger.info('Write uno.config.ts');
      h.installDeps();
    },
  });
};
