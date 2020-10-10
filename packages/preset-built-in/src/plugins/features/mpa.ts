import { IApi } from '@umijs/types';
import { dirname } from 'path';

export default (api: IApi) => {
  api.describe({
    key: 'mpa',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyRendererPath(() => {
    return dirname(require.resolve('@umijs/renderer-mpa/package.json'));
  });

  api.modifyDefaultConfig((memo) => {
    // 默认导出 html，并且用 htmlSuffix
    memo.exportStatic = {
      htmlSuffix: true,
    };

    // 禁用 history 功能
    // @ts-ignore
    memo.history = false;
    return memo;
  });

  api.modifyHTML((memo, { route }) => {
    memo('head').append(`<script>window.g_path = '${route.path}';</script>`);
    return memo;
  });
};
