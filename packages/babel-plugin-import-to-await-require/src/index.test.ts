import { transform } from '@babel/core';
import { IOpts } from './index';

function transformWithPlugin(code: string, opts: IOpts) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./index.ts'), opts]],
  })!.code;
}

test('normal', () => {
  expect(
    transformWithPlugin(`import a, { b, c as d } from 'antd'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
const {
  default: a,
  b: b,
  c: d
} = await import("foo/antd");
foo;
    `.trim(),
  );
});

test('namespace specifier', () => {
  expect(
    transformWithPlugin(`import * as a from 'antd'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
const a = await import("foo/antd");
foo;
    `.trim(),
  );
});

test('namespace specifier with default specifier', () => {
  expect(
    transformWithPlugin(`import b, * as a from 'antd'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
const a = await import("foo/antd");
const {
  default: b
} = a;
foo;
    `.trim(),
  );
});

test('alias', () => {
  expect(
    transformWithPlugin(
      `import a, { b, c as d } from '@bar/bigfish/antd'; foo;`,
      {
        libs: ['antd'],
        remoteName: 'foo',
        alias: {
          '@bar/bigfish/antd': 'antd',
        },
      },
    ),
  ).toEqual(
    `
const {
  default: a,
  b: b,
  c: d
} = await import("foo/antd");
foo;
    `.trim(),
  );
});

test('invalid libs', () => {
  expect(
    transformWithPlugin(`import a, { b, c as d } from 'antdx'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
import a, { b, c as d } from 'antdx';
foo;
    `.trim(),
  );
});

test('regex libs', () => {
  expect(
    transformWithPlugin(`import Button from 'antd/es/button'; foo;`, {
      libs: [/antd\/es\/[^\/]+$/],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
const {
  default: Button
} = await import("foo/antd/es/button");
foo;
    `.trim(),
  );
});

test('regex libs with alias', () => {
  expect(
    transformWithPlugin(
      `import Button from '@bar/bigfish/antd/es/button'; foo;`,
      {
        libs: [/antd\/es\/[^\/]+$/, /@bar\/bigfish\/antd\/es\/[^\/]+$/],
        remoteName: 'foo',
        alias: {
          '@bar/bigfish/antd': 'antd',
        },
      },
    ),
  ).toEqual(
    `
const {
  default: Button
} = await import("foo/antd/es/button");
foo;
    `.trim(),
  );
});

test('multiple imports', () => {
  expect(
    transformWithPlugin(
      `import a from 'antd'; import b from 'bizcharts'; foo;`,
      {
        libs: ['antd', 'bizcharts'],
        remoteName: 'foo',
      },
    ),
  ).toEqual(
    `
const {
  default: a
} = await import("foo/antd");
const {
  default: b
} = await import("foo/bizcharts");
foo;
    `.trim(),
  );
});

test('export', () => {
  expect(
    transformWithPlugin(`export { bar } from 'antd'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
    }),
  ).toEqual(
    `
const {
  bar: bar
} = await import("foo/antd");
export { bar };
foo;
    `.trim(),
  );
});

test('export *', () => {
  expect(
    transformWithPlugin(`export * from 'antd'; foo;`, {
      libs: ['antd'],
      remoteName: 'foo',
      exportAllMembers: { antd: ['a', 'b', 'c'] },
    }),
  ).toEqual(
    `
const __all_exports = await import("foo/antd");

export const {
  a: a,
  b: b,
  c: c
} = __all_exports;
foo;
    `.trim(),
  );
});
