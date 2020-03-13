import Plugin, { ApplyPluginsType } from './Plugin';

test('normal', () => {
  const p = new Plugin({
    validKeys: ['foo', 'bar'],
  });
  p.register({
    apply: { foo: 1, bar: 2 },
    path: '/foo.js',
  });
  expect(p.hooks).toEqual({ foo: [1], bar: [2] });
});

test('invalid key', () => {
  const p = new Plugin({
    validKeys: [],
  });
  expect(() => {
    p.register({
      apply: { foo: 1 },
      path: '/foo.js',
    });
  }).toThrow(/invalid key foo from plugin \/foo.js/);
});

test('getHooks', () => {
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: { foo: 1 },
    path: '/foo1.js',
  });
  p.register({
    apply: { foo: 2 },
    path: '/foo2.js',
  });
  expect(p.getHooks('foo')).toEqual([1, 2]);
});

test('getHooks with dotted keys', () => {
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: { foo: { bar: 1 } },
    path: '/foo1.js',
  });
  p.register({
    apply: { foo: { bar: 2 } },
    path: '/foo2.js',
  });
  expect(p.getHooks('foo.bar')).toEqual([1, 2]);
});

test('getHooks with dotted keys + filter non boolean values', () => {
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: { foo: { bar: { hoo: 1 } } },
    path: '/foo1.js',
  });
  p.register({
    apply: { foo: { bar: { hoo: 2 } } },
    path: '/foo2.js',
  });
  p.register({
    apply: { foo: 1 },
    path: '/foo3.js',
  });
  p.register({
    apply: {},
    path: '/foo4.js',
  });
  expect(p.getHooks('foo.bar.hoo')).toEqual([1, 2]);
});

test('applyPlugins modify', () => {
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: {
      foo(memo: object) {
        return { ...memo, a: 1 };
      },
    },
    path: '/foo1.js',
  });
  p.register({
    apply: {
      foo(memo: object, args: { step: number }) {
        return { ...memo, b: 1 + ((args && args.step) || 0) };
      },
    },
    path: '/foo2.js',
  });
  p.register({
    apply: {
      foo: {
        a: 2,
        c: 1,
      },
    },
    path: '/foo3.js',
  });
  expect(
    p.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.modify,
    }),
  ).toEqual({
    a: 2,
    b: 1,
    c: 1,
  });
  expect(
    p.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.modify,
      args: { step: 5 },
    }),
  ).toEqual({
    a: 2,
    b: 6,
    c: 1,
  });
  expect(
    p.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.modify,
      initialValue: { d: 4 },
    }),
  ).toEqual({
    a: 2,
    b: 1,
    c: 1,
    d: 4,
  });
});

test('applyPlugins modify support Promise', async () => {
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: {
      async foo(memo: object, args: object) {
        return { ...memo, a: 1, ...args };
      },
    },
    path: '/foo1.js',
  });
  p.register({
    apply: {
      foo: Promise.resolve({
        b: 1,
        c: 1,
      }),
    },
    path: '/foo3.js',
  });
  p.register({
    apply: {
      foo: {
        d: 1,
      },
    },
    path: '/foo3.js',
  });
  expect(
    await p.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.modify,
      async: true,
      args: {
        e: 1,
      },
    }),
  ).toEqual({
    a: 1,
    b: 1,
    c: 1,
    d: 1,
    e: 1,
  });
});

test('applyPlugins event', () => {
  let count: number;
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: {
      foo(args: { step: number }) {
        count += 1 + ((args && args.step) || 0);
      },
    },
    path: '/foo1.js',
  });
  p.register({
    apply: {
      foo(args: { step: number }) {
        count += 2 + ((args && args.step) || 0);
      },
    },
    path: '/foo2.js',
  });

  count = 0;
  p.applyPlugins({ key: 'foo', type: ApplyPluginsType.event });
  expect(count).toEqual(3);

  count = 0;
  p.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.event,
    args: {
      step: 4,
    },
  });
  expect(count).toEqual(11);
});

test('applyPlugins compose', () => {
  const ret: number[] = [];
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.register({
    apply: {
      foo(memo: Function, args: { step: number }) {
        ret.push(1 + ((args && args.step) || 0));
        memo();
        ret.push(10);
      },
    },
    path: '/foo1.js',
  });
  p.register({
    apply: {
      foo(memo: Function, args: { step: number }) {
        ret.push(2 + ((args && args.step) || 0));
        memo();
        ret.push(20);
        return 'foooo';
      },
    },
    path: '/foo2.js',
  });

  ret.length = 0;
  const applyRet = p.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.compose,
    initialValue() {
      ret.push(5);
    },
  })();
  expect(applyRet).toEqual('foooo');
  expect(ret).toEqual([2, 1, 5, 10, 20]);

  ret.length = 0;
  p.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.compose,
    initialValue() {
      ret.push(5);
    },
    args: {
      step: 4,
    },
  })();
  expect(ret).toEqual([6, 5, 5, 10, 20]);
});

test('applyPlugins compose with only initialValue', () => {
  const ret: number[] = [];
  const p = new Plugin({
    validKeys: ['foo'],
  });
  p.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.compose,
    initialValue() {
      ret.push(5);
    },
  })();
  expect(ret).toEqual([5]);
});
