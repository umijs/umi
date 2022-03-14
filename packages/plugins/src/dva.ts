import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { join, relative } from 'path';
import { IApi } from 'umi';
import { chalk } from 'umi/plugin-utils';
import { Model, ModelUtils } from './utils/modelUtils';
import { withTmpPath } from './utils/withTmpPath';
import { winPath } from '@umijs/utils';

export default (api: IApi) => {
  const pkgPath = join(__dirname, '../libs/dva.ts');

  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          extraModels: Joi.array().items(Joi.string()),
          immer: Joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    const models = getAllModels(api);
    memo.pluginDva = {
      pkgPath,
      models,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    // import from dva
    memo.alias['dva$'] = pkgPath;
    return memo;
  });

  api.onGenerateFiles((args) => {
    const models = args.isFirstTime
      ? api.appData.pluginDva.models
      : getAllModels(api);

    // models.ts
    api.writeTmpFile({
      path: 'models.ts',
      content: ModelUtils.getModelsContent(models),
    });

    // dva.tsx
    api.writeTmpFile({
      path: 'dva.tsx',
      tpl: `
// It's faked dva
// aliased to @umijs/plugins/templates/dva
import { create, Provider } from 'dva';
import createLoading from '${winPath(require.resolve('dva-loading'))}';
${
  api.config.dva?.immer
    ? `
import dvaImmer, { enableES5, enableAllPlugins } from '${winPath(
        require.resolve('dva-immer'),
      )}';
`
    : ''
}
import React, { useRef } from 'react';
import { history } from 'umi';
import { models } from './models';

export function RootContainer(props: any) {
  const app = useRef<any>();
  if (!app.current) {
    app.current = create(
      {
        history,
      },
      {
        initialReducer: {},
        setupMiddlewares(middlewares: Function[]) {
          return [...middlewares];
        },
        setupApp(app: IDvaApp) {
          app._history = history;
        },
      },
    );
    app.current.use(createLoading());
    ${api.config.dva?.immer ? `app.current.use(dvaImmer());` : ''}
    ${api.config.dva?.immer?.enableES5 ? `enableES5();` : ''}
    ${api.config.dva?.immer?.enableAllPlugins ? `enableAllPlugins();` : ''}
    for (const id of Object.keys(models)) {
      app.current.model(models[id].model);
    }
    app.current.start();
  }
  return <Provider store={app.current!._store}>{props.children}</Provider>;
}
      `,
      context: {},
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import { RootContainer } from './dva';

export function dataflowProvider(container, opts) {
  return React.createElement(RootContainer, opts, container);
}
      `,
    });

    // index.ts for export
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export { connect, useDispatch, useStore, useSelector } from 'dva';`,
    });
  });

  api.addTmpGenerateWatcherPaths(() => {
    return [join(api.paths.absSrcPath, 'models')];
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  // dva list model
  api.registerCommand({
    name: 'dva',
    fn() {
      api.logger.info(chalk.green.bold('dva models'));
      api.appData.pluginDva.models.forEach((model: Model) => {
        api.logger.info(`  - ${relative(api.cwd, model.file)}`);
      });
    },
  });
};

export function getModelUtil(api: IApi | null) {
  return new ModelUtils(api, {
    contentTest(content) {
      return content.startsWith('// @dva-model');
    },
    astTest({ node, content }) {
      if (isModelObject(node)) {
        return true;
      } else if (
        content.includes('dva-model-extend') &&
        t.isCallExpression(node) &&
        node.arguments.length === 2 &&
        isModelObject(node.arguments[1])
      ) {
        return true;
      }
      return false;
    },
  });
}

export function getAllModels(api: IApi) {
  return getModelUtil(api).getAllModels({
    extraModels: [...(api.config.dva.extraModels || [])],
  });
}

function isModelObject(node: t.Node) {
  return (
    t.isObjectExpression(node) &&
    node.properties.some((property) => {
      return [
        'state',
        'reducers',
        'subscriptions',
        'effects',
        'namespace',
      ].includes((property as any).key.name);
    })
  );
}
