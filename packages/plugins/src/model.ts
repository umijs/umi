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
        return Joi.object({
          extraModels: Joi.array().items(Joi.string()),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData(async (memo) => {
    const models = await getAllModels(api);
    memo.pluginModel = {
      models,
    };
    return memo;
  });

  api.onGenerateFiles(async (args) => {
    const models = args.isFirstTime
      ? api.appData.pluginModel.models
      : await getAllModels(api);

    // model.ts
    api.writeTmpFile({
      path: 'model.ts',
      content: ModelUtils.getModelsContent(models),
    });

    // index.tsx
    const indexContent = readFileSync(
      join(__dirname, '../libs/model.tsx'),
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
import React  from 'react';
import { Provider } from './';
import { models as rawModels } from './model';

function ProviderWrapper(props: any) {
  const models = React.useMemo(() => {
    return Object.keys(rawModels).reduce((memo, key) => {
      memo[rawModels[key].namespace] = rawModels[key].model;
      return memo;
    }, {});
  }, []);
  return <Provider models={models} {...props}>{ props.children }</Provider>
}

export function dataflowProvider(container, opts) {
  return <ProviderWrapper {...opts}>{ container }</ProviderWrapper>;
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

async function getAllModels(api: IApi) {
  const extraModels = await api.applyPlugins({
    key: 'addExtraModels',
    type: api.ApplyPluginsType.add,
    initialValue: [],
  });
  return new ModelUtils(api, {
    astTest({ node }) {
      return t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node);
    },
  }).getAllModels({
    extraModels: [...extraModels, ...(api.config.model.extraModels || [])],
  });
}
