import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { IApi } from 'umi';
import { ModelUtils } from './utils/modelUtils';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    const models = getAllModels(api);
    memo.pluginModel = {
      models,
    };
    return memo;
  });

  api.onGenerateFiles((args) => {
    const models = args.isFirstTime
      ? api.appData.pluginModel.models
      : getAllModels(api);

    // model.ts
    api.writeTmpFile({
      path: 'model.ts',
      content: ModelUtils.getModelsContent(models),
    });
  });
};

function getAllModels(api: IApi) {
  return new ModelUtils(api, {
    astTest({ node }) {
      return t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node);
    },
  }).getAllModels();
}
