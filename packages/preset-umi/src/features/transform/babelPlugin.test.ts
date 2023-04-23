import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): any {
  let ret = null;
  transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [
      [
        require.resolve('./babelPlugin.ts'),
        {
          cwd: '/foo',
          absTmpPath: '/foo/bar',
          onCheckCode({ args }: any) {
            ret = args;
          },
        },
      ],
    ],
  });
  return ret;
}

function formatImport(item: any) {
  const ret: any = {
    kind: item.kind,
    source: item.source,
  };
  if (item.default) ret.default = item.default;
  if (item.specifiers) ret.specifiers = item.specifiers;
  if (item.namespace) ret.namespace = item.namespace;
  return ret;
}

xtest('import default', () => {
  const { imports } = doTransform({ code: `import a from 'a';` });
  expect(imports.map(formatImport)).toEqual([
    {
      kind: 'value',
      default: 'a',
      source: 'a',
    },
  ]);
});

xtest('import namespace', () => {
  const { imports } = doTransform({ code: `import * as a from 'a';` });
  expect(imports.map(formatImport)).toEqual([
    {
      kind: 'value',
      namespace: 'a',
      source: 'a',
    },
  ]);
});

xtest('import specifiers', () => {
  const { imports } = doTransform({
    filename: 'foo.ts',
    code: `
import { a, type b } from 'a';
import type c from 'c';
import type { d } from 'd';`,
  });
  expect(imports.map(formatImport)).toEqual([
    {
      kind: 'value',
      specifiers: {
        a: { name: 'a', kind: 'value' },
        b: { name: 'b', kind: 'type' },
      },
      source: 'a',
    },
    {
      kind: 'type',
      default: 'c',
      source: 'c',
    },
    {
      kind: 'type',
      source: 'd',
      specifiers: {
        d: { name: 'd', kind: 'value' },
      },
    },
  ]);
});

xtest('cjs exports', () => {
  const { cjsExports } = doTransform({
    code: `module.exports = 'a';exports.b = 'b';`,
  });
  expect(cjsExports).toEqual(['default', 'b']);
});
