import { IApi } from '@umijs/types';
import { deepUniq } from './utils';

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
    return deepUniq(api.config?.metas || []);
  });
}
