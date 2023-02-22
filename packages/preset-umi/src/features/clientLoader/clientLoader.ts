import type { IApi } from '../../types';
import {
  generateRouteExportTmpFile,
  setupExportExtractBuilder,
} from '../../utils/routeExportExtractor';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    generateRouteExportTmpFile(api, 'clientLoader', 'core/loaders.ts');
  });

  // 把 core/loader.ts (在 tmpFile.ts 的 onGenerateFiles 产生的) 编译成 core/loader.js
  // core/loader.js 会被 core/route.ts 引用，将每个 route 的 clientLoader 注入进去
  api.onBeforeCompiler(() =>
    setupExportExtractBuilder(api, 'core/loaders.ts', 'core/loaders.js'),
  );
};
