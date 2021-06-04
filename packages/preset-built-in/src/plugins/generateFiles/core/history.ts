import { IApi } from '@umijs/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runtimePath } from '../constants';

export default function (api: IApi) {
  const {
    utils: { Mustache, lodash },
  } = api;

  api.describe({
    key: 'history',
    config: {
      default: { type: 'browser' },
      schema(joi) {
        const type = joi.string().valid('browser', 'hash', 'memory').required();
        return joi.object({
          type,
          options: joi.object(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  api.onGenerateFiles(async () => {
    const historyTpl = readFileSync(
      join(
        __dirname,
        // @ts-ignore
        api.config.runtimeHistory
          ? 'history.runtime.tpl'
          : api.config.history === false
          ? 'history.sham.tpl'
          : 'history.tpl',
      ),
      'utf-8',
    );
    const history = api.config.history!;

    // history 不可能为 false，这里是为了 ts 编译
    if (!history) return;

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
        runtimePath,
      }),
    });
  });

  api.addUmiExports(() => {
    // @ts-ignore
    if (api.config.history === false) return [];

    if (api.config.runtimeHistory) {
      return {
        specifiers: [
          'history',
          'setCreateHistoryOptions',
          'getCreateHistoryOptions',
        ],
        source: `./history`,
      };
    }

    return {
      specifiers: ['history'],
      source: `./history`,
    };
  });
}
