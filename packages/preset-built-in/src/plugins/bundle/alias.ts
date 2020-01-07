import { IApi } from '@umijs/types';

export default (api: IApi) => {
  const { paths } = api;

  api.describe({
    key: 'alias',
    config: {
      schema(joi) {
        return joi.object().pattern(/.+/, joi.string());
      },
      default: {
        '@': paths.absSrcPath,
      },
    },
  });
};
