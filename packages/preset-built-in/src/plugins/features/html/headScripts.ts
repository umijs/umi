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

  // ensure userConfig headScripts add the front of `devScripts.ts`
  api.addHTMLHeadScripts({
    fn: () => {
      return getScripts(api.config?.headScripts || []);
    },
    stage: -1,
  });
}
