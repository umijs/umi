import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async args => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {}),
    });
  });
}
