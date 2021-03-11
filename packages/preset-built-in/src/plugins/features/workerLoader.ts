import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'workerLoader',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
  });
};
