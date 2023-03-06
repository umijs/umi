import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'hello1',
    config: {
      schema(_, z) {
        return z.object({
          ha: z.optional(z.number().min(4)),
        });
      },
    },
  });
};
