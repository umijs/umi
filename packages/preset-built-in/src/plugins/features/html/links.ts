import { IHTMLTag } from '@umijs/core';
import { IApi } from '@umijs/types';
import { deepUniq } from './utils';

export default function (api: IApi) {
  api.describe({
    key: 'links',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLLinks(() => {
    return deepUniq(api.config?.links || []) as IHTMLTag[];
  });
}
