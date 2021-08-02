import {
  cjsModeEsmParser,
  getDepReExportContent,
} from './getDepReExportContent';

test('parse failed', async () => {
  try {
    await getDepReExportContent({
      content: `foo(;`,
      importFrom: ``,
      filePath: 'bar.ts',
    });
  } catch (e) {
    expect(e.message).toContain('Parse file bar.ts failed');
  }
});

test('not support file type', async () => {
  try {
    await getDepReExportContent({
      content: `
        im txt.
      `,
      filePath: `foo/bar.txt`,
      importFrom: 'foo/bar.txt',
    });
  } catch (e) {
    expect(e).toEqual(
      new Error('Parse file foo/bar.txt failed, .txt not support!'),
    );
  }
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

test('support jsx and tsx', async () => {
  expect(
    await getDepReExportContent({
      content: `<div />; export default 1;`,
      filePath: 'a.jsx',
      importFrom: 'foo',
    }),
  ).toEqual(`import _ from 'foo';\nexport default _;`);
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

test('__esModule only', async () => {
  expect(
    // ref: @%INNER_SCOPE%/radiant-util
    await getDepReExportContent({
      content: `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./constant"), exports);
tslib_1.__exportStar(require("./number/math"), exports);
tslib_1.__exportStar(require("./number/format"), exports);
tslib_1.__exportStar(require("./date"), exports);
tslib_1.__exportStar(require("./collection/transform"), exports);
`,
      importFrom: 'foo',
    }),
  ).toEqual(`import _ from 'foo';\nexport default _;\nexport * from 'foo';`);
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

  var index_0 = __webpack_exports__["dddfault"] = (createExtensibleEditor(editor_BraftEditor));

  __webpack_require__.d( __webpack_exports__ , "getDecorators", function() { return getDecorators; });

  __webpack_require__.d(__webpack_exports__, {
    "qqqqqq": function() { return /* binding */ clipboard; },
    "wwwwww": function() { return /* binding */ clipboard; },
    "eeeeee" : ()=>{ {"ddd":123} }
  });

  `;
  expect(cjsModeEsmParser(file)).toEqual([
    '__esModule',
    'aaaa',
    'bbbb',
    'Foo',
    'default',
    'something',
    'dddfault',
    'getDecorators',
    'qqqqqq',
    'wwwwww',
    'eeeeee',
  ]);
});

test('import a json file', async () => {
  expect(
    await getDepReExportContent({
      content: `
{
  "name": "test"
}
`,
      importFrom: 'test/package.json',
      filePath: '/test/package.json',
    }),
  ).toEqual(`import _ from 'test/package.json';\nexport default _;`);
});

test('import a json but with invalid JSON content', async () => {
  expect(
    await getDepReExportContent({
      content: `
export const name = "test";
`,
      importFrom: 'test/package.json',
    }),
  ).toEqual(`export * from 'test/package.json';`);
});
