import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./lockCoreJS.ts'), opts.opts || {}]],
  })!.code as string;
}

test('only replace core-js/', () => {
  const code = doTransform({
    code: `import 'a';import 'core-js';import 'core-js/foo';`,
    opts: {
      absoluteCoreJS: '/tmp/core-js/',
    },
  });
  expect(code).toContain(`import 'a';\nimport 'core-js';`);
  expect(code).toContain('node_modules/core-js/foo');
});
