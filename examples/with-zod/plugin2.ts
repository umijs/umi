import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'hello1',
    config: {
      schema({ zod }) {
        return zod.object({
          ha: zod.optional(zod.number().min(4)),
        });
      },
    },
  });
};
