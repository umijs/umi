import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import { chalk } from '@umijs/utils';
import { unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  getNamespace,
  getNamespaceFromExportNode,
  getNamespaceFromFile,
  Model,
  ModelUtils,
  transformSync,
} from './modelUtils';

function getNamespaceFromCode(code) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  let namespace;
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      namespace = getNamespaceFromExportNode(path.node.declaration, path);
    },
  });
  return namespace;
}

test('getNamespaceFromExportNode object model', () => {
  expect(
    getNamespaceFromCode(`export default { namespace: 'approvalProcess' };`),
  ).toEqual('approvalProcess');
});

test('getNamespaceFromExportNode arrow return object', () => {
  expect(
    getNamespaceFromCode(
      `export default () => ({ namespace: 'approvalProcess' });`,
    ),
  ).toEqual('approvalProcess');
});

test('getNamespaceFromExportNode arrow block return', () => {
  expect(
    getNamespaceFromCode(`export default () => {
  return { namespace: 'approvalProcess' };
};`),
  ).toEqual('approvalProcess');
});

test('getNamespaceFromExportNode ignore unrelated comment/string', () => {
  expect(
    getNamespaceFromCode(`// namespace: 'legacy'
const tip = "namespace: 'noise'";
export default () => ({ namespace: 'approvalProcess' });`),
  ).toEqual('approvalProcess');
});

test('getNamespaceFromExportNode no namespace falls back undefined', () => {
  expect(getNamespaceFromCode(`export default () => ({ count: 1 });`)).toBe(
    undefined,
  );
});

test('getNamespaceFromFile', () => {
  const file = join(__dirname, 'fixtures-namespace-tmp.ts');
  writeFileSync(
    file,
    `export default () => ({ namespace: 'fromFile' });`,
    'utf-8',
  );
  expect(getNamespaceFromFile(file)).toEqual('fromFile');
  unlinkSync(file);
});

test('getNamespace', () => {
  expect(getNamespace('/a/b/src/models/foo.ts', '/a/b/src')).toEqual('foo');
  expect(getNamespace('/a/b/src/models/foo.ts', '/a/b/src/')).toEqual('foo');
});

test('getNamespace winPath', () => {
  expect(getNamespace('\\a\\b\\src/models/foo.ts', '/a/b/src')).toEqual('foo');
});

test('getNamespace filter pages', () => {
  expect(getNamespace('/a/b/src/pages/foo/model.ts', '/a/b/src')).toEqual(
    'foo.model',
  );
});

test('getNamespace filter models', () => {
  expect(getNamespace('/a/b/src/pages/foo/models/bar.ts', '/a/b/src')).toEqual(
    'foo.bar',
  );

  expect(
    getNamespace('/a/b/src/pages/foo/models/bar/qux.ts', '/a/b/src'),
  ).toEqual('foo.bar.qux');
});

test('getNamespace strip .model affix', () => {
  expect(getNamespace('/a/b/src/foo/bar.model.ts', '/a/b/src')).toEqual(
    'foo.bar',
  );
});

// Topological sort tests

const topologicalSort = (
  cases: Array<{ namespace: string; deps: string[] }>,
) => {
  const models = cases.map((c, i) => {
    const mock = jest
      .spyOn(Model.prototype, 'findDeps')
      .mockImplementation(() => {
        return c.deps;
      });
    const meta = JSON.stringify({ namespace: c.namespace });
    const model = new Model(
      `file#${meta}`,
      'absSrcPath',
      {} /* sort */,
      i /* id */,
    );
    expect(mock).toHaveBeenCalled();
    mock.mockClear();
    return model;
  });
  return ModelUtils.topologicalSort(models);
};

test('TopologicalSort: no dep', () => {
  // a
  // b
  // c
  expect(
    topologicalSort([
      {
        namespace: 'a',
        deps: [],
      },
      {
        namespace: 'b',
        deps: [],
      },
      {
        namespace: 'c',
        deps: [],
      },
    ]),
  ).toEqual(['a', 'b', 'c']);
});

test('TopologicalSort: simple dep', () => {
  // a
  // c -> b
  expect(
    topologicalSort([
      {
        namespace: 'a',
        deps: [],
      },
      {
        namespace: 'b',
        deps: ['c'],
      },
      {
        namespace: 'c',
        deps: [],
      },
    ]),
  ).toEqual(['a', 'c', 'b']);
});

test('TopologicalSort: simple deps', () => {
  // a
  // d -> c -> b
  expect(
    topologicalSort([
      {
        namespace: 'a',
        deps: [],
      },
      {
        namespace: 'b',
        deps: ['c'],
      },
      {
        namespace: 'c',
        deps: ['d'],
      },
      {
        namespace: 'd',
        deps: [],
      },
    ]),
  ).toEqual(['a', 'd', 'c', 'b']);
});

test('TopologicalSort: complex deps', () => {
  //  ← ← ← ← b
  // ↓      ↙ ↓
  // ↓    ↙   ↓
  // d ← c    ↓
  // ↑    ↘   ↓
  // ↑      ↘ ↓
  //  ← ← ← ← a
  // e
  expect(
    topologicalSort([
      {
        namespace: 'a',
        deps: ['b', 'c'],
      },
      {
        namespace: 'b',
        deps: [],
      },
      {
        namespace: 'c',
        deps: ['b'],
      },
      {
        namespace: 'd',
        deps: ['c', 'b', 'a'],
      },
      {
        namespace: 'e',
        deps: [],
      },
    ]),
  ).toEqual(['b', 'c', 'a', 'd', 'e']);
});

test('TopologicalSort: detect duplicate', () => {
  expect(() => {
    topologicalSort([
      {
        namespace: 'a',
        deps: [],
      },
      {
        namespace: 'a',
        deps: [],
      },
    ]);
  }).toThrow('Duplicate namespace in models: a');
});

test('TopologicalSort: detect circle', () => {
  expect(() => {
    topologicalSort([
      {
        namespace: 'a',
        deps: ['c'],
      },
      {
        namespace: 'b',
        deps: ['a'],
      },
      {
        namespace: 'c',
        deps: ['b'],
      },
    ]);
  }).toThrowError(
    `Circle dependency detected in models: ${['a', 'b', 'c']
      .map((i) => chalk.red(i))
      .join(', ')}`,
  );
});

test('transformSync', () => {
  transformSync(
    `
function prop() {}

export class UseDecorator {
  @prop()
  a = 1;

  fn(
    @prop()
    jsParam,
  ) {
    console.log(a);
  }
}
    `,
    {
      loader: 'ts',
      sourcemap: false,
      minify: false,
    },
  );
});
