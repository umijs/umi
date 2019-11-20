import { transform } from '@babel/core';

test('object spread', () => {
  const { code } = transform(`const a = { ...b };`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

// ref: https://github.com/babel/babel/issues/7215
test('transform destructuring', () => {
  const { code } = transform(`const [{ ...rest }] = [{}];`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('require react automatically', () => {
  const { code } = transform(`function Foo() { return <div />; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('dynamic import', () => {
  const { code } = transform(`import('./a');`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('optional catch binding', () => {
  const { code } = transform(`try { throw e } catch {}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('async generator function', () => {
  const { code } = transform(`async function* agf() { await 1; yield 2; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('decorators', () => {
  const { code } = transform(`@foo class Foo {}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('class properties', () => {
  const { code } = transform(`class Foo { a = 'b'; foo = () => this.a; static c = 'd';}`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

xtest('export namespace from', () => {
  const { code } = transform(`export * as ns from 'mod';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('export default from', () => {
  const { code } = transform(`export v from 'mod';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('nullish coalescing operator', () => {
  const { code } = transform(`const a = foo.bar ?? 'hoo';`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('optional chaining', () => {
  const { code } = transform(`const a = b?.c?.d;`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('pipeline operator', () => {
  const { code } = transform(`const a = b |> c |> d;`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('do expression', () => {
  const { code } = transform(`const a = do { if (foo) 'foo'; else 'bar'; }`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});

test('function bind', () => {
  const { code } = transform(`a::b; ::a.b; a::b(c); ::a.b(c);`, {
    presets: [[require.resolve('./index'), { targets: { chrome: 75 } }]],
  });
  expect(code).toMatchSnapshot();
});
