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
      default: 'a',
      source: 'a',
    },
  ]);
});

xtest('import namespace', () => {
  const { imports } = doTransform({ code: `import * as a from 'a';` });
  expect(imports.map(formatImport)).toEqual([
    {
      namespace: 'a',
      source: 'a',
    },
  ]);
});

xtest('import specifiers', () => {
  const { imports } = doTransform({ code: `import { a, b } from 'a';` });
  expect(imports.map(formatImport)).toEqual([
    {
      specifiers: {
        a: 'a',
        b: 'b',
      },
      source: 'a',
    },
  ]);
});

xtest('cjs exports', () => {
  const { cjsExports } = doTransform({
    code: `module.exports = 'a';exports.b = 'b';`,
  });
  expect(cjsExports).toEqual(['default', 'b']);
});
