import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { ModelUtils } from './utils/modelUtils';
import { withTmpPath } from './utils/withTmpPath';

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

    // index.tsx
    const indexContent = readFileSync(
      join(__dirname, '../templates/model.tsx'),
      'utf-8',
    ).replace('fast-deep-equal', winPath(require.resolve('fast-deep-equal')));
    api.writeTmpFile({
      path: 'index.tsx',
      content: indexContent,
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React, { useMemo } from 'react';
import { Provider } from './';
import { models as rawModels } from './model';

export function dataflowProvider(container, opts) {
  const models = useMemo(() => {
    return Object.keys(rawModels).reduce((memo, key) => {
      memo[rawModels[key].namespace] = rawModels[key].model;
      return memo;
    }, {});
  }, []);
  return React.createElement(Provider, { ...opts, models }, container);
}
      `,
    });
  });

  api.addTmpGenerateWatcherPaths(() => {
    return [join(api.paths.absSrcPath, 'models')];
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });
};

function getAllModels(api: IApi) {
  return new ModelUtils(api, {
    astTest({ node }) {
      return t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node);
    },
  }).getAllModels();
}
