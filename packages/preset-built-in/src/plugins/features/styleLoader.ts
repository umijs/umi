import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'styleLoader',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
