import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'hello',
    config: {
      schema(_, z) {
        return z.object({
          abc: z.array(z.string().max(22)),
          bc: z.optional(z.number()),
        });
      },
    },
  });
};
