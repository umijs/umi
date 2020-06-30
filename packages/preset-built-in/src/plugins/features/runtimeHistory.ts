import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'runtimeHistory',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    onChange: api.ConfigChangeType.regenerateTmpFiles,
  });
};
