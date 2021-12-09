import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { extname, join } from 'path';
import { IApi } from 'umi';
import { glob, winPath } from 'umi/plugin-utils';
import { getIdentifierDeclaration } from './utils/getIdentifierDeclaration';

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
      ? api.appData.pluginDva.models
      : getAllModels(api);
    models;
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
      if (t.isArrowFunctionExpression(node) || t.isFunctionDeclaration(node)) {
        ret = true;
      }
    },
  });

  return ret;
}
