import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { winPath } from '@umijs/utils';
import { join, relative } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { chalk } from 'umi/plugin-utils';
import { Model, ModelUtils } from './utils/modelUtils';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  const pkgPath = join(__dirname, '../libs/dva.ts');

  api.describe({
    config: {
      schema(Joi) {
        return Joi.alternatives().try(
          Joi.object({
            extraModels: Joi.array().items(Joi.string()),
            immer: Joi.object(),
          }),
          Joi.boolean().invalid(true),
        );
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

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
export interface IRuntimeConfig {
  dva?: {
    config?: {
        initialState?: Record<string, any>;
        onError?: any;
        onStateChange?: any;
        onAction?: any;
        onHmr?: any;
        onReducer?: any;
        onEffect?: any;
        extraReducers?: any;
        extraEnhancers?: any;
        [key: string]: any;
    },
    plugins?: string[];
  }
}
      `,
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
import { history, ApplyPluginsType, useAppData } from 'umi';
import { models } from './models';

let dvaApp: any;

export function RootContainer(props: any) {
  const { pluginManager } = useAppData();
  const app = useRef<any>();
  const runtimeDva = pluginManager.applyPlugins({
    key: 'dva',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  if (!app.current) {
    app.current = create(
      {
        history,
        ...(runtimeDva.config || {}),
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
    dvaApp = app.current;
    app.current.use(createLoading());
    ${api.config.dva?.immer ? `app.current.use(dvaImmer());` : ''}
    ${api.config.dva?.immer?.enableES5 ? `enableES5();` : ''}
    ${api.config.dva?.immer?.enableAllPlugins ? `enableAllPlugins();` : ''}
    (runtimeDva.plugins || []).forEach((p) => {
      app.current.use(p);
    });
    for (const id of Object.keys(models)) {
      app.current.model({
        namespace: models[id].namespace,
        ...models[id].model,
      });
    }
    app.current.start();
  }
  return <Provider store={app.current!._store}>{props.children}</Provider>;
}

export function getDvaApp() {
  return dvaApp;
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
export { connect, useDispatch, useStore, useSelector } from 'dva';
export { getDvaApp } from './dva';
`,
    });
  });

  api.addTmpGenerateWatcherPaths(() => {
    return [join(api.paths.absSrcPath, 'models')];
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addRuntimePluginKey(() => ['dva']);

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
