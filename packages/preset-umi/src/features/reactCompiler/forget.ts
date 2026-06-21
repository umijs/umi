import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'forget',
    config: {
      schema({ zod }) {
        return zod.union([
          zod.boolean(),
          zod
            .object({
              ReactCompilerConfig: zod.record(zod.any()).optional(),
            })
            .partial(),
        ]);
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onStart(() => {
    api.logger.warn(
      '`forget` is deprecated. Please use `reactCompiler` instead.',
    );
  });
};
