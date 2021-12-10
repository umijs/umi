import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { dirname, join, relative } from 'path';
import { IApi } from 'umi';
import { chalk } from 'umi/plugin-utils';
import { Model, ModelUtils } from './utils/modelUtils';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  const pkgPath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'dva',
    }) || dirname(require.resolve('dva/package.json'));

  api.describe({
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    const version = require(`${pkgPath}/package.json`).version;
    memo.dva = {
      pkgPath,
      version,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    // import from dva
    memo.alias.dva = pkgPath;
    return memo;
  });

  api.modifyAppData((memo) => {
    const models = getAllModels(api);
    memo.pluginDva = {
      pkgPath,
      models,
    };
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
import dva from 'dva';
import { useRef } from 'react';
import { useAppContext } from 'umi';
import { models } from './models';

export function RootContainer(props: any) {
  const { navigator } = useAppContext();
  const app = useRef();
  if (!app.current) {
    app.current = dva({
      history: navigator,
      initialState: props.initialState,
    });
    for (const id of Object.keys(models)) {
      app.current.model(models[id].model);
    }
    app.current.router(() => props.children);
  }
  return app.current.start()();
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
  return getModelUtil(api).getAllModels();
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
