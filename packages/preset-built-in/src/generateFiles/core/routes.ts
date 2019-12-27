import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async args => {
    const routesTpl = readFileSync(join(__dirname, 'routes.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'core/routes.ts',
      content: Mustache.render(routesTpl, {
        routes: `[]`,
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['routes'],
      source: '@/.umi/core/routes',
    };
  });
}
