import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { winPath, resolve } from '@umijs/utils';

export default (api: IApi) => {
  const { paths, pkg, cwd } = api;

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
    return require.resolve('@umijs/renderer-mpa');
  });

  api.modifyDefaultConfig((memo) => {
    memo.exportStatic = {
      htmlSuffix: true,
    };
    // @ts-ignore
    memo.history = false;
    return memo;
  });

  api.modifyHTML((memo, { route }) => {
    memo('head').prepend(`<script>window.g_path = '${route.path}';</script>`);
    return memo;
  });
};
