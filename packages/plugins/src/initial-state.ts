import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });
};
