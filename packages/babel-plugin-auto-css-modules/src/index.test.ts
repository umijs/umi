import { transform } from '@babel/core';
import { IOpts } from './index';

function transformWithPlugin(code: string, opts: IOpts) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [
      require.resolve(
        '@umijs/deps/compiled/babel/plugin-syntax-top-level-await',
      ),
      [require.resolve('./index.ts'), opts],
    ],
  })!.code;
}

test('css modules', () => {
  expect(transformWithPlugin(`import styles from 'a.css';`, {})).toEqual(
    `import styles from "a.css?modules";`,
  );
  expect(transformWithPlugin(`import styles from 'a.less';`, {})).toEqual(
    `import styles from "a.less?modules";`,
  );
  expect(transformWithPlugin(`import styles from 'a.scss';`, {})).toEqual(
    `import styles from "a.scss?modules";`,
  );
  expect(transformWithPlugin(`import styles from 'a.sass';`, {})).toEqual(
    `import styles from "a.sass?modules";`,
  );
  expect(transformWithPlugin(`import styles from 'a.stylus';`, {})).toEqual(
    `import styles from "a.stylus?modules";`,
  );
  expect(transformWithPlugin(`import styles from 'a.styl';`, {})).toEqual(
    `import styles from "a.styl?modules";`,
  );
});

test('css with top level await', () => {
  expect(
    transformWithPlugin(`const styles = await import('a.css');`, {}),
  ).toEqual(`const styles = await import("a.css?modules");`);
  expect(transformWithPlugin(`await import('a.css');`, {})).toEqual(
    `await import('a.css');`,
  );
});

test('none css with top level await', () => {
  expect(transformWithPlugin(`const styles = await import('a');`, {})).toEqual(
    `const styles = await import('a');`,
  );
  expect(transformWithPlugin(`await import('a');`, {})).toEqual(
    `await import('a');`,
  );
});

test('css modules with flag', () => {
  expect(
    transformWithPlugin(`import styles from 'a.css';`, {
      flag: 'foo',
    }),
  ).toEqual(`import styles from "a.css?foo";`);
});

test('no css modules', () => {
  expect(transformWithPlugin(`import 'a.css';`, {})).toEqual(`import 'a.css';`);
});

test('do not infect non css imports', () => {
  expect(transformWithPlugin(`import a from 'a';`, {})).toEqual(
    `import a from 'a';`,
  );
  expect(transformWithPlugin(`import a from 'a.js';`, {})).toEqual(
    `import a from 'a.js';`,
  );
  expect(transformWithPlugin(`import 'a';`, {})).toEqual(`import 'a';`);
});
