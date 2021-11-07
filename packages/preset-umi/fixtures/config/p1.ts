import { IApi } from '../../src/types';

export default (api: IApi) => {
  api.describe({
    key: 'abc',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
  });
};
