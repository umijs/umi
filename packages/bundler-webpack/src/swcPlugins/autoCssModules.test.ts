import { transformSync } from '@swc/core';
import AutoCSSModule from './autoCSSModules';

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
        topLevelAwait: true,
      },
      target: 'es2017',
      loose: false,
      minify: {
        compress: false,
        mangle: false,
      },
    },
    module: {
      type: 'es6',
    },
    minify: false,
    isModule: true,
    plugin: (m: any) => new AutoCSSModule().visitProgram(m),
  } as any)!.code.trim() as string;
}

test('css modules', () => {
  expect(doTransform({ code: `import styles from 'a.css';` })).toEqual(
    `import styles from 'a.css?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.less';` })).toEqual(
    `import styles from 'a.less?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.scss';` })).toEqual(
    `import styles from 'a.scss?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.sass';` })).toEqual(
    `import styles from 'a.sass?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.stylus';` })).toEqual(
    `import styles from 'a.stylus?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.styl';` })).toEqual(
    `import styles from 'a.styl?modules';`,
  );
});

test('no css modules', () => {
  expect(doTransform({ code: `import 'a.css';` })).toEqual(`import 'a.css';`);
});

test('do not infect non css imports', () => {
  expect(doTransform({ code: `import a from 'a';` })).toEqual(
    `import a from 'a';`,
  );
  expect(doTransform({ code: `import a from 'a.js';` })).toEqual(
    `import a from 'a.js';`,
  );
  expect(doTransform({ code: `import 'a';` })).toEqual(`import 'a';`);
});
