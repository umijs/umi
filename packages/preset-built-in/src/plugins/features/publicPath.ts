import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'publicPath',
    config: {
      default: '/',
      schema(joi) {
        return joi
          .string()
          .regex(/\/$/)
          .error(new Error('config.publicPath must end with /.'));
      },
    },
  });
};
