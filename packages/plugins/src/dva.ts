import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { dirname, extname, join } from 'path';
import { IApi } from 'umi';
import { chalk, glob, winPath } from 'umi/plugin-utils';
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
    memo.dva = {
      pkgPath,
      models,
    };
    return memo;
  });

  api.onGenerateFiles((args) => {
    const models = args.isFirstTime
      ? api.appData.dva.models
      : getAllModels(api);

    models;

    // dva.tsx
    api.writeTmpFile({
      path: 'dva.tsx',
      tpl: `
import dva from 'dva';
import { useRef } from 'react';
import { useAppContext } from 'umi';

export function RootContainer(props: any) {
  const { navigator } = useAppContext();
  const app = useRef();
  if (!app.current) {
    app.current = dva({
      history: navigator,
      initialState: props.initialState,
    });
    app.current.model({
      namespace: 'count',
      state: 0,
    });
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
      api.appData.dva.models.forEach((model: string) => {
        api.logger.info(`  - ${model}`);
      });
    },
  });
};

export function getAllModels(api: IApi) {
  return [
    getModels({
      base: join(api.paths.absSrcPath, 'models'),
      pattern: '**/*.{ts,tsx,js,jsx}',
    }),
    getModels({
      base: join(api.paths.absPagesPath),
      pattern: '**/models/**/*.{ts,tsx,js,jsx}',
    }),
    getModels({
      base: join(api.paths.absPagesPath),
      pattern: '**/model.{ts,tsx,js,jsx}',
    }),
  ];
}

export function getModels(opts: { base: string; pattern?: string }) {
  return glob
    .sync(opts.pattern || '**/*.{ts,js}', {
      cwd: opts.base,
      absolute: true,
    })
    .map(winPath)
    .filter((file) => {
      if (/\.d.ts$/.test(file)) return false;
      if (/\.(test|e2e|spec).([jt])sx?$/.test(file)) return false;
      const content = readFileSync(file, 'utf-8');
      return isModelValid({ content, file });
    });
}

export function isModelValid(opts: { content: string; file: string }) {
  const { file, content } = opts;

  // 标注式声明
  if (content.startsWith('// @dva-model')) return true;

  // transform with esbuild first
  // to reduce unexpected ast problem
  const loader = extname(file).slice(1) as Loader;
  const result = transformSync(content, {
    loader,
    sourcemap: false,
    minify: false,
  });

  // transform with babel
  let ret = false;
  const ast = parser.parse(result.code, {
    sourceType: 'module',
    sourceFilename: file,
    plugins: [],
  });
  traverse(ast, {
    ExportDefaultDeclaration(path: Babel.NodePath<t.ExportDefaultDeclaration>) {
      let node: any = path.node.declaration;
      node = getIdentifierDeclaration(node, path);
      if (isModelObject(node)) {
        ret = true;
      } else if (
        content.includes('dva-model-extend') &&
        t.isCallExpression(node) &&
        node.arguments.length === 2 &&
        isModelObject(node.arguments[1])
      ) {
        ret = true;
      }
    },
  });
  return ret;
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

function getIdentifierDeclaration(node: t.Node, path: Babel.NodePath) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    let bindingNode = path.scope.getBinding(node.name)!.path.node;
    if (t.isVariableDeclarator(bindingNode)) {
      bindingNode = bindingNode.init!;
    }
    return bindingNode;
  }
  return node;
}
