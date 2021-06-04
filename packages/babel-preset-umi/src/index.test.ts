import { transform } from '@babel/core';
import { deepmerge, winPath } from '@umijs/utils';
import { join } from 'path';
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

test('typescript 4.2 abstract Construct Signatures', () => {
  const code = transformWithPreset(
    `
abstract class Shape {
    abstract getArea(): number;
}
  `,
    {
      typescript: true,
    },
  );
  expect(code).toContain(`var Shape = function Shape() {`);
  expect(code).toContain(`_classCallCheck(this, Shape);`);
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

test('typescript with metadata', () => {
  const code = transformWithPreset(
    `@Decorate
    class MyClass {
      constructor(
        private generic: Generic<A>,
        generic2: Generic<A, B>
      ) {}

      @Run
      method(
        generic: Inter<A>,
        @Arg() generic2: InterGen<A, B>
      ) {}
    }`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('Reflect.metadata');
});

test('typescript with nest-injection', () => {
  const code = transformWithPreset(
    `import { AppService } from './app.service';

    @Controller()
    export class AppController {
      constructor(private appService: AppService) {}

      @Inject()
      appService: AppService;

      @Inject()
      private appService2: AppService;

      @Get()
      getHello(): string {
        return this.appService.getHello();
      }
    }`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('Reflect.metadata');
  expect(code).toContain(
    '_initializerDefineProperty(this, "appService", _descriptor, this);',
  );
  expect(code).toContain(
    '_initializerDefineProperty(this, "appService2", _descriptor2, this);',
  );
});

test('typescript key remapping types', () => {
  const code = transformWithPreset(
    `type Options = {
      [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean
    };`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('"use strict"');
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

test('babel-plugin-import-to-await-require', () => {
  const code = transformWithPreset(`import { Button } from 'antd';foo;`, {
    env: {
      targets: { ie: 10 },
    },
    importToAwaitRequire: {
      libs: ['antd'],
      remoteName: 'foo',
    },
  });
  expect(code).toContain(`} = await import("foo/antd");`);
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
  expect(winPath(code!)).toContain(
    `svgr-webpack.js?-svgo,+titleProp,+ref!./a.svg");`,
  );
});

test('logical assignment operators', () => {
  const code = transformWithPreset(`a ||= b;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(winPath(code!)).toContain(`a || (a = b);`);
});

test('top level await', () => {
  const code = transformWithPreset(`await delay(1000);`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`await delay(1000);`);
});

test('record', () => {
  const code = transformWithPreset(`#{ x: 1, y: 2 }`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`\"use strict\";

var _recordTuplePolyfill = require(\"@umijs/deps/reexported/record-tuple-polyfill\");

(0, _recordTuplePolyfill.Record)({
  x: 1,
  y: 2
});`);
});

test('tuple', () => {
  const code = transformWithPreset(`#[1, 2, 3];`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`\"use strict\";

var _recordTuplePolyfill = require(\"@umijs/deps/reexported/record-tuple-polyfill\");

(0, _recordTuplePolyfill.Tuple)(1, 2, 3);`);
});
