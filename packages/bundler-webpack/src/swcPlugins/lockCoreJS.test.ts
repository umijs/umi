import { transformSync } from '@swc/core';
import LockCoreJS from './lockCoreJS';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transformSync(opts.code, {
    filename: opts.filename || 'foo.js',
    jsc: {
      parser: {
        syntax: 'ecmascript',
        jsx: false,
      },
      loose: false,
      target: 'es2015',
    },
    minify: false,
    isModule: true,
    module: {
      type: 'es6',
    },
    plugin: (m: any) => new LockCoreJS().visitProgram(m),
  })!.code.trim() as string;
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
