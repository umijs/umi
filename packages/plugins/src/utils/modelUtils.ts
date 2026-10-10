import { prettyPrintEsBuildErrors } from '@umijs/bundler-utils';
import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import {
  Loader,
  transformSync as transformSync2,
  type TransformResult,
} from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { basename, dirname, extname, format, join, relative } from 'path';
import { IApi } from 'umi';
import { chalk, glob, winPath } from 'umi/plugin-utils';
import { getIdentifierDeclaration } from './astUtils';

export function transformSync(content: any, opts: any) {
  if (!opts.tsconfig && !opts.tsconfigRaw) {
    opts.tsconfigRaw = { compilerOptions: { experimentalDecorators: true } };
  }
  return transformSync2(content, opts);
}

interface IOpts {
  contentTest?: (content: string) => Boolean;
  astTest?: (opts: { node: t.Node; content: string }) => Boolean;
}

interface ITopologicalNode {
  namespace: string;
  deps: string[];
  index: number;
  in: number;
  childs: ITopologicalNode[];
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

function unwrapTSNode(node: t.Node): t.Node {
  if (t.isTSAsExpression(node) || t.isTSTypeAssertion(node)) {
    return unwrapTSNode(node.expression);
  }
  if (t.isTSNonNullExpression(node)) {
    return unwrapTSNode(node.expression);
  }
  if (t.isParenthesizedExpression(node)) {
    return unwrapTSNode(node.expression);
  }
  return node;
}

/**
 * Resolve namespace from object properties in declaration order.
 * Later explicit `namespace` overrides earlier ones.
 * If a spread appears after an explicit namespace, the final value cannot be
 * determined statically — return undefined so callers fall back to path naming.
 */
export function getNamespaceFromObjectExpression(
  node: t.ObjectExpression,
): string | undefined {
  let namespace: string | undefined;
  for (const prop of node.properties) {
    if (t.isSpreadElement(prop)) {
      // spread may override a previously seen namespace
      if (namespace !== undefined) return undefined;
      continue;
    }
    if (!t.isObjectProperty(prop) || prop.computed) continue;
    const keyName = t.isIdentifier(prop.key)
      ? prop.key.name
      : t.isStringLiteral(prop.key)
      ? prop.key.value
      : null;
    if (keyName === 'namespace' && t.isStringLiteral(prop.value)) {
      namespace = prop.value.value;
    }
  }
  return namespace;
}

/**
 * Extract namespace from an export AST node.
 * Supports:
 * - object model: `export default { namespace: 'foo' }`
 * - hook/factory return: `export default () => ({ namespace: 'foo' })`
 * - dva-model-extend: `export default extend(base, { namespace: 'foo' })`
 */
export function getNamespaceFromExportNode(
  node: t.Node,
  path: Babel.NodePath,
): string | undefined {
  let current = getIdentifierDeclaration(unwrapTSNode(node), path);
  current = unwrapTSNode(current);

  if (t.isObjectExpression(current)) {
    return getNamespaceFromObjectExpression(current);
  }

  if (
    t.isArrowFunctionExpression(current) ||
    t.isFunctionExpression(current) ||
    t.isFunctionDeclaration(current)
  ) {
    const body = current.body;
    if (t.isObjectExpression(body)) {
      return getNamespaceFromObjectExpression(body);
    }
    if (t.isBlockStatement(body)) {
      for (const stmt of body.body) {
        if (!t.isReturnStatement(stmt) || !stmt.argument) continue;
        const arg = unwrapTSNode(stmt.argument);
        if (t.isObjectExpression(arg)) {
          // may be string, or undefined when missing / not statically determinable
          return getNamespaceFromObjectExpression(arg);
        }
      }
    }
  }

  // dva-model-extend(model, { namespace })
  if (t.isCallExpression(current) && current.arguments.length >= 2) {
    const options = unwrapTSNode(current.arguments[1]);
    if (t.isObjectExpression(options)) {
      return getNamespaceFromObjectExpression(options);
    }
  }

  return undefined;
}

export function getNamespaceFromFile(
  file: string,
  exportName: string = 'default',
): string | undefined {
  const content = readFileSync(file, 'utf-8');
  const loader = (
    extname(file).slice(1) === 'js' ? 'jsx' : extname(file).slice(1)
  ) as Loader;
  const result = transformSync(content, {
    loader,
    sourcemap: false,
    minify: false,
    sourcefile: file,
  });
  const ast = parser.parse(result.code, {
    sourceType: 'module',
    sourceFilename: file,
    plugins: [],
  });

  let namespace: string | undefined;
  traverse(ast, {
    ExportDefaultDeclaration: (
      path: Babel.NodePath<t.ExportDefaultDeclaration>,
    ) => {
      if (exportName !== 'default' || namespace !== undefined) return;
      namespace = getNamespaceFromExportNode(path.node.declaration, path);
    },
    ExportNamedDeclaration: (
      path: Babel.NodePath<t.ExportNamedDeclaration>,
    ) => {
      if (exportName === 'default' || namespace !== undefined) return;
      const { declaration, specifiers } = path.node;
      if (declaration) {
        if (t.isVariableDeclaration(declaration)) {
          for (const decl of declaration.declarations) {
            if (
              t.isIdentifier(decl.id) &&
              decl.id.name === exportName &&
              decl.init
            ) {
              namespace = getNamespaceFromExportNode(decl.init, path);
              return;
            }
          }
        }
        if (
          t.isFunctionDeclaration(declaration) &&
          declaration.id?.name === exportName
        ) {
          namespace = getNamespaceFromExportNode(declaration, path);
          return;
        }
      }
      for (const spec of specifiers) {
        if (
          t.isExportSpecifier(spec) &&
          t.isIdentifier(spec.exported) &&
          spec.exported.name === exportName
        ) {
          const binding = path.scope.getBinding(spec.local.name);
          if (binding?.path.node) {
            let node: t.Node = binding.path.node;
            if (t.isVariableDeclarator(node) && node.init) {
              node = node.init;
            }
            namespace = getNamespaceFromExportNode(node, path);
          }
          return;
        }
      }
    },
  });
  return namespace;
}

export function getExtraModelFilePath(modelPath: string) {
  return modelPath.split('#')[0];
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
    opts: { preferSourceNamespace?: boolean } = {},
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
    this.exportName = exportName || 'default';
    // Parse namespace from source only when model.preferSourceNamespace is true.
    if (!namespace && opts.preferSourceNamespace) {
      try {
        namespace = getNamespaceFromFile(this.file, this.exportName);
      } catch (e) {
        // 如果解析失败，继续使用默认的 namespace
      }
    }
    this.namespace = namespace || getNamespace(_file, absSrcPath);
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

export class ModelUtils {
  api: IApi;
  opts: IOpts = {};
  count: number = 1;
  constructor(api: IApi | null, opts: IOpts) {
    this.api = api as IApi;
    this.opts = opts;
  }

  getAllModels(opts: {
    sort?: object;
    extraModels: string[];
    preferSourceNamespace?: boolean;
  }) {
    // reset count
    this.count = 1;
    const absSrcPath = this.api.paths.absSrcPath;
    const conventional = [
      ...this.getModels({
        base: join(absSrcPath, 'models'),
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
    ].map((file: string) => {
      return new Model(file, absSrcPath, opts.sort, this.count++, {
        preferSourceNamespace: !!opts.preferSourceNamespace,
      });
    });
    const extras = opts.extraModels.map((file: string) => {
      return new Model(file, absSrcPath, opts.sort, this.count++, {
        preferSourceNamespace: !!opts.preferSourceNamespace,
      });
    });
    const models = [...conventional, ...extras];
    // check duplicate
    const namespaces = models.map((model) => model.namespace);
    if (new Set(namespaces).size !== namespaces.length) {
      throw new Error(
        `Duplicate namespace in models: ${namespaces.sort().join(', ')}`,
      );
    }
    // sort models by deps
    if (opts.sort) {
      const namespaces: string[] = ModelUtils.topologicalSort(models);
      models.sort(
        (a, b) =>
          namespaces.indexOf(a.namespace) - namespaces.indexOf(b.namespace),
      );
    }
    return models;
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

    let result: TransformResult | null = null;
    try {
      // transform with esbuild first
      // to reduce unexpected ast problem
      const ext = extname(file).slice(1);
      const loader = ext === 'js' ? 'jsx' : (ext as Loader);
      result = transformSync(content, {
        loader,
        sourcemap: false,
        minify: false,
        sourcefile: file,
      });
    } catch (e: any) {
      if (e.errors?.length) {
        prettyPrintEsBuildErrors(e.errors, { path: file, content });
        delete e.errors;
      }
      throw e;
    }

    // transform with babel
    let ret = false;
    const ast = parser.parse(result!.code, {
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

  // https://github.com/umijs/umi/issues/9837
  static topologicalSort = (models: Model[]) => {
    // build depts graph
    const graph: Array<ITopologicalNode | undefined> = [];
    const namespaceToNode: Record<string, ITopologicalNode> = {};
    models.forEach((model, index) => {
      const node: ITopologicalNode = {
        namespace: model.namespace,
        deps: model.deps,
        index,
        in: 0,
        childs: [],
      };
      if (namespaceToNode[model.namespace]) {
        throw new Error(`Duplicate namespace in models: ${model.namespace}`);
      }
      namespaceToNode[model.namespace] = node;
      graph.push(node);
    });

    // build edges.
    (graph as ITopologicalNode[]).forEach((node) => {
      node.deps.forEach((dep) => {
        const depNode = namespaceToNode[dep];
        if (!depNode) {
          throw new Error(`Model namespace not found: ${dep}`);
        }
        depNode.childs.push(node);
        node.in++;
      });
    });

    const queue: string[] = [];
    while (true) {
      // find first 0 in node;
      const zeronode = graph.find((n) => {
        return n && n.in === 0;
      });
      if (!zeronode) {
        break;
      }

      queue.push(zeronode.namespace);
      zeronode.childs.forEach((child) => {
        child.in--;
      });
      zeronode.childs = [];
      delete graph[zeronode.index];
    }

    const leftNodes = graph.filter(Boolean) as ITopologicalNode[];
    if (leftNodes.length > 0) {
      throw new Error(
        `Circle dependency detected in models: ${leftNodes
          .map((m) => chalk.red(m.namespace))
          .join(', ')}`,
      );
    }

    return queue;
  };

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
        `${model.id}: { namespace: ${JSON.stringify(model.namespace)}, model: ${
          model.id
        } },`,
      );
    });
    return `
${imports.join('\n')}

export const models = {
${modelProps.join('\n')}
} as const`;
  }
}
