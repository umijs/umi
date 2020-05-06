import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'proxy',
    config: {
      onChange: () => {
        const service = api.getServer();
        if (service) {
          // refrest proxy service
          service.setupProxy(api.config.proxy, true);
        }
      },
      schema(joi) {
        return joi.object();
      },
    },
  });
};
