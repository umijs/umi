import { IApi } from '@umijs/types';
import { getScripts } from './utils';

export default function (api: IApi) {
  api.describe({
    key: 'headScripts',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLHeadScripts(() => {
    return getScripts(api.config?.headScripts || []);
  });
}
