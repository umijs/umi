import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    env,
    paths,
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async args => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {
        rendererPath: require.resolve('@umijs/renderer-react'),
        runtimePath: require.resolve('@umijs/runtime'),
        aliasedTmpPath: paths.aliasedTmpPath,
      }),
    });
  });
}
