import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { basename, dirname, extname, format, join, relative } from 'path';
import { IApi } from 'umi';
import { glob, winPath } from 'umi/plugin-utils';
import { getIdentifierDeclaration } from './astUtils';

interface IOpts {
  contentTest?: (content: string) => Boolean;
  astTest?: (opts: { node: t.Node; content: string }) => Boolean;
}

export function getNamespace(absFilePath: string, absSrcPath: string) {
  const relPath = winPath(relative(winPath(absSrcPath), winPath(absFilePath)));
  const parts = relPath.split('/');
  const dirs = parts.slice(0, -1);
  const file = parts[parts.length - 1];
  // src/pages/foo/models/bar > foo/bar
  const validDirs = dirs.filter(
    (dir) => !['src', 'pages', 'models'].includes(dir),
  );
  let normalizedFile = file;
  normalizedFile = basename(file, extname(file));
  // foo.model > foo
  if (normalizedFile.endsWith('.model')) {
    normalizedFile = normalizedFile.split('.').slice(0, -1).join('.');
  }
  return [...validDirs, normalizedFile].join('.');
}

export class Model {
  file: string;
  namespace: string;
  id: string;
  exportName: string;
  deps: string[];
  constructor(
    file: string,
    absSrcPath: string,
    sort: {} | undefined,
    id: number,
  ) {
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
    this.namespace = namespace || getNamespace(_file, absSrcPath);
    this.exportName = exportName || 'default';
    this.deps = sort ? this.findDeps(sort) : [];
  }

  findDeps(sort: object) {
    const content = readFileSync(this.file, 'utf-8');

    // transform with esbuild first
    // to reduce unexpected ast problem
    const loader = extname(this.file).slice(1) as Loader;
    const result = transformSync(content, {
      loader,
      sourcemap: false,
      minify: false,
    });

    // transform with babel
    const deps = new Set<string>();
    const ast = parser.parse(result.code, {
      sourceType: 'module',
      sourceFilename: this.file,
      plugins: [],
    });
    // TODO: use sort
    sort;
    traverse(ast, {
      CallExpression: (path: Babel.NodePath<t.CallExpression>) => {
        if (
          t.isIdentifier(path.node.callee, { name: 'useModel' }) &&
          t.isStringLiteral(path.node.arguments[0])
        ) {
          deps.add(path.node.arguments[0].value);
        }
      },
    });
    return [...deps];
  }
}

// Topological Sort

interface TNode {
  namespace: string;
  deps: string[];
  index: number;
  in: number;
  childs: TNode[];
}

const removeChild = (n: TNode, c: TNode) => {
  if (!n || !c) return;
  const idx = n.childs.findIndex(
    (nn: TNode) => nn && nn.namespace === c.namespace,
  );
  if (idx >= 0) {
    delete n.childs[idx];
    c.in--;
  }
};

const topologicalSort = (models: Model[]) => {
  // build depts graph
  const graph: TNode[] = [];
  const indexes: any = {}; // namespace -> Node
  models.forEach((model: Model, index: number) => {
    const node: TNode = {
      namespace: model.namespace,
      deps: model.deps,
      index,
      in: 0,
      childs: [],
    };
    graph.push(node);
    indexes[model.namespace] = node;
  });

  // build edges.
  graph.forEach((node: TNode) => {
    node.deps?.forEach((dep: string) => {
      const depNode = indexes[dep];
      if (depNode) {
        depNode.childs.push(node);
        node.in++;
      }
    });
  });

  const queue: string[] = [];
  while (true) {
    // find first 0 in node;
    const zeronode = graph.find((n: TNode) => {
      return n && n.in === 0;
    });
    if (!zeronode) {
      break;
    }

    queue.push(zeronode.namespace);
    zeronode.childs?.forEach((child: TNode) => {
      removeChild(zeronode, child);
    });
    delete graph[zeronode.index];
  }

  let left = 0;
  graph.map((m: TNode) => m && left++);
  if (left > 0) {
    throw new Error(
      `Duplicate namespace in models: ${graph
        .map((m: TNode) => m && m.namespace)
        .join(', ')}`,
    );
  }

  return queue;
};

export class ModelUtils {
  api: IApi;
  opts: IOpts = {};
  count: number = 1;
  constructor(api: IApi | null, opts: IOpts) {
    this.api = api as IApi;
    this.opts = opts;
  }

  getAllModels(opts: { sort?: object; extraModels: string[] }) {
    // reset count
    this.count = 1;
    const models = [
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
      return new Model(
        file,
        this.api.paths.absSrcPath,
        opts.sort,
        this.count++,
      );
    });
    // check duplicate
    const namespaces = models.map((model) => model.namespace);
    if (new Set(namespaces).size !== namespaces.length) {
      throw new Error(
        `Duplicate namespace in models: ${namespaces.sort().join(', ')}`,
      );
    }
    // sort models by deps
    if (opts.sort) {
      const namespaces: string[] = this.getSortedNamespaces(models);
      models.sort(
        (a, b) =>
          namespaces.indexOf(a.namespace) - namespaces.indexOf(b.namespace),
      );
    }
    return models;
  }

  getSortedNamespaces(models: Model[]) {
    models.forEach((model, index) => {
      const { deps, namespace } = model;
      if (deps && deps.length) {
        const cannotUse = [namespace];
        for (let i = 0; i <= index; i += 1) {
          if (models[i].deps.filter((v) => cannotUse.includes(v)).length) {
            if (!cannotUse.includes(models[i].namespace)) {
              cannotUse.push(models[i].namespace);
              i = -1;
            }
          }
        }
        const errorList = deps.filter((v) => cannotUse.includes(v));
        if (errorList.length) {
          throw Error(
            `Circular dependencies: ${namespace} can't use ${errorList.join(
              ', ',
            )}`,
          );
        }
      }
    });

    const sorted = topologicalSort(models);
    return sorted;
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
      const fileWithoutExt = winPath(
        format({
          dir: dirname(model.file),
          base: basename(model.file, extname(model.file)),
        }),
      );
      if (model.exportName !== 'default') {
        imports.push(
          `import { ${model.exportName} as ${model.id} } from '${fileWithoutExt}';`,
        );
      } else {
        imports.push(`import ${model.id} from '${fileWithoutExt}';`);
      }
      modelProps.push(
        `${model.id}: { namespace: '${model.namespace}', model: ${model.id} },`,
      );
    });
    return `
${imports.join('\n')}

export const models = {
${modelProps.join('\n')}
} as const`;
  }
}
