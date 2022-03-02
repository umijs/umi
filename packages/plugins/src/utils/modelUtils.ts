import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { IApi } from 'umi';
import { glob, winPath } from 'umi/plugin-utils';
import { getIdentifierDeclaration } from './astUtils';

interface IOpts {
  contentTest?: (content: string) => Boolean;
  astTest?: (opts: { node: t.Node; content: string }) => Boolean;
}

export class Model {
  file: string;
  namespace: string;
  id: string;
  exportName: string;
  constructor(file: string, id: number) {
    let namespace;
    let exportName;
    const [_file, meta] = file.split('#');
    if (meta) {
      const metaObj: Record<string, string> = JSON.parse(meta);
      namespace = metaObj.namespace;
      exportName = metaObj.exportName;
    }
    this.file = _file;
    this.id = `model_${id}`;
    this.namespace = namespace || basename(file, extname(file));
    this.exportName = exportName || 'default';
  }
}

export class ModelUtils {
  api: IApi;
  opts: IOpts = {};
  count: number = 1;
  constructor(api: IApi | null, opts: IOpts) {
    this.api = api as IApi;
    this.opts = opts;
  }

  getAllModels(opts: { extraModels: string[] }) {
    // reset count
    this.count = 1;
    return [
      ...this.getModels({
        base: join(this.api.paths.absSrcPath, 'models'),
        pattern: '**/*.{ts,tsx,js,jsx}',
      }),
      ...this.getModels({
        base: join(this.api.paths.absPagesPath),
        pattern: '**/models/**/*.{ts,tsx,js,jsx}',
      }),
      ...this.getModels({
        base: join(this.api.paths.absPagesPath),
        pattern: '**/model.{ts,tsx,js,jsx}',
      }),
      ...opts.extraModels,
    ].map((file: string) => {
      return new Model(file, this.count++);
    });
  }

  getModels(opts: { base: string; pattern?: string }) {
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
        return this.isModelValid({ content, file });
      });
  }

  isModelValid(opts: { content: string; file: string }) {
    const { file, content } = opts;

    if (this.opts.contentTest && this.opts.contentTest(content)) {
      return true;
    }

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
      ExportDefaultDeclaration: (
        path: Babel.NodePath<t.ExportDefaultDeclaration>,
      ) => {
        let node: any = path.node.declaration;
        node = getIdentifierDeclaration(node, path);
        if (this.opts.astTest && this.opts.astTest({ node, content })) {
          ret = true;
        }
      },
    });

    return ret;
  }

  static getModelsContent(models: Model[]) {
    const imports: string[] = [];
    const modelProps: string[] = [];
    models.forEach((model) => {
      if (model.exportName !== 'default') {
        imports.push(
          `import { ${model.exportName} as ${model.id} } from '${model.file}';`,
        );
      } else {
        imports.push(`import ${model.id} from '${model.file}';`);
      }
      modelProps.push(
        `${model.id}: { namespace: '${model.namespace}', model: ${model.id} },`,
      );
    });
    return `
${imports.join('\n')}

export const models = {
${modelProps.join('\n')}
}`;
  }
}
