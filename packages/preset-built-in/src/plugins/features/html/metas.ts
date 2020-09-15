import { IApi } from '@umijs/types';

export default function (api: IApi) {
  api.describe({
    key: 'metas',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLMetas(() => {
    return api.config?.metas || [];
  });
}
