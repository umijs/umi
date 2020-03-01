import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'base',
    config: {
      default: '/',
      schema(joi) {
        return joi
          .string()
          .regex(/^\//)
          .error(new Error('config.base must start with /.'));
      },
    },
  });
};
