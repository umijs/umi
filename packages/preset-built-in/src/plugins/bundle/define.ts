import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'targets',
    config: {
      schema(joi) {
        return joi.object().pattern(/.+/, joi.number());
      },
    },
  });
};
