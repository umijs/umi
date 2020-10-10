import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'copy',
    config: {
      schema(joi) {
        return joi.array().items(
          joi.alternatives(
            joi.object({
              from: joi.string(),
              to: joi.string(),
            }),
            joi.string(),
          ),
        );
      },
    },
  });
};
