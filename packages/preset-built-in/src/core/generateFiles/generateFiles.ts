import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    paths,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(args => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {}),
    });

    const pluginTpl = readFileSync(join(__dirname, 'plugin.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'plugin.ts',
      content: Mustache.render(pluginTpl, {
        validKeys: ['patchRoutes', 'rootContainer', 'render'],
      }),
    });
  });
}
