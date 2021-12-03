import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { dirname, extname } from 'path';
import { IApi } from 'umi';
import utils from 'umi/plugin-utils';
import { resolveProjectDep } from './utils/resolveProjectDep';

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

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'plugin-dva.ts',
      content: ``,
    });
  });

  // model register
  // container
  // dva list model
};

export function getModels(opts: { base: string; pattern?: string }) {
  return utils.glob
    .sync(opts.pattern || '**/*.{ts,js}', {
      cwd: opts.base,
      absolute: true,
    })
    .map(utils.winPath)
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
