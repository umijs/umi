import resolveDefine from './resolveDefine';

test('normal', () => {
  expect(
    resolveDefine({
      define: { foo: 'bar' },
    }),
  ).toEqual({
    foo: '"bar"',
    'process.env': {
      NODE_ENV: '"test"',
    },
  });
});

test('env variables', () => {
  process.env.UMI_APP_FOO = 'BAR';
  process.env.APP_FOO = 'BAR';
  expect(
    resolveDefine({
      define: {},
    }),
  ).toEqual({
    'process.env': {
      NODE_ENV: '"test"',
      UMI_APP_FOO: '"BAR"',
    },
  });
});
