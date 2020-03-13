import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';

export default function(api: IApi) {
  const {
    utils: { Mustache, lodash },
  } = api;

  api.describe({
    key: 'history',
    config: {
      default: { type: 'browser' },
      schema(joi) {
        const type = joi
          .string()
          .valid('browser', 'hash', 'memory')
          .required();
        return joi.object({
          type,
          options: joi.object(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  api.onGenerateFiles(async () => {
    const historyTpl = readFileSync(join(__dirname, 'history.tpl'), 'utf-8');
    const history = api.config.history!;
    const { type, options = {} } = history;

    api.writeTmpFile({
      path: 'core/history.ts',
      content: Mustache.render(historyTpl, {
        creator: `create${lodash.upperFirst(type)}History`,
        options: JSON.stringify(
          {
            ...options,
            ...(type === 'browser' || type === 'hash'
              ? { basename: api.config.base }
              : {}),
          },
          null,
          2,
        ),
        runtimePath: winPath(require.resolve('@umijs/runtime')),
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['history', 'setCreateHistoryOptions'],
      source: `./history`,
    };
  });
}
