import { IApi } from '../../src/types';

export default (api: IApi) => {
  api.describe({
    key: 'abc',
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
    },
  });
};
