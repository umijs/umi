import { IApi } from '@umijs/types';
import { deepUniq, IHTMLTag } from './utils';

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
    return deepUniq(api.config?.metas || []) as IHTMLTag[];
  });
}
