import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    paths,
    utils: { Mustache, lodash },
  } = api;

  api.describe({
    key: 'history',
    config: {
      default: { type: 'browser' },
      schema(joi) {
        const type = joi.string().allow('browser', 'hash', 'memory');
        return joi.alternatives().try(
          type,
          joi.object({
            type,
            options: joi.object(),
          }),
        );
      },
    },
  });

  api.onGenerateFiles(async () => {
    const historyTpl = readFileSync(join(__dirname, 'history.tpl'), 'utf-8');
    const history = api.config!.history || 'browser';
    const { type, options = {} } =
      typeof history === 'string' ? { type: history } : history;

    api.writeTmpFile({
      path: 'core/history.ts',
      content: Mustache.render(historyTpl, {
        creator: `create${lodash.upperFirst(type)}History`,
        userOptions: JSON.stringify(options, null, 2),
        runtimePath: require.resolve('@umijs/runtime'),
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['history'],
      source: '@/.umi/core/history',
    };
  });
}
