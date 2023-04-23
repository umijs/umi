import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    presets: [[require.resolve('./index.ts'), opts.opts || {}]],
  })!.code as string;
}

test('optional catch binding', () => {
  const code = doTransform({ code: `try { throw e } catch {}` });
  expect(code).toContain(`catch (_unused) {}`);
});

test('async generator function', () => {
  const code = doTransform({
    code: `async function* agf() { await 111; yield 222; }`,
  });
  expect(code).toContain(`return _awaitAsyncGenerator(111);`);
});

// no loose
test('class properties', () => {
  const code = doTransform({
    code: `class Foo { a = 'b'; foo = () => this.a; static c = 'd';}`,
  });
  expect(code).toContain(`_defineProperty(this, "a", 'b');`);
});

test('optional chaining', () => {
  const code = doTransform({ code: `const a = b?.c?.d;` });
  expect(code).toContain(`var a = (_b = b) === null || _b`);
});

test('logical assignment operators', () => {
  const code = doTransform({
    code: `a ||= b;`,
  });
  expect(code).toContain(`a || (a = b);`);
});

test('top level await', () => {
  const code = doTransform({
    code: `await delay(1000);`,
  });
  expect(code).toContain(`await delay(1000);`);
});

test('tc39 decorators', () => {
  const code = doTransform({ code: `@foo class Foo {}` });
  expect(code).toContain(
    `foo(_class = /*#__PURE__*/_createClass(function Foo() {`,
  );
});

test('tc39 pipeline operator', () => {
  const code = doTransform({
    code: `const a = b |> c |> d;`,
  });
  expect(code).toContain(`var a = (_ref = (_b = b, c(_b)), d(_ref));`);
});

test('tc39 do expression', () => {
  const code = doTransform({
    code: `const a = do { if (foo) 'foo'; else 'bar'; }`,
    filename: 'foo.ts',
  });
  expect(code).toContain(`var a = foo ? 'foo' : 'bar';`);
});

test('tc39 function bind', () => {
  const code = doTransform({
    code: `a::b; ::a.b; a::b(c); ::a.b(c);`,
  });
  expect(code).toContain(`(_context = a, b).bind(_context);`);
});

test('tc39 export default from', () => {
  const code = doTransform({
    code: `export v from "mod";`,
  });
  expect(code).toContain(`export { default as v } from "mod";`);
});

test('tc39 export namespace from', () => {
  const code = doTransform({
    code: `export * as ns from "mod";`,
  });
  expect(code).toContain(`import * as _ns from "mod";\nexport { _ns as ns };`);
});

test('tc39 static class block', () => {
  const code = doTransform({
    code: `class foo { static { bar();} }`,
  });
  expect(code).toContain(`bar();`);
});

test('tc39 record', () => {
  const code = doTransform({
    code: `#{ x: 1, y: 2 }`,
  });
  expect(code).toContain(`_Record({\n  x: 1,\n  y: 2\n});`);
});

test('plugin-transform-runtime', () => {
  const code = doTransform({
    code: `class A {}`,
    opts: { pluginTransformRuntime: {} },
  });
  expect(code).toContain(`@babel`);
  expect(code).toContain(`classCallCheck`);
});

test('typescript with namespace', () => {
  expect(
    doTransform({
      code: `namespace N { export const V = 1; }`,
      filename: 'foo.ts',
    }),
  ).toContain(`var V = _N.V = 1;`);
});

test('typescript with allowDeclareFields', () => {
  expect(
    doTransform({
      code: `class A { declare foo: string; bar: string }`,
      filename: 'foo.ts',
    }),
  ).toContain(`_defineProperty(this, "bar", void 0);`);
});

xtest('typescript with onlyRemoveTypeImports', () => {
  expect(
    doTransform({
      code: `import { c } from 'b'; import type { b } from 'c';`,
      filename: 'foo.ts',
    }),
  ).toEqual(`import { c } from 'b';`);
});

test('typescript with optimizeConstEnums', () => {
  expect(
    doTransform({
      code: `const enum Animals { Fish }; console.log(Animals.Fish);`,
      filename: 'foo.ts',
    }),
  ).toContain(`console.log(0);`);
});
