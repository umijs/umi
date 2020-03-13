import { deepmerge, winPath } from '@umijs/utils';
import { join } from 'path';
import { transform } from '@babel/core';
import { IOpts } from './index';

const DEFAULT_OPTS = {
  react: true,
  env: {
    modules: 'commonjs',
  },
};

function transformWithPreset(code: string, opts: IOpts) {
  const filename = opts.typescript ? 'file.ts' : 'file.js';
  return transform(code, {
    filename,
    presets: [[require.resolve('./index.ts'), deepmerge(DEFAULT_OPTS, opts)]],
  })!.code;
}

test('cjs', () => {
  const code = transformWithPreset(`import { a } from './a';`, {});
  expect(code).toContain('var _a = require("./a");');
});

test('esm', () => {
  const code = transformWithPreset(`import { a } from './a';`, {
    env: {
      modules: false,
    },
  });
  expect(code).toContain(`import { a } from './a';`);
});

test('typescript', () => {
  const code = transformWithPreset(
    `
  const a: string = 'foo'; console.log(a);
  `,
    {
      typescript: true,
    },
  );
  expect(code).toContain(`var a = 'foo';`);
});

test('typescript with namespace', () => {
  const code = transformWithPreset(
    `
  namespace N {
    export const V = 1;
  }
  `,
    {
      typescript: true,
    },
  );
  expect(code).toContain(`var V = _N.V = 1;`);
});

test('dynamic import', () => {
  const code = transformWithPreset(`import('./a');`, {});
  expect(code).toContain(`require('./a')`);
});

test('object spread', () => {
  const code = transformWithPreset(`const a = { ...b };`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`_objectSpread({}, b);`);
});

test('optional catch binding', () => {
  const code = transformWithPreset(`try { throw e } catch {}`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`catch (_unused) {}`);
});

test('async generator function', () => {
  const code = transformWithPreset(
    `async function* agf() { await 111; yield 222; }`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`return _awaitAsyncGenerator(111);`);
});

test('decorators', () => {
  const code = transformWithPreset(`@foo class Foo {}`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`foo(_class = function Foo() {`);
});

test('class properties', () => {
  const code = transformWithPreset(
    `class Foo { a = 'b'; foo = () => this.a; static c = 'd';}`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`this.a = 'b';`);
});

test('export default from', () => {
  const code = transformWithPreset(`export v from 'a'`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`Object.defineProperty(exports, "v", {`);
});

test('nullish coalescing operator', () => {
  const code = transformWithPreset(`const a = foo.bar ?? 'hoo';`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_foo$bar = foo.bar) !== null &&`);
});

test('optional chaining', () => {
  const code = transformWithPreset(`const a = b?.c?.d;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_b = b) === null || _b`);
});

test('pipeline operator', () => {
  const code = transformWithPreset(`const a = b |> c |> d;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_ref = (_b = b, c(_b)), d(_ref));`);
});

test('do expression', () => {
  const code = transformWithPreset(
    `const a = do { if (foo) 'foo'; else 'bar'; }`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`var a = foo ? 'foo' : 'bar';`);
});

test('function bind', () => {
  const code = transformWithPreset(`a::b; ::a.b; a::b(c); ::a.b(c);`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`(_context = a, b).bind(_context);`);
});

test('transform runtime', () => {
  const code = transformWithPreset(`class A {}`, {
    env: {
      targets: { ie: 10 },
    },
    transformRuntime: {},
  });
  expect(winPath(join(code!))).toContain(
    `node_modules/@babel/runtime/helpers/esm/classCallCheck"));`,
  );
});

test('babel-plugin-transform-react-remove-prop-types', () => {
  const code = transformWithPreset(
    `
import React, { PropTypes } from 'react';
function Message() {
  return <a />;
}
Message.propTypes = {
  a: PropTypes.bool.isRequired,
};
export default Message;
`,
    {
      env: {
        targets: { ie: 10 },
      },
      reactRemovePropTypes: true,
    },
  );
  expect(code).not.toContain('Message.propTypes = {');
});

test('babel-plugin-react-require', () => {
  const code = transformWithPreset(`function A() { return <a /> }`, {
    env: {
      targets: { ie: 10 },
    },
    reactRequire: true,
  });
  expect(code).toContain(
    'var _react = _interopRequireDefault(require("react"));',
  );
});

test('babel-plugin-auto-css-modules', () => {
  const code = transformWithPreset(`import styles from './a.css';`, {
    env: {
      targets: { ie: 10 },
    },
    autoCSSModules: true,
  });
  expect(code).toContain(
    `var _a = _interopRequireDefault(require("./a.css?modules"));`,
  );
});

test('svgr', () => {
  const code = transformWithPreset(
    `import { ReactComponent } from './a.svg';`,
    {
      env: {
        targets: { ie: 10 },
      },
      svgr: {},
    },
  );
  expect(winPath(code!)).toContain(`index.js?-svgo,+titleProp,+ref!./a.svg");`);
});
