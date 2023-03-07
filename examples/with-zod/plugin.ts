import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'hello',
    config: {
      schema({ zod }) {
        return zod.object({
          abc: zod.array(zod.string().max(22)),
          bc: zod.optional(zod.number()),
        });
      },
    },
  });
};
