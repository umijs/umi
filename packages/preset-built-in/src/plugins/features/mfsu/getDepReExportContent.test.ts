import {
  cjsModeEsmParser,
  getDepReExportContent,
} from './getDepReExportContent';

xtest('parse failed', () => {
  expect(() => {
    getDepReExportContent({
      content: `foo(;`,
      importFrom: ``,
      filePath: 'bar.ts',
    }).catch((e) => {
      throw e;
    });
  }).toThrow(/Parse file bar.ts failed,/);
});

test('esm export default', async () => {
  expect(
    await getDepReExportContent({
      content: `export default {};`,
      importFrom: 'foo',
    }),
  ).toEqual(`import _ from 'foo';\nexport default _;`);
});

test('esm export members', async () => {
  expect(
    await getDepReExportContent({
      content: `export const bar = {};`,
      importFrom: 'foo',
    }),
  ).toEqual(`export * from 'foo';`);
});

test('esm export *', async () => {
  expect(
    await getDepReExportContent({
      // imports [ { n: 'abc', s: 15, e: 18, ss: 0, se: 19, d: -1, a: -1 } ]
      // exports []
      content: `export * from 'abc';`,
      importFrom: 'foo',
    }),
  ).toEqual(`export * from 'foo';`);
});

test('esm only import', async () => {
  expect(
    await getDepReExportContent({
      content: `import * as x from 'abc'; export {};`,
      importFrom: 'foo',
    }),
  ).toEqual(`import 'foo';`);
});

const CJS_RET = `import _ from 'foo';\nexport default _;\nexport * from 'foo';`;

test('no module system', async () => {
  expect(
    await getDepReExportContent({
      content: `console.log(1);`,
      importFrom: 'foo',
    }),
  ).toEqual(CJS_RET);
});

test('cjs', async () => {
  expect(
    await getDepReExportContent({
      content: `module.export = {};`,
      importFrom: 'foo',
    }),
  ).toEqual(CJS_RET);
  expect(
    await getDepReExportContent({
      content: `const bar = require('bar'); export.foo = bar;`,
      importFrom: 'foo',
    }),
  ).toEqual(CJS_RET);
});

test('esm with defineProperty export default', async () => {
  expect(
    await getDepReExportContent({
      content: `
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "123123";`,
      importFrom: 'foo',
    }),
  ).toEqual(`import _ from 'foo';\nexport default _;`);
});

test('esm with defineProperty export none default 1', async () => {
  expect(
    await getDepReExportContent({
      content: `
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "aaaa", {
  value: true
});
`,
      importFrom: 'foo',
    }),
  ).toEqual(`export * from 'foo';`);
});

test('esm with defineProperty export none default 2', async () => {
  expect(
    await getDepReExportContent({
      content: `
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Foo = void 0;
`,
      importFrom: 'foo',
    }),
  ).toEqual(`export * from 'foo';`);
});

test('cjs mode esm parser', () => {
  const file = `
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "aaaa", {
    value: true
  });
  Object.defineProperty(    exports    ,      "bbbb"    , {
    value: true
  });
  Object.defineProperty(    fooooo    ,      "bbbb"    , {
    value: true
  });
  exports.Foo = void 0;
  exports.default = "123123";
  exports {Love};
  exportsILoveYou = "1";
  exports["something"] = undefined;
  `;
  expect(cjsModeEsmParser(file)).toEqual([
    '__esModule',
    'aaaa',
    'bbbb',
    'Foo',
    'default',
    'something',
  ]);
});
