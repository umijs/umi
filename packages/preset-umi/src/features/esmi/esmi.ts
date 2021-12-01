import { join } from 'path';
import { createResolver, scan } from '../../libs/scan';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'esmi',
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onStart(() => {
    if (!api.args.vite) {
      throw new Error(`esmi can only be used in vite mode.`);
    }
  });

  // 需要在 generate 之后是因为需要先等临时文件生成
  api.onBeforeCompiler(async () => {
    // scan and module graph
    // TODO: module graph
    if (api.args.vite) {
      const resolver = createResolver({
        alias: api.config.alias,
      });
      api.appData.deps = await scan({
        entry: join(api.paths.absTmpPath, 'umi.ts'),
        externals: api.config.externals,
        resolver,
      });
    }
  });
};
