import * as t from '@umijs/bundler-utils/compiled/babel/types';
import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { lodash, winPath } from 'umi/plugin-utils';
import { Model, ModelUtils } from './utils/modelUtils';
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

  api.onGenerateFiles(async (args) => {
    const models = args.isFirstTime
      ? api.appData.pluginModel.models
      : getAllModels(api);

    const extraModels = (
      await api.applyPlugins({
        key: 'addExtraModels',
        type: api.ApplyPluginsType.add,
        initialValue: [],
      })
    ).map((opts: any) => {
      assert(
        lodash.isPlainObject(opts) && opts.file && opts.id,
        `extra model should be plain object with file and id property, but got ${opts}`,
      );
      return new Model(opts.file, opts.id);
    });

    // model.ts
    api.writeTmpFile({
      path: 'model.ts',
      content: ModelUtils.getModelsContent([...models, ...extraModels]),
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

function getAllModels(api: IApi) {
  return new ModelUtils(api, {
    astTest({ node }) {
      return t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node);
    },
  }).getAllModels();
}
