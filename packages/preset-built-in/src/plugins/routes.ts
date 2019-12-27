import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.describe({
    key: 'routes',
    config: {
      schema(joi) {
        // TODO: more specific
        return joi.array().items(joi.object());
      },
    },
  });
}
